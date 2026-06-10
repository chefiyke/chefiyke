import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { AffiliateProfile } from "../backend.d";
import { useRole } from "./useRole";

/**
 * Returns whether the currently authenticated user is a registered affiliate.
 * Combines role check (fast) with profile fetch for the full profile object.
 */
export function useAffiliateCheck(): {
  isAffiliate: boolean;
  profile: AffiliateProfile | null;
  isLoading: boolean;
} {
  const { isAffiliate: roleIsAffiliate, isLoading: roleLoading } = useRole();
  const { isAuthenticated, isInitializing } = useInternetIdentity();
  const { actor, isFetching } = useActor(createActor);

  const { data: profile = null, isLoading: profileLoading } =
    useQuery<AffiliateProfile | null>({
      queryKey: ["affiliateProfile", isAuthenticated],
      queryFn: async () => {
        if (!actor || !isAuthenticated) return null;
        try {
          const result = await actor.affiliateGetProfile();
          return result as AffiliateProfile;
        } catch {
          return null;
        }
      },
      enabled:
        roleIsAffiliate && !isFetching && !isInitializing && isAuthenticated,
      staleTime: 5 * 60 * 1000,
      retry: false,
    });

  const isLoading = roleLoading || (roleIsAffiliate && profileLoading);

  return {
    isAffiliate: roleIsAffiliate,
    profile,
    isLoading,
  };
}
