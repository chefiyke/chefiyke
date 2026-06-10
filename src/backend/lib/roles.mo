import Types "../types/roles";
import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";

module {
  // ── Permanent owner identity ─────────────────────────────────────────────────
  // This email is the eternal Platform Owner. It is hardcoded — never detected,
  // never assigned on first login, never overridable.
  public let OWNER_EMAIL : Text = "Chefiyke@gmail.com";

  public func isOwnerEmail(email : Text) : Bool {
    // Case-insensitive match so "chefiyke@gmail.com" and "CHEFIYKE@GMAIL.COM" both work
    email.toLower() == OWNER_EMAIL.toLower()
  };

  // ── Default permission matrix ────────────────────────────────────────────────

  // All permissions for PlatformOwner
  let ALL_PERMISSIONS : [Types.Permission] = [
    #CanManageRoles,
    #CanViewDashboard,
    #CanManageSales,
    #CanManageFinance,
    #CanManageStaff,
    #CanManageTraining,
    #CanEditContent,
    #CanManageLeads,
    #CanManageMedia,
    #CanManageAffiliates,
    #CanViewReports,
    #CanManageSecurity,
    #CanEditContactDetails,
    #CanManagePayments,
    #CanManageBuyerLeads,
    #CanViewAuditLog,
  ];

  // Admin gets everything except CanManageRoles and CanViewAuditLog
  let ADMIN_PERMISSIONS : [Types.Permission] = [
    #CanViewDashboard,
    #CanManageSales,
    #CanManageFinance,
    #CanManageStaff,
    #CanManageTraining,
    #CanEditContent,
    #CanManageLeads,
    #CanManageMedia,
    #CanManageAffiliates,
    #CanViewReports,
    #CanManageSecurity,
    #CanEditContactDetails,
    #CanManagePayments,
    #CanManageBuyerLeads,
  ];

  // Staff manager preset
  let STAFF_MANAGER_PERMISSIONS : [Types.Permission] = [
    #CanViewDashboard,
    #CanEditContent,
    #CanManageTraining,
    #CanManageLeads,
  ];

  // ── Role → default permissions ───────────────────────────────────────────────

  public func defaultPermissionsForRole(role : Types.UserRole) : [Types.Permission] {
    switch role {
      case (#PlatformOwner) { ALL_PERMISSIONS };
      case (#Admin) { ADMIN_PERMISSIONS };
      case (#Staff) { STAFF_MANAGER_PERMISSIONS };
      case (#Affiliate) { [] };
      case (#Customer) { [] };
    }
  };

  // ── Permission equality check ────────────────────────────────────────────────

  func permEqual(a : Types.Permission, b : Types.Permission) : Bool {
    switch (a, b) {
      case (#CanManageRoles, #CanManageRoles) { true };
      case (#CanViewDashboard, #CanViewDashboard) { true };
      case (#CanManageSales, #CanManageSales) { true };
      case (#CanManageFinance, #CanManageFinance) { true };
      case (#CanManageStaff, #CanManageStaff) { true };
      case (#CanManageTraining, #CanManageTraining) { true };
      case (#CanEditContent, #CanEditContent) { true };
      case (#CanManageLeads, #CanManageLeads) { true };
      case (#CanManageMedia, #CanManageMedia) { true };
      case (#CanManageAffiliates, #CanManageAffiliates) { true };
      case (#CanViewReports, #CanViewReports) { true };
      case (#CanManageSecurity, #CanManageSecurity) { true };
      case (#CanEditContactDetails, #CanEditContactDetails) { true };
      case (#CanManagePayments, #CanManagePayments) { true };
      case (#CanManageBuyerLeads, #CanManageBuyerLeads) { true };
      case (#CanViewAuditLog, #CanViewAuditLog) { true };
      case _ { false };
    }
  };

  // ── Email-based owner check ──────────────────────────────────────────────────
  // Returns true if the principal has a StaffUser record whose email is OWNER_EMAIL.
  public func callerEmailIsOwner(
    users : Map.Map<Principal, Types.StaffUser>,
    principal : Principal,
  ) : Bool {
    switch (users.get(principal)) {
      case (?user) { isOwnerEmail(user.email) };
      case null { false };
    }
  };

  // ── Effective role resolution ─────────────────────────────────────────────────
  // Central helper used by all permission/role functions.
  // Priority order:
  //   1. Email matches OWNER_EMAIL → always PlatformOwner
  //   2. Stored role in users map
  //   3. isController() fallback
  func resolveRole(
    users : Map.Map<Principal, Types.StaffUser>,
    principal : Principal,
  ) : ?Types.UserRole {
    switch (users.get(principal)) {
      case (?user) {
        // Email-based owner takes priority over stored role
        if (isOwnerEmail(user.email)) { ?#PlatformOwner } else { ?user.role }
      };
      case null {
        if (principal.isController()) { ?#PlatformOwner } else { null }
      };
    }
  };

  // ── Core permission check ────────────────────────────────────────────────────

  public func roleHasPermission(role : Types.UserRole, perm : Types.Permission) : Bool {
    let perms = defaultPermissionsForRole(role);
    perms.find(func(p : Types.Permission) : Bool { permEqual(p, perm) }) != null
  };

  // Standard permission check (used by all non-roles mixins)
  public func userHasPermission(
    users : Map.Map<Principal, Types.StaffUser>,
    principal : Principal,
    perm : Types.Permission,
  ) : Bool {
    switch (users.get(principal)) {
      case null {
        if (principal.isController()) { true } else { false }
      };
      case (?user) {
        // Email-based owner always has all permissions
        if (isOwnerEmail(user.email)) { return true };
        let hasExplicit = user.permissions.find(func(p : Types.Permission) : Bool {
          permEqual(p, perm)
        }) != null;
        if (hasExplicit) { return true };
        roleHasPermission(user.role, perm)
      };
    }
  };

  // Extended permission check — email match takes highest priority.
  // ownerPrincipal is kept for legacy compatibility but email check runs first.
  public func userHasPermissionEx(
    users : Map.Map<Principal, Types.StaffUser>,
    ownerPrincipal : { var value : ?Principal },
    principal : Principal,
    perm : Types.Permission,
  ) : Bool {
    switch (users.get(principal)) {
      case null {
        // Stored owner principal check (legacy fallback)
        switch (ownerPrincipal.value) {
          case (?op) { if (principal == op) { return true } };
          case null {};
        };
        if (principal.isController()) { true } else { false }
      };
      case (?user) {
        // Email-based owner always has all permissions — checked first
        if (isOwnerEmail(user.email)) { return true };
        let hasExplicit = user.permissions.find(func(p : Types.Permission) : Bool {
          permEqual(p, perm)
        }) != null;
        if (hasExplicit) { return true };
        roleHasPermission(user.role, perm)
      };
    }
  };

  // ── Require permission (traps if not authorized) ─────────────────────────────

  public func requirePermission(
    users : Map.Map<Principal, Types.StaffUser>,
    caller : Principal,
    perm : Types.Permission,
  ) {
    if (not userHasPermission(users, caller, perm)) {
      Runtime.trap("Access denied: insufficient permissions")
    }
  };

  public func requirePermissionEx(
    users : Map.Map<Principal, Types.StaffUser>,
    ownerPrincipal : { var value : ?Principal },
    caller : Principal,
    perm : Types.Permission,
  ) {
    if (not userHasPermissionEx(users, ownerPrincipal, caller, perm)) {
      Runtime.trap("Access denied: insufficient permissions")
    }
  };

  // ── Role management ──────────────────────────────────────────────────────────

  public func getRole(
    users : Map.Map<Principal, Types.StaffUser>,
    principal : Principal,
  ) : ?Types.UserRole {
    resolveRole(users, principal)
  };

  // Extended getRole — also checks stored ownerPrincipal; used by roles-api.mo
  public func getRoleEx(
    users : Map.Map<Principal, Types.StaffUser>,
    ownerPrincipal : { var value : ?Principal },
    principal : Principal,
  ) : ?Types.UserRole {
    switch (users.get(principal)) {
      case (?user) {
        // Email-based owner takes absolute priority
        if (isOwnerEmail(user.email)) { return ?#PlatformOwner };
        ?user.role
      };
      case null {
        // Legacy: check stored owner principal
        switch (ownerPrincipal.value) {
          case (?op) {
            if (principal == op) { return ?#PlatformOwner }
          };
          case null {};
        };
        if (principal.isController()) { ?#PlatformOwner } else { null }
      };
    }
  };

  public func assignRole(
    users : Map.Map<Principal, Types.StaffUser>,
    ownerPrincipal : { var value : ?Principal },
    caller : Principal,
    target : Principal,
    role : Types.UserRole,
    email : Text,
    permissions : [Types.Permission],
    nowNanos : Int,
  ) : Types.RoleResult {
    // Only principals with CanManageRoles may assign roles
    if (not userHasPermissionEx(users, ownerPrincipal, caller, #CanManageRoles)) {
      return #err("Access denied: CanManageRoles required")
    };
    // If the email matches OWNER_EMAIL, force role to PlatformOwner regardless of what was requested
    let effectiveRole : Types.UserRole = if (isOwnerEmail(email)) {
      #PlatformOwner
    } else {
      // Prevent manually assigning PlatformOwner to non-owner emails
      switch role {
        case (#PlatformOwner) {
          return #err("Invalid role assignment")
        };
        case _ { role };
      }
    };
    let effectivePerms = if (isOwnerEmail(email)) {
      ALL_PERMISSIONS
    } else if (permissions.size() == 0) {
      defaultPermissionsForRole(effectiveRole)
    } else {
      permissions
    };
    users.add(
      target,
      {
        id = target;
        role = effectiveRole;
        email;
        permissions = effectivePerms;
        status = #active;
        invitedAt = nowNanos;
        lastLoginAt = null;
      },
    );
    #ok("Role assigned successfully")
  };

  public func revokeRole(
    users : Map.Map<Principal, Types.StaffUser>,
    ownerPrincipal : { var value : ?Principal },
    caller : Principal,
    target : Principal,
  ) : Types.RoleResult {
    // Prevent revoking the owner email user
    switch (users.get(target)) {
      case (?u) {
        if (isOwnerEmail(u.email)) {
          return #err("Cannot revoke the Platform Owner's role")
        }
      };
      case null {};
    };
    let canRevoke = userHasPermissionEx(users, ownerPrincipal, caller, #CanManageRoles) or userHasPermissionEx(users, ownerPrincipal, caller, #CanManageStaff);
    if (not canRevoke) {
      return #err("Access denied: CanManageRoles or CanManageStaff required")
    };
    users.remove(target);
    #ok("Role revoked successfully")
  };

  public func listByRole(
    users : Map.Map<Principal, Types.StaffUser>,
    role : Types.UserRole,
  ) : [Types.StaffUser] {
    users.values().filter(func(u : Types.StaffUser) : Bool {
      // Compute effective role (email override) for listing
      let effectiveRole : Types.UserRole = if (isOwnerEmail(u.email)) {
        #PlatformOwner
      } else {
        u.role
      };
      switch (effectiveRole, role) {
        case (#PlatformOwner, #PlatformOwner) { true };
        case (#Admin, #Admin) { true };
        case (#Staff, #Staff) { true };
        case (#Affiliate, #Affiliate) { true };
        case (#Customer, #Customer) { true };
        case _ { false };
      }
    }).toArray()
  };

  // ── Activity logging ─────────────────────────────────────────────────────────

  public func logActivity(
    activityLog : List.List<Types.ActivityLog>,
    nextLogId : { var value : Nat },
    actorPrincipal : Principal,
    actorRole : Types.UserRole,
    action : Text,
    target : Text,
    nowNanos : Int,
  ) {
    let id = nextLogId.value;
    nextLogId.value += 1;
    activityLog.add({
      id = id.toText();
      actorId = actorPrincipal;
      actorRole;
      action;
      target;
      timestamp = nowNanos;
      ipAddress = null;
    })
  };

  // ── Bootstrap ────────────────────────────────────────────────────────────────
  // The email-based owner identity means bootstrap is purely for setting up
  // the principal<->email link. We no longer use first-login assignment.

  // Standard bootstrap — used by non-roles mixins
  public func bootstrapOwnerIfNeeded(
    users : Map.Map<Principal, Types.StaffUser>,
    caller : Principal,
    nowNanos : Int,
  ) {
    if (caller.isController() and users.get(caller) == null) {
      users.add(
        caller,
        {
          id = caller;
          role = #PlatformOwner;
          email = "";
          permissions = ALL_PERMISSIONS;
          status = #active;
          invitedAt = nowNanos;
          lastLoginAt = null;
        },
      )
    }
  };

  // Extended bootstrap — email-first approach.
  // No longer assigns PlatformOwner based on "first non-anonymous caller".
  // Instead: if caller is a controller, create their record (so they can then
  // call assignUserRole to link their II principal to the owner email).
  // Callers whose stored email matches OWNER_EMAIL are always treated as
  // PlatformOwner by the permission/role functions — no special bootstrap needed.
  public func bootstrapOwnerEx(
    users : Map.Map<Principal, Types.StaffUser>,
    ownerPrincipal : { var value : ?Principal },
    caller : Principal,
    nowNanos : Int,
  ) {
    // Controller path: store as PlatformOwner (keeps backward compat for canister controller)
    if (caller.isController() and users.get(caller) == null) {
      ownerPrincipal.value := ?caller;
      users.add(
        caller,
        {
          id = caller;
          role = #PlatformOwner;
          email = "";
          permissions = ALL_PERMISSIONS;
          status = #active;
          invitedAt = nowNanos;
          lastLoginAt = null;
        },
      )
    }
    // NOTE: The old "first non-anonymous caller" path is intentionally removed.
    // Owner identity is now determined solely by the OWNER_EMAIL constant.
    // Any principal who registers with email = OWNER_EMAIL will automatically
    // receive PlatformOwner treatment from all permission checks.
  };

  // ── Owner registration ────────────────────────────────────────────────────────
  // Called by roles-api when the owner logs in with their email.
  // Upserts the caller's StaffUser record with OWNER_EMAIL, ensuring the
  // permission/role checks recognise them as PlatformOwner immediately.
  public func registerOwnerEmail(
    users : Map.Map<Principal, Types.StaffUser>,
    ownerPrincipal : { var value : ?Principal },
    caller : Principal,
    nowNanos : Int,
  ) {
    ownerPrincipal.value := ?caller;
    // Upsert: preserve lastLoginAt if record exists, otherwise create fresh
    let existing = users.get(caller);
    let lastLogin : ?Int = switch existing {
      case (?u) { u.lastLoginAt };
      case null { null };
    };
    users.add(
      caller,
      {
        id = caller;
        role = #PlatformOwner;
        email = OWNER_EMAIL;
        permissions = ALL_PERMISSIONS;
        status = #active;
        invitedAt = nowNanos;
        lastLoginAt = lastLogin;
      },
    )
  };
};
