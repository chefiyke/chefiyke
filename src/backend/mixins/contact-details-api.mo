import ContactDetailsTypes "../types/contact-details";
import RolesTypes "../types/roles";
import RolesLib "../lib/roles";
import ContactDetailsLib "../lib/contact-details";
import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";

mixin (
  contactDetails : { var value : ContactDetailsTypes.ContactDetails },
  contactManager : { var value : ContactDetailsTypes.ContactManagerData },
  roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
  activityLog : List.List<RolesTypes.ActivityLog>,
  nextLogId : { var value : Nat },
) {
  // ── Public: visible platforms (frontend consumption) ──────────────────────────

  public query func getContactPlatforms() : async [ContactDetailsTypes.ContactPlatform] {
    ContactDetailsLib.getVisibleContactPlatforms(contactManager)
  };

  // ── Admin: full platform list (editing) ─────────────────────────────────────

  public shared ({ caller }) func adminGetAllContactPlatforms() : async [ContactDetailsTypes.ContactPlatform] {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanEditContactDetails);
    ContactDetailsLib.getAllContactPlatforms(contactManager)
  };

  public shared ({ caller }) func adminSetContactPlatforms(
    platforms : [ContactDetailsTypes.ContactPlatform]
  ) : async { #ok : Text; #err : Text } {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanEditContactDetails);
    let role = switch (RolesLib.getRole(roleUsers, caller)) {
      case (?r) { r };
      case null { #Customer };
    };
    ContactDetailsLib.setContactPlatforms(contactManager, platforms);
    RolesLib.logActivity(activityLog, nextLogId, caller, role, "SetContactPlatforms", "ContactManager", 0);
    #ok("Contact platforms updated successfully")
  };

  public shared ({ caller }) func adminTogglePlatformVisibility(
    id : Text
  ) : async { #ok : Bool; #err : Text } {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanEditContactDetails);
    let newState = ContactDetailsLib.togglePlatformVisibility(contactManager, id);
    #ok(newState)
  };

  public shared ({ caller }) func adminReorderPlatform(
    id : Text,
    newOrder : Nat,
  ) : async { #ok : Text; #err : Text } {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanEditContactDetails);
    ContactDetailsLib.reorderPlatform(contactManager, id, newOrder);
    #ok("Platform order updated successfully")
  };

  // ── Legacy: backward compat wrapper ─────────────────────────────────────────

  public query func getContactDetails() : async ContactDetailsTypes.ContactDetails {
    ContactDetailsLib.getContactDetails(contactDetails)
  };

  public shared ({ caller }) func adminSetContactDetails(
    payload : ContactDetailsTypes.ContactDetails
  ) : async { #ok : Text; #err : Text } {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    ContactDetailsLib.adminSetContactDetails(
      contactDetails,
      roleUsers,
      activityLog,
      nextLogId,
      caller,
      payload,
    )
  };
};
