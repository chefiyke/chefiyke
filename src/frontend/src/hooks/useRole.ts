import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { createActor } from "../backend";
import { Permission, UserRole } from "../backend.d";

export type { UserRole, Permission };

/** The permanent platform owner email — set at project creation time */
export const OWNER_EMAIL = "Chefiyke@gmail.com";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.PlatformOwner]: Object.values(Permission),
  [UserRole.Admin]: [
    Permission.CanViewDashboard,
    Permission.CanViewReports,
    Permission.CanManageRoles,
    Permission.CanManageTraining,
    Permission.CanManageMedia,
    Permission.CanManageSecurity,
    Permission.CanManageLeads,
    Permission.CanManageSales,
    Permission.CanManageFinance,
    Permission.CanManageStaff,
    Permission.CanEditContent,
    Permission.CanManageAffiliates,
  ],
  [UserRole.Staff]: [
    Permission.CanViewDashboard,
    Permission.CanManageLeads,
    Permission.CanManageSales,
  ],
  [UserRole.Affiliate]: [],
  [UserRole.Customer]: [],
};

export interface OwnerDebugInfo {
  ownerEmail: string;
  callerIsOwner: boolean;
  callerEmail: string;
  callerRole: string;
}

export interface UseRoleResult {
  role: UserRole | null;
  permissions: Permission[];
  isOwner: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isAffiliate: boolean;
  isLoading: boolean;
  /** True while auto-claim of ownership is in progress */
  isClaiming: boolean;
  /** True if the user is connected via Internet Identity */
  isAuthenticated: boolean;
  /** True while II is still initialising (before we know auth state) */
  isInitializing: boolean;
  /**
   * True when confirmOwnership() returns isOwnerOrAdmin = true OR
   * when role === PlatformOwner. This is the authoritative "is this the owner" flag.
   */
  isOwnerEmail: boolean;
  /** Debug info for the owner panel */
  ownerDebugInfo: OwnerDebugInfo;
  /** Non-null if a role/ownership query failed — components can surface a message instead of going blank */
  error: string | null;
}

export function useRole(): UseRoleResult {
  const { isAuthenticated, isInitializing } = useInternetIdentity();
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();

  /** Track whether we've already attempted claimOwnership this session */
  const claimAttempted = useRef(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const {
    data: role = null,
    isLoading: isChecking,
    isError: roleError,
  } = useQuery<UserRole | null>({
    queryKey: ["myRole", isAuthenticated],
    queryFn: async () => {
      if (!actor || !isAuthenticated) return null;
      try {
        const result = await actor.getMyRole();
        return result ?? null;
      } catch {
        return null;
      }
    },
    enabled: isAuthenticated && !isFetching && !isInitializing,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  /**
   * confirmOwnership() is the backend's authoritative owner check.
   * It returns {isOwnerOrAdmin, role?} — we use this to determine
   * whether the caller is the platform owner, independently of the role fetch.
   */
  const {
    data: ownerConfirm,
    isLoading: isOwnerChecking,
    isError: ownerError,
  } = useQuery<{
    isOwnerOrAdmin: boolean;
    role?: UserRole;
  }>({
    queryKey: ["ownerConfirm", isAuthenticated],
    queryFn: async () => {
      if (!actor || !isAuthenticated) return { isOwnerOrAdmin: false };
      try {
        return await actor.confirmOwnership();
      } catch {
        return { isOwnerOrAdmin: false };
      }
    },
    enabled: isAuthenticated && !isFetching && !isInitializing,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  /**
   * AUTO-CLAIM OWNERSHIP
   *
   * If the user is authenticated but confirmOwnership() returned false,
   * silently call claimOwnership(OWNER_EMAIL). The backend will only accept
   * this call if the caller is the genuine owner. On success, we invalidate
   * both queries so they refetch with the now-linked principal.
   *
   * This runs at most once per session (claimAttempted ref guard) and only
   * after all initial loading has settled — so we never interrupt a render.
   */
  useEffect(() => {
    const queriesSettled =
      !isChecking && !isOwnerChecking && !isFetching && !isInitializing;
    const alreadyOwner =
      ownerConfirm?.isOwnerOrAdmin || role === UserRole.PlatformOwner;

    if (
      isAuthenticated &&
      queriesSettled &&
      !alreadyOwner &&
      !claimAttempted.current &&
      actor
    ) {
      claimAttempted.current = true;
      setIsClaiming(true);

      actor
        .claimOwnership(OWNER_EMAIL)
        .then(() => {
          // Invalidate so confirmOwnership and getMyRole refetch with updated principal
          queryClient.invalidateQueries({ queryKey: ["ownerConfirm"] });
          queryClient.invalidateQueries({ queryKey: ["myRole"] });
        })
        .catch(() => {
          // Claim failed — caller is not the owner, access denied will show
        })
        .finally(() => {
          setIsClaiming(false);
        });
    }
  }, [
    isAuthenticated,
    isChecking,
    isOwnerChecking,
    isFetching,
    isInitializing,
    ownerConfirm,
    role,
    actor,
    queryClient,
  ]);

  // Reset claim guard when user logs out so next login gets a fresh attempt
  useEffect(() => {
    if (!isAuthenticated) {
      claimAttempted.current = false;
    }
  }, [isAuthenticated]);

  const isLoading =
    isInitializing || (isAuthenticated && (isChecking || isOwnerChecking));
  const permissions = role ? (ROLE_PERMISSIONS[role] ?? []) : [];

  // isOwnerEmail is true when backend confirms ownership OR role is explicitly PlatformOwner
  const isOwnerEmail =
    (ownerConfirm?.isOwnerOrAdmin ?? false) || role === UserRole.PlatformOwner;

  // Resolve the effective role — prefer the confirmed role from confirmOwnership if available
  const effectiveRole = role ?? ownerConfirm?.role ?? null;

  const ownerDebugInfo: OwnerDebugInfo = {
    ownerEmail: OWNER_EMAIL,
    callerIsOwner: isOwnerEmail,
    callerEmail: isOwnerEmail ? OWNER_EMAIL : "(not owner)",
    callerRole: effectiveRole ?? "none",
  };

  // Surface errors from either query so AuthGate can show a message
  const error =
    roleError || ownerError ? "Failed to load role data from backend." : null;

  return {
    role: effectiveRole,
    permissions,
    isOwner: effectiveRole === UserRole.PlatformOwner || isOwnerEmail,
    isAdmin:
      isOwnerEmail ||
      effectiveRole === UserRole.PlatformOwner ||
      effectiveRole === UserRole.Admin,
    isStaff:
      isOwnerEmail ||
      effectiveRole === UserRole.PlatformOwner ||
      effectiveRole === UserRole.Admin ||
      effectiveRole === UserRole.Staff,
    isAffiliate: effectiveRole === UserRole.Affiliate,
    isLoading,
    isClaiming,
    isAuthenticated,
    isInitializing,
    isOwnerEmail,
    ownerDebugInfo,
    error,
  };
}
