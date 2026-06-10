import CommonTypes "common";
import RolesTypes "roles";

module {
  // ── Audit action variants ────────────────────────────────────────────────────

  public type AuditAction = {
    #Create;
    #Update;
    #Delete;
    #Approve;
    #Reject;
    #Login;
    #Logout;
    #AccessDenied;
  };

  // ── Full audit log entry ─────────────────────────────────────────────────────

  public type AuditLog = {
    logId : Nat;
    userId : Principal;
    userRole : RolesTypes.UserRole;
    action : AuditAction;
    resource : Text; // e.g. "PaymentOrder:42", "ContactDetails", "BuyerLead:7"
    details : Text;
    timestamp : CommonTypes.Timestamp;
    ip : ?CommonTypes.IpAddress;
  };

  // ── Login attempt tracking (brute-force protection) ──────────────────────────

  public type LoginAttempt = {
    key : Text; // principal text or IP address
    var attempts : Nat;
    var lastAttempt : CommonTypes.Timestamp;
    var lockoutUntil : ?CommonTypes.Timestamp;
  };

  // ── Security policy (admin-configurable) ────────────────────────────────────

  public type SecurityPolicy = {
    maxLoginAttempts : Nat;
    lockoutDurationMins : Nat;
    sessionTimeoutMins : Nat;
    rateLimitPerMin : Nat;
    rateLimitPublicPerMin : Nat;
  };
};
