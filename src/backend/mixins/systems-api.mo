import SystemsTypes "../types/systems";
import RolesTypes "../types/roles";
import RolesLib "../lib/roles";
import SystemsLib "../lib/systems";
import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";

mixin (
  systemsApps : List.List<SystemsTypes.SystemApp>,
  roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
  activityLog : List.List<RolesTypes.ActivityLog>,
  nextLogId : { var value : Nat },
) {
  // ── Public: visible apps (frontend) ─────────────────────────────────────────

  public query func getSystemsApps() : async [SystemsTypes.SystemApp] {
    SystemsLib.getVisibleApps(systemsApps)
  };

  // ── Admin: all apps (includes hidden) ───────────────────────────────────────

  public shared ({ caller }) func adminGetSystemsApps() : async [SystemsTypes.SystemApp] {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    SystemsLib.getAllApps(systemsApps)
  };

  // ── Admin: add app ───────────────────────────────────────────────────────

  public shared ({ caller }) func adminAddSystemApp(
    name : Text,
    description : Text,
    url : Text,
  ) : async { #ok : SystemsTypes.SystemApp; #err : Text } {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    if (not RolesLib.userHasPermission(roleUsers, caller, #CanEditContent)) {
      return #err("Access denied: CanEditContent permission required")
    };
    let app = SystemsLib.addApp(
      systemsApps,
      roleUsers,
      activityLog,
      nextLogId,
      caller,
      name,
      description,
      url,
    );
    #ok(app)
  };

  // ── Admin: edit app ─────────────────────────────────────────────────────────

  public shared ({ caller }) func adminEditSystemApp(
    id : Text,
    name : Text,
    description : Text,
    url : Text,
  ) : async { #ok : Text; #err : Text } {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    if (not RolesLib.userHasPermission(roleUsers, caller, #CanEditContent)) {
      return #err("Access denied: CanEditContent permission required")
    };
    SystemsLib.editApp(
      systemsApps,
      roleUsers,
      activityLog,
      nextLogId,
      caller,
      id,
      name,
      description,
      url,
    );
    #ok("System app updated successfully")
  };

  // ── Admin: toggle visibility ──────────────────────────────────────────────────

  public shared ({ caller }) func adminToggleSystemApp(
    id : Text
  ) : async { #ok : Bool; #err : Text } {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    if (not RolesLib.userHasPermission(roleUsers, caller, #CanEditContent)) {
      return #err("Access denied: CanEditContent permission required")
    };
    let newState = SystemsLib.toggleAppVisibility(
      systemsApps,
      roleUsers,
      activityLog,
      nextLogId,
      caller,
      id,
    );
    #ok(newState)
  };

  // ── Admin: delete app ─────────────────────────────────────────────────────────

  public shared ({ caller }) func adminDeleteSystemApp(
    id : Text
  ) : async { #ok : Text; #err : Text } {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    if (not RolesLib.userHasPermission(roleUsers, caller, #CanEditContent)) {
      return #err("Access denied: CanEditContent permission required")
    };
    SystemsLib.deleteApp(
      systemsApps,
      roleUsers,
      activityLog,
      nextLogId,
      caller,
      id,
    );
    #ok("System app deleted successfully")
  };
};
