import AuditTypes "../types/audit";
import CommonTypes "../types/common";
import RolesTypes "../types/roles";
import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  // Max ring-buffer size for audit logs
  let MAX_AUDIT_LOGS : Nat = 1000;

  // ── Record an audit log entry (ring buffer, max 1000) ─────────────────────────

  public func recordAuditLog(
    auditLogs : List.List<AuditTypes.AuditLog>,
    nextAuditLogId : { var value : Nat },
    userId : Principal,
    userRole : RolesTypes.UserRole,
    action : AuditTypes.AuditAction,
    resource : Text,
    details : Text,
    ip : ?Text,
  ) {
    let logId = nextAuditLogId.value;
    nextAuditLogId.value += 1;

    auditLogs.add({
      logId;
      userId;
      userRole;
      action;
      resource;
      details;
      timestamp = Time.now();
      ip;
    });

    // Ring buffer enforcement: if over capacity, drop the oldest entry
    if (auditLogs.size() > MAX_AUDIT_LOGS) {
      // Rebuild list keeping only the last MAX_AUDIT_LOGS entries
      let kept = auditLogs.sliceToArray((auditLogs.size() : Int) - (MAX_AUDIT_LOGS : Int), auditLogs.size());
      auditLogs.clear();
      auditLogs.addAll(kept.values())
    }
  };

  // ── Admin: list audit logs (most recent N entries) ────────────────────────────

  public func adminListAuditLogs(
    auditLogs : List.List<AuditTypes.AuditLog>,
    limit : ?Nat,
  ) : [AuditTypes.AuditLog] {
    let total = auditLogs.size();
    let n = switch limit {
      case null { total };
      case (?l) { if (l < total) { l } else { total } };
    };
    // Return the last n entries (most recent)
    let start : Int = total - n;
    auditLogs.sliceToArray(start, total)
  };

  // ── Admin: get current security policy ───────────────────────────────────────

  public func adminGetSecurityPolicy(
    policy : { var value : AuditTypes.SecurityPolicy },
  ) : AuditTypes.SecurityPolicy {
    policy.value
  };

  // ── Admin: update security policy ────────────────────────────────────────────

  public func adminSetSecurityPolicy(
    policy : { var value : AuditTypes.SecurityPolicy },
    newPolicy : AuditTypes.SecurityPolicy,
  ) {
    policy.value := newPolicy
  };

  // ── Track login attempt (brute-force protection) ──────────────────────────────

  public func recordLoginAttempt(
    loginAttempts : Map.Map<Text, AuditTypes.LoginAttempt>,
    key : Text,
    policy : { var value : AuditTypes.SecurityPolicy },
    success : Bool,
  ) : { #allow; #locked : Text } {
    let now = Time.now();

    if (success) {
      // On success, reset any tracked attempts
      loginAttempts.remove(key);
      return #allow
    };

    // Failed attempt — increment counter
    switch (loginAttempts.get(key)) {
      case null {
        loginAttempts.add(key, {
          key;
          var attempts = 1;
          var lastAttempt = now;
          var lockoutUntil : ?CommonTypes.Timestamp = null;
        })
      };
      case (?entry) {
        entry.attempts += 1;
        entry.lastAttempt := now;

        if (entry.attempts >= policy.value.maxLoginAttempts) {
          // Set lockout: lockoutDurationMins converted to nanoseconds
          let lockoutMins : Int = policy.value.lockoutDurationMins;
          let lockoutNs : Int = lockoutMins * 60 * 1_000_000_000;
          entry.lockoutUntil := ?(now + lockoutNs);
          return #locked("Too many failed login attempts. Please try again in " # policy.value.lockoutDurationMins.toText() # " minutes.")
        }
      };
    };

    #allow
  };

  // ── Check if a key is currently locked out ────────────────────────────────────

  public func isLockedOut(
    loginAttempts : Map.Map<Text, AuditTypes.LoginAttempt>,
    key : Text,
  ) : Bool {
    let now = Time.now();
    switch (loginAttempts.get(key)) {
      case null { false };
      case (?entry) {
        switch (entry.lockoutUntil) {
          case null { false };
          case (?until) {
            if (now < until) {
              true
            } else {
              // Lockout expired — clear it
              entry.lockoutUntil := null;
              entry.attempts := 0;
              false
            }
          };
        }
      };
    }
  };
};
