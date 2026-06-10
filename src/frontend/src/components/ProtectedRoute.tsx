import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Shield, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import type { UserRole } from "../backend.d";
import { useRole } from "../hooks/useRole";

const CLAIM_TIMEOUT_MS = 15_000;

interface ProtectedRouteProps {
  requiredRoles: UserRole[];
  children: React.ReactNode;
}

export function ProtectedRoute({
  requiredRoles,
  children,
}: ProtectedRouteProps) {
  const { isAuthenticated, isInitializing, login } = useInternetIdentity();
  const { role, isLoading, isOwnerEmail, isClaiming } = useRole();
  const [claimTimedOut, setClaimTimedOut] = useState(false);

  // Proper access check: owner email always has access; others need an explicit role match
  const hasRoleAccess = role !== null && requiredRoles.includes(role);
  const hasAccess = isOwnerEmail || hasRoleAccess;

  // If the claim is taking too long, surface a timeout error with a retry button
  useEffect(() => {
    if (!isClaiming) {
      setClaimTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setClaimTimedOut(true), CLAIM_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isClaiming]);

  // Still initialising II or fetching the role — show skeleton, never redirect
  if (isInitializing || isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col gap-4 p-8 items-center justify-center">
        <Skeleton className="h-16 w-full max-w-md" />
        <Skeleton className="h-48 w-full max-w-md" />
        <Skeleton className="h-12 w-full max-w-md" />
        <p className="font-body text-sm text-muted-foreground mt-2">
          Verifying access…
        </p>
      </div>
    );
  }

  // Not authenticated — show login prompt
  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center px-4"
        data-ocid="protected.login_prompt"
      >
        <div className="max-w-md w-full text-center space-y-6 bg-card border border-border rounded-2xl p-10 shadow-card">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Access Restricted
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              This area requires authentication. Please sign in with Internet
              Identity to continue.
            </p>
          </div>
          <Button
            onClick={() => login()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            data-ocid="protected.login_button"
          >
            Sign In with Internet Identity
          </Button>
          <p className="text-xs text-muted-foreground">
            Your identity is secure and private.
          </p>
        </div>
      </div>
    );
  }

  /**
   * Auto-claim in progress — the owner's principal is being linked to
   * Chefiyke@gmail.com in the backend for the first time. Show a connecting
   * state instead of "Access Denied" so the owner never sees a rejection screen.
   * After CLAIM_TIMEOUT_MS, show an error with a retry button.
   */
  if (isClaiming) {
    if (claimTimedOut) {
      return (
        <div
          className="min-h-screen bg-background flex items-center justify-center px-4"
          data-ocid="protected.claim_timeout_state"
        >
          <div className="max-w-md w-full text-center space-y-6 bg-card border border-border rounded-2xl p-10 shadow-card">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <Shield className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Connection Timeout
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Unable to connect to your Virtual Office. Please check your
                connection and try again.
              </p>
            </div>
            <Button
              onClick={() => {
                setClaimTimedOut(false);
                window.location.reload();
              }}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              data-ocid="protected.claim_retry_button"
            >
              Retry
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center px-4"
        data-ocid="protected.claiming_state"
      >
        <div className="max-w-md w-full text-center space-y-6 bg-card border border-border rounded-2xl p-10 shadow-card">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Connecting to your Virtual Office…
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Verifying owner credentials, please wait a moment.
            </p>
          </div>
          <div className="flex justify-center gap-2">
            <Skeleton className="h-2 w-16 rounded-full" />
            <Skeleton className="h-2 w-10 rounded-full" />
            <Skeleton className="h-2 w-16 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // Authenticated but insufficient role — show access denied rather than blank
  if (!hasAccess) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center px-4"
        data-ocid="protected.access_denied"
      >
        <div className="max-w-md w-full text-center space-y-6 bg-card border border-border rounded-2xl p-10 shadow-card">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Access Denied
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your account does not have permission to access this area.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
