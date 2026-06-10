import AuditTypes "../types/audit";
import RolesTypes "../types/roles";
import AuditLib "../lib/audit";
import RolesLib "../lib/roles";
import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";

mixin (
  auditLogs : List.List<AuditTypes.AuditLog>,
  nextAuditLogId : { var value : Nat },
  loginAttempts : Map.Map<Text, AuditTypes.LoginAttempt>,
  securityPolicy : { var value : AuditTypes.SecurityPolicy },
  roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
  activityLog : List.List<RolesTypes.ActivityLog>,
  nextLogId : { var value : Nat },
) {
  // ── Admin: list audit logs (last N entries) ────────────────────────────────────

  public shared ({ caller }) func adminListAuditLogs(
    limit : ?Nat
  ) : async [AuditTypes.AuditLog] {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanViewAuditLog);
    AuditLib.adminListAuditLogs(auditLogs, limit)
  };

  // ── Admin: get current security policy ────────────────────────────────────────

  public shared ({ caller }) func adminGetSecurityPolicy() : async AuditTypes.SecurityPolicy {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManagePayments);
    AuditLib.adminGetSecurityPolicy(securityPolicy)
  };

  // ── Admin: update security policy ─────────────────────────────────────────────

  public shared ({ caller }) func adminSetSecurityPolicy(
    newPolicy : AuditTypes.SecurityPolicy
  ) : async { #ok : Text; #err : Text } {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManagePayments);
    AuditLib.adminSetSecurityPolicy(securityPolicy, newPolicy);
    let role = switch (RolesLib.getRole(roleUsers, caller)) {
      case (?r) { r };
      case null { #Customer };
    };
    AuditLib.recordAuditLog(
      auditLogs,
      nextAuditLogId,
      caller,
      role,
      #Update,
      "SecurityPolicy",
      "Security policy updated",
      null,
    );
    #ok("Security policy updated successfully")
  };
};
