import Types "../types/pricing";
import RolesTypes "../types/roles";
import RolesLib "../lib/roles";
import List "mo:core/List";
import Map "mo:core/Map";

module {
  // ── Getters ──────────────────────────────────────────────────────────────────

  public func getLandingPageOffers(
    pricingState : { var value : Types.PricingData },
    onlyVisible : Bool,
  ) : [Types.LandingPageOffer] {
    if (onlyVisible) {
      pricingState.value.landingPageOffers.filter(func(o) { o.isVisible })
    } else {
      pricingState.value.landingPageOffers
    }
  };

  public func getConsultancyServices(
    pricingState : { var value : Types.PricingData },
    onlyVisible : Bool,
  ) : [Types.ConsultancyService] {
    let all = pricingState.value.consultancyServices;
    let filtered = if (onlyVisible) {
      all.filter(func(s) { s.isVisible })
    } else { all };
    filtered.sort(func(a, b) { if (a.order < b.order) { #less } else if (a.order > b.order) { #greater } else { #equal } })
  };

  public func getCompetencePricing(
    pricingState : { var value : Types.PricingData },
    onlyVisible : Bool,
  ) : [Types.CompetencePricing] {
    let all = pricingState.value.competencePricing;
    let filtered = if (onlyVisible) {
      all.filter(func(c) { c.isVisible })
    } else { all };
    filtered.sort(func(a, b) { if (a.order < b.order) { #less } else if (a.order > b.order) { #greater } else { #equal } })
  };

  public func getBundles(
    pricingState : { var value : Types.PricingData },
    onlyVisible : Bool,
  ) : [Types.Bundle] {
    let all = pricingState.value.bundles;
    let filtered = if (onlyVisible) {
      all.filter(func(b) { b.isVisible })
    } else { all };
    filtered.sort(func(a, b) { if (a.order < b.order) { #less } else if (a.order > b.order) { #greater } else { #equal } })
  };

  public func getGiveaways(
    pricingState : { var value : Types.PricingData },
    onlyVisible : Bool,
  ) : [Types.GiveawayItem] {
    let all = pricingState.value.giveaways;
    let filtered = if (onlyVisible) {
      all.filter(func(g) { g.isVisible and g.isActive })
    } else { all };
    filtered.sort(func(a, b) { if (a.order < b.order) { #less } else if (a.order > b.order) { #greater } else { #equal } })
  };

  public func getAllPricing(
    pricingState : { var value : Types.PricingData },
    onlyVisible : Bool,
  ) : Types.PricingData {
    {
      landingPageOffers = getLandingPageOffers(pricingState, onlyVisible);
      consultancyServices = getConsultancyServices(pricingState, onlyVisible);
      competencePricing = getCompetencePricing(pricingState, onlyVisible);
      bundles = getBundles(pricingState, onlyVisible);
      giveaways = getGiveaways(pricingState, onlyVisible);
    }
  };

  // ── Setters ──────────────────────────────────────────────────────────────────

  public func setLandingPageOffers(
    pricingState : { var value : Types.PricingData },
    roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
    activityLog : List.List<RolesTypes.ActivityLog>,
    nextLogId : { var value : Nat },
    caller : Principal,
    offers : [Types.LandingPageOffer],
  ) {
    RolesLib.requirePermission(roleUsers, caller, #CanEditContent);
    let role = switch (RolesLib.getRole(roleUsers, caller)) {
      case (?r) { r };
      case null { #Customer };
    };
    pricingState.value := { pricingState.value with landingPageOffers = offers };
    RolesLib.logActivity(activityLog, nextLogId, caller, role, "SetLandingPageOffers", "PricingData", 0);
  };

  public func setConsultancyServices(
    pricingState : { var value : Types.PricingData },
    roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
    activityLog : List.List<RolesTypes.ActivityLog>,
    nextLogId : { var value : Nat },
    caller : Principal,
    services : [Types.ConsultancyService],
  ) {
    RolesLib.requirePermission(roleUsers, caller, #CanEditContent);
    let role = switch (RolesLib.getRole(roleUsers, caller)) {
      case (?r) { r };
      case null { #Customer };
    };
    pricingState.value := { pricingState.value with consultancyServices = services };
    RolesLib.logActivity(activityLog, nextLogId, caller, role, "SetConsultancyServices", "PricingData", 0);
  };

  public func setCompetencePricing(
    pricingState : { var value : Types.PricingData },
    roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
    activityLog : List.List<RolesTypes.ActivityLog>,
    nextLogId : { var value : Nat },
    caller : Principal,
    pricing : [Types.CompetencePricing],
  ) {
    RolesLib.requirePermission(roleUsers, caller, #CanEditContent);
    let role = switch (RolesLib.getRole(roleUsers, caller)) {
      case (?r) { r };
      case null { #Customer };
    };
    pricingState.value := { pricingState.value with competencePricing = pricing };
    RolesLib.logActivity(activityLog, nextLogId, caller, role, "SetCompetencePricing", "PricingData", 0);
  };

  public func setBundles(
    pricingState : { var value : Types.PricingData },
    roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
    activityLog : List.List<RolesTypes.ActivityLog>,
    nextLogId : { var value : Nat },
    caller : Principal,
    bundles : [Types.Bundle],
  ) {
    RolesLib.requirePermission(roleUsers, caller, #CanEditContent);
    let role = switch (RolesLib.getRole(roleUsers, caller)) {
      case (?r) { r };
      case null { #Customer };
    };
    pricingState.value := { pricingState.value with bundles = bundles };
    RolesLib.logActivity(activityLog, nextLogId, caller, role, "SetBundles", "PricingData", 0);
  };

  public func setGiveaways(
    pricingState : { var value : Types.PricingData },
    roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
    activityLog : List.List<RolesTypes.ActivityLog>,
    nextLogId : { var value : Nat },
    caller : Principal,
    giveaways : [Types.GiveawayItem],
  ) {
    RolesLib.requirePermission(roleUsers, caller, #CanEditContent);
    let role = switch (RolesLib.getRole(roleUsers, caller)) {
      case (?r) { r };
      case null { #Customer };
    };
    pricingState.value := { pricingState.value with giveaways = giveaways };
    RolesLib.logActivity(activityLog, nextLogId, caller, role, "SetGiveaways", "PricingData", 0);
  };

  // ── Toggle visibility ────────────────────────────────────────────────────────
  // itemType: "landingPage" | "consultancy" | "competence" | "bundle" | "giveaway"
  // Returns new visibility state (true = visible)
  public func toggleItemVisibility(
    pricingState : { var value : Types.PricingData },
    roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
    activityLog : List.List<RolesTypes.ActivityLog>,
    nextLogId : { var value : Nat },
    caller : Principal,
    itemType : Text,
    id : Text,
  ) : Bool {
    RolesLib.requirePermission(roleUsers, caller, #CanEditContent);
    let role = switch (RolesLib.getRole(roleUsers, caller)) {
      case (?r) { r };
      case null { #Customer };
    };
    var newVisibility = false;
    let data = pricingState.value;

    if (itemType == "landingPage") {
      let updated = data.landingPageOffers.map(func(o : Types.LandingPageOffer) : Types.LandingPageOffer {
        if (o.id == id) {
          newVisibility := not o.isVisible;
          { o with isVisible = newVisibility }
        } else { o }
      });
      pricingState.value := { data with landingPageOffers = updated };
    } else if (itemType == "consultancy") {
      let updated = data.consultancyServices.map(func(s : Types.ConsultancyService) : Types.ConsultancyService {
        if (s.id == id) {
          newVisibility := not s.isVisible;
          { s with isVisible = newVisibility }
        } else { s }
      });
      pricingState.value := { data with consultancyServices = updated };
    } else if (itemType == "competence") {
      let updated = data.competencePricing.map(func(c : Types.CompetencePricing) : Types.CompetencePricing {
        if (c.id == id) {
          newVisibility := not c.isVisible;
          { c with isVisible = newVisibility }
        } else { c }
      });
      pricingState.value := { data with competencePricing = updated };
    } else if (itemType == "bundle") {
      let updated = data.bundles.map(func(b : Types.Bundle) : Types.Bundle {
        if (b.id == id) {
          newVisibility := not b.isVisible;
          { b with isVisible = newVisibility }
        } else { b }
      });
      pricingState.value := { data with bundles = updated };
    } else if (itemType == "giveaway") {
      let updated = data.giveaways.map(func(g : Types.GiveawayItem) : Types.GiveawayItem {
        if (g.id == id) {
          newVisibility := not g.isVisible;
          { g with isVisible = newVisibility }
        } else { g }
      });
      pricingState.value := { data with giveaways = updated };
    };

    RolesLib.logActivity(activityLog, nextLogId, caller, role, "TogglePricingVisibility", itemType # ":" # id, 0);
    newVisibility
  };
};
