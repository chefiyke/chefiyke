import LegalTypes "../types/legal";
import RolesTypes "../types/roles";
import LegalLib "../lib/legal";
import RolesLib "../lib/roles";
import Map "mo:core/Map";
import Time "mo:core/Time";

mixin (
  legalContent : Map.Map<Text, LegalTypes.LegalContent>,
  roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
) {
  // ── Public: get a single legal page (no auth required) ───────────────────────

  public query func getLegalContent(id : Text) : async ?LegalTypes.LegalContent {
    LegalLib.getLegalContent(legalContent, id)
  };

  // ── Admin: get all legal pages ────────────────────────────────────────────────

  public shared ({ caller }) func adminGetAllLegalContent() : async [LegalTypes.LegalContent] {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    LegalLib.getAllLegalContent(legalContent, roleUsers, caller)
  };

  // ── Admin: create or update a legal page ─────────────────────────────────────

  public shared ({ caller }) func adminSetLegalContent(
    id : Text,
    title : Text,
    content : Text,
  ) : async { #ok : (); #err : Text } {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    LegalLib.adminSetLegalContent(legalContent, roleUsers, caller, id, title, content)
  };
};
