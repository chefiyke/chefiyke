import SecurityTypes "../types/security";
import RolesTypes "../types/roles";
import SecurityLib "../lib/security";
import RolesLib "../lib/roles";
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

// Public API for security/firewall management.
// All admin functions require CanManageSecurity permission (enforced via RBAC).
mixin (
  blockedKeys : Map.Map<Text, SecurityTypes.BlockEntry>,
  rateLimits : Map.Map<Text, SecurityTypes.RateLimitEntry>,
  roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
  activityLog : List.List<RolesTypes.ActivityLog>,
  nextLogId : { var value : Nat },
) {
  // ── Admin: firewall management ──────────────────────────────────────────────

  // List all currently blocked keys
  public shared ({ caller }) func adminGetBlockedKeys() : async [SecurityTypes.BlockEntry] {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageSecurity);
    SecurityLib.getBlockedKeys(blockedKeys)
  };

  // Manually block a key
  public shared ({ caller }) func adminBlockKey(key : Text, reason : Text) : async () {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageSecurity);
    SecurityLib.blockKey(blockedKeys, key, reason, Time.now());
    RolesLib.logActivity(activityLog, nextLogId, caller, RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }), "adminBlockKey", key, Time.now())
  };

  // Unblock a key
  public shared ({ caller }) func adminUnblockKey(key : Text) : async () {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageSecurity);
    SecurityLib.unblockKey(blockedKeys, key);
    RolesLib.logActivity(activityLog, nextLogId, caller, RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }), "adminUnblockKey", key, Time.now())
  };
};
