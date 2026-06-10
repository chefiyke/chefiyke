import PricingTypes "../types/pricing";
import RolesTypes "../types/roles";
import PricingLib "../lib/pricing";
import RolesLib "../lib/roles";
import Map "mo:core/Map";
import List "mo:core/List";

mixin (
  pricingState : { var value : PricingTypes.PricingData },
  roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
  activityLog : List.List<RolesTypes.ActivityLog>,
  nextLogId : { var value : Nat },
) {
  // ── Public: visible pricing data (frontend) ───────────────────────────────────

  public query func getPricingData() : async PricingTypes.PricingData {
    PricingLib.getAllPricing(pricingState, true)
  };

  // ── Admin: full pricing data (includes hidden) ────────────────────────────────

  public shared ({ caller }) func adminGetPricingData() : async PricingTypes.PricingData {
    PricingLib.getAllPricing(pricingState, false)
  };

  // ── Admin: set landing page offers ───────────────────────────────────────────

  public shared ({ caller }) func adminSetLandingPageOffers(
    offers : [PricingTypes.LandingPageOffer]
  ) : async { #ok : Text; #err : Text } {
    if (not RolesLib.userHasPermission(roleUsers, caller, #CanEditContent)) {
      return #err("Access denied: CanEditContent permission required")
    };
    PricingLib.setLandingPageOffers(
      pricingState,
      roleUsers,
      activityLog,
      nextLogId,
      caller,
      offers,
    );
    #ok("Landing page offers updated successfully")
  };

  // ── Admin: set consultancy services ──────────────────────────────────────────

  public shared ({ caller }) func adminSetConsultancyServices(
    services : [PricingTypes.ConsultancyService]
  ) : async { #ok : Text; #err : Text } {
    if (not RolesLib.userHasPermission(roleUsers, caller, #CanEditContent)) {
      return #err("Access denied: CanEditContent permission required")
    };
    PricingLib.setConsultancyServices(
      pricingState,
      roleUsers,
      activityLog,
      nextLogId,
      caller,
      services,
    );
    #ok("Consultancy services updated successfully")
  };

  // ── Admin: set competence pricing ────────────────────────────────────────────

  public shared ({ caller }) func adminSetCompetencePricing(
    pricing : [PricingTypes.CompetencePricing]
  ) : async { #ok : Text; #err : Text } {
    if (not RolesLib.userHasPermission(roleUsers, caller, #CanEditContent)) {
      return #err("Access denied: CanEditContent permission required")
    };
    PricingLib.setCompetencePricing(
      pricingState,
      roleUsers,
      activityLog,
      nextLogId,
      caller,
      pricing,
    );
    #ok("Competence pricing updated successfully")
  };

  // ── Admin: set bundles ────────────────────────────────────────────────────────

  public shared ({ caller }) func adminSetBundles(
    bundles : [PricingTypes.Bundle]
  ) : async { #ok : Text; #err : Text } {
    if (not RolesLib.userHasPermission(roleUsers, caller, #CanEditContent)) {
      return #err("Access denied: CanEditContent permission required")
    };
    PricingLib.setBundles(
      pricingState,
      roleUsers,
      activityLog,
      nextLogId,
      caller,
      bundles,
    );
    #ok("Bundles updated successfully")
  };

  // ── Admin: set giveaways ──────────────────────────────────────────────────────

  public shared ({ caller }) func adminSetGiveaways(
    giveaways : [PricingTypes.GiveawayItem]
  ) : async { #ok : Text; #err : Text } {
    if (not RolesLib.userHasPermission(roleUsers, caller, #CanEditContent)) {
      return #err("Access denied: CanEditContent permission required")
    };
    PricingLib.setGiveaways(
      pricingState,
      roleUsers,
      activityLog,
      nextLogId,
      caller,
      giveaways,
    );
    #ok("Giveaways updated successfully")
  };

  // ── Admin: toggle pricing item visibility ─────────────────────────────────────
  // itemType: "landingPage" | "consultancy" | "competence" | "bundle" | "giveaway"
  // Returns new visibility state

  public shared ({ caller }) func adminTogglePricingItemVisibility(
    itemType : Text,
    id : Text,
  ) : async { #ok : Bool; #err : Text } {
    if (not RolesLib.userHasPermission(roleUsers, caller, #CanEditContent)) {
      return #err("Access denied: CanEditContent permission required")
    };
    let newState = PricingLib.toggleItemVisibility(
      pricingState,
      roleUsers,
      activityLog,
      nextLogId,
      caller,
      itemType,
      id,
    );
    #ok(newState)
  };
};
