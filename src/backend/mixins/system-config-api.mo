import ContentAndMediaTypes "../types/content-and-media";
import RolesTypes "../types/roles";
import RolesLib "../lib/roles";
import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";

// Mixin exposing SYSTEM_CONFIG — the single source of truth for all editable
// frontend content — plus version/deployment tracking.
mixin (
  systemConfig : { var value : ContentAndMediaTypes.SystemConfig },
  buildVersion : { var value : Nat },
  lastDeployedAt : { var value : Int },
  deploymentLog : List.List<ContentAndMediaTypes.DeploymentEntry>,
  roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
  activityLog : List.List<RolesTypes.ActivityLog>,
  nextLogId : { var value : Nat },
) {
  // ── Public queries (display-only) ───────────────────────────────────────────

  /// Return the full system config for public frontend rendering.
  public query func getSystemConfig() : async ContentAndMediaTypes.SystemConfig {
    systemConfig.value
  };

  /// Return version information for display (header, footer, admin panel).
  public query func getVersionInfo() : async ContentAndMediaTypes.VersionInfo {
    {
      buildVersion = buildVersion.value;
      lastDeployedAt = lastDeployedAt.value;
      systemVersion = "v" # buildVersion.value.toText();
      environment = systemConfig.value.environment;
    }
  };

  // ── Admin mutations (CanEditContent required) ───────────────────────────────

  /// Overwrite the full system config. Only owner / CanEditContent admins.
  public shared ({ caller }) func adminUpdateSystemConfig(
    cfg : ContentAndMediaTypes.SystemConfig
  ) : async { #ok; #err : Text } {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    if (not RolesLib.userHasPermission(roleUsers, caller, #CanEditContent)) {
      return #err("Access denied: CanEditContent required")
    };
    systemConfig.value := cfg;
    RolesLib.logActivity(
      activityLog, nextLogId, caller,
      RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }),
      "adminUpdateSystemConfig", "systemConfig", Time.now()
    );
    #ok
  };

  /// Return the deployment log (admin only).
  public shared ({ caller }) func adminGetDeploymentLog() : async [ContentAndMediaTypes.DeploymentEntry] {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    if (not RolesLib.userHasPermission(roleUsers, caller, #CanViewDashboard)) {
      return []
    };
    deploymentLog.toArray()
  };
};
