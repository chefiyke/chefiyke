import CommonTypes "common";

module {
  // ── Role hierarchy ──────────────────────────────────────────────────────────

  public type UserRole = {
    #PlatformOwner; // Full access to everything
    #Admin; // All permissions except CanManageRoles
    #Staff; // Scoped permissions per assignment
    #Affiliate; // Own affiliate dashboard only
    #Customer; // Public access only
  };

  // ── Granular permissions ────────────────────────────────────────────────────

  public type Permission = {
    #CanManageRoles;
    #CanViewDashboard;
    #CanManageSales;
    #CanManageFinance;
    #CanManageStaff;
    #CanManageTraining;
    #CanEditContent;
    #CanManageLeads;
    #CanManageMedia;
    #CanManageAffiliates;
    #CanViewReports;
    #CanManageSecurity;
    #CanEditContactDetails;
    #CanManagePayments;
    #CanManageBuyerLeads;
    #CanViewAuditLog;
  };

  // ── User record ─────────────────────────────────────────────────────────────

  public type StaffUser = {
    id : Principal;
    role : UserRole;
    email : Text;
    permissions : [Permission];
    status : { #active; #inactive; #pending };
    invitedAt : CommonTypes.Timestamp;
    lastLoginAt : ?CommonTypes.Timestamp;
  };

  // ── Activity log ────────────────────────────────────────────────────────────

  public type ActivityLog = {
    id : Text;
    actorId : Principal;
    actorRole : UserRole;
    action : Text;
    target : Text;
    timestamp : CommonTypes.Timestamp;
    ipAddress : ?CommonTypes.IpAddress;
  };

  // ── Result type ─────────────────────────────────────────────────────────────

  public type RoleResult = { #ok : Text; #err : Text };
};
