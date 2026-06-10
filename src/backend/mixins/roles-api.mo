import RolesTypes "../types/roles";
import RolesLib "../lib/roles";
import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";

// Role-based access control API.
// assignUserRole requires CanManageRoles (PlatformOwner only).
// revokeUserRole requires CanManageRoles or CanManageStaff.
// listUsersByRole and getActivityLog require CanViewDashboard.
// getMyRole is open to any authenticated caller.
// claimOwnership is open to any caller presenting the owner email.
mixin (
  roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
  activityLog : List.List<RolesTypes.ActivityLog>,
  nextLogId : { var value : Nat },
  ownerPrincipal : { var value : ?Principal },
) {
  // ── Owner claim ──────────────────────────────────────────────────────────────
  // Any authenticated user can call this with email = "Chefiyke@gmail.com".
  // If the email matches OWNER_EMAIL, their principal is permanently linked as
  // the Platform Owner. This is the primary mechanism — no first-login logic.
  public shared ({ caller }) func claimOwnership(email : Text) : async RolesTypes.RoleResult {
    if (caller.isAnonymous()) {
      return #err("Anonymous callers cannot claim ownership")
    };
    if (not RolesLib.isOwnerEmail(email)) {
      return #err("Email does not match the registered Platform Owner")
    };
    RolesLib.registerOwnerEmail(roleUsers, ownerPrincipal, caller, Time.now());
    RolesLib.logActivity(
      activityLog,
      nextLogId,
      caller,
      #PlatformOwner,
      "claimOwnership",
      caller.toText(),
      Time.now(),
    );
    #ok("Platform Owner identity confirmed and linked to your principal")
  };

  // ── Role assignment ─────────────────────────────────────────────────────────

  public shared ({ caller }) func assignUserRole(
    target : Principal,
    role : RolesTypes.UserRole,
    email : Text,
    permissions : [RolesTypes.Permission],
  ) : async RolesTypes.RoleResult {
    // Bootstrap owner before enforcing access
    RolesLib.bootstrapOwnerEx(roleUsers, ownerPrincipal, caller, Time.now());
    let result = RolesLib.assignRole(roleUsers, ownerPrincipal, caller, target, role, email, permissions, Time.now());
    switch result {
      case (#ok(_)) {
        RolesLib.logActivity(
          activityLog,
          nextLogId,
          caller,
          RolesLib.getRoleEx(roleUsers, ownerPrincipal, caller) |> (switch _ { case (?r) r; case null #Customer }),
          "assignUserRole",
          target.toText(),
          Time.now(),
        )
      };
      case (#err(_)) {};
    };
    result
  };

  public shared ({ caller }) func revokeUserRole(target : Principal) : async RolesTypes.RoleResult {
    RolesLib.bootstrapOwnerEx(roleUsers, ownerPrincipal, caller, Time.now());
    let result = RolesLib.revokeRole(roleUsers, ownerPrincipal, caller, target);
    switch result {
      case (#ok(_)) {
        RolesLib.logActivity(
          activityLog,
          nextLogId,
          caller,
          RolesLib.getRoleEx(roleUsers, ownerPrincipal, caller) |> (switch _ { case (?r) r; case null #Customer }),
          "revokeUserRole",
          target.toText(),
          Time.now(),
        )
      };
      case (#err(_)) {};
    };
    result
  };

  // ── Role queries ────────────────────────────────────────────────────────────

  public shared ({ caller }) func getUserRole(target : Principal) : async ?RolesTypes.UserRole {
    RolesLib.bootstrapOwnerEx(roleUsers, ownerPrincipal, caller, Time.now());
    RolesLib.requirePermissionEx(roleUsers, ownerPrincipal, caller, #CanViewDashboard);
    RolesLib.getRoleEx(roleUsers, ownerPrincipal, target)
  };

  public shared ({ caller }) func listUsersByRole(role : RolesTypes.UserRole) : async [RolesTypes.StaffUser] {
    RolesLib.bootstrapOwnerEx(roleUsers, ownerPrincipal, caller, Time.now());
    RolesLib.requirePermissionEx(roleUsers, ownerPrincipal, caller, #CanViewDashboard);
    RolesLib.listByRole(roleUsers, role)
  };

  // Any authenticated (non-anonymous) caller can see their own role.
  // Email-based matching means getMyRole() will return PlatformOwner for any
  // principal that has been linked via claimOwnership().
  public shared ({ caller }) func getMyRole() : async ?RolesTypes.UserRole {
    if (caller.isAnonymous()) { return null };
    RolesLib.bootstrapOwnerEx(roleUsers, ownerPrincipal, caller, Time.now());
    RolesLib.getRoleEx(roleUsers, ownerPrincipal, caller)
  };

  // Dedicated ownership confirmation — returns role + isOwnerOrAdmin flag.
  // Use this on admin page load to reliably confirm owner status.
  public shared ({ caller }) func confirmOwnership() : async { role : ?RolesTypes.UserRole; isOwnerOrAdmin : Bool } {
    if (caller.isAnonymous()) {
      return { role = null; isOwnerOrAdmin = false };
    };
    RolesLib.bootstrapOwnerEx(roleUsers, ownerPrincipal, caller, Time.now());
    let role = RolesLib.getRoleEx(roleUsers, ownerPrincipal, caller);
    let isOwnerOrAdmin = switch role {
      case (?#PlatformOwner) { true };
      case (?#Admin) { true };
      case (_) { false };
    };
    { role = role; isOwnerOrAdmin = isOwnerOrAdmin }
  };

  // ── Debug info ───────────────────────────────────────────────────────────────
  // Safe to expose publicly — returns no secrets, only status information.
  // Use this to verify the owner email logic is working correctly.
  public query ({ caller }) func getOwnerDebugInfo() : async {
    ownerEmail : Text;
    callerIsOwner : Bool;
    callerEmail : ?Text;
    callerRole : Text;
  } {
    let ownerEmail = RolesLib.OWNER_EMAIL;
    let callerEmail : ?Text = switch (roleUsers.get(caller)) {
      case (?user) { ?user.email };
      case null { null };
    };
    let callerIsOwner : Bool = switch callerEmail {
      case (?email) { RolesLib.isOwnerEmail(email) };
      case null { false };
    };
    let callerRole : Text = switch (RolesLib.getRoleEx(roleUsers, ownerPrincipal, caller)) {
      case (?#PlatformOwner) { "PlatformOwner" };
      case (?#Admin) { "Admin" };
      case (?#Staff) { "Staff" };
      case (?#Affiliate) { "Affiliate" };
      case (?#Customer) { "Customer" };
      case null { "None (not registered)" };
    };
    {
      ownerEmail;
      callerIsOwner;
      callerEmail;
      callerRole;
    }
  };

  // ── Activity log ────────────────────────────────────────────────────────────

  public shared ({ caller }) func getActivityLog(limit : Nat) : async [RolesTypes.ActivityLog] {
    RolesLib.bootstrapOwnerEx(roleUsers, ownerPrincipal, caller, Time.now());
    RolesLib.requirePermissionEx(roleUsers, ownerPrincipal, caller, #CanViewDashboard);
    let all = activityLog.toArray();
    let size = all.size();
    if (limit == 0 or limit >= size) {
      all
    } else {
      // Return last `limit` entries — guard ensures size > limit so subtraction is safe
      let start : Nat = if (size > limit) { size - limit } else { 0 };
      all.sliceToArray(start, size)
    }
  };
};
