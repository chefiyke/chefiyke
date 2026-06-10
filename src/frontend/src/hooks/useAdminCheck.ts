import { useRole } from "./useRole";

/**
 * Legacy hook — now backed by useRole().
 * Returns isAdmin = true when the user is PlatformOwner or Admin.
 */
export function useAdminCheck(): { isAdmin: boolean; isLoading: boolean } {
  const { isAdmin, isLoading } = useRole();
  return { isAdmin, isLoading };
}
