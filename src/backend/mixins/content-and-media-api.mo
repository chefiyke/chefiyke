import ContentTypes "../types/content";
import MediaTypes "../types/content-and-media";
import RolesTypes "../types/roles";
import ContentAndMediaLib "../lib/content-and-media";
import RolesLib "../lib/roles";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Time "mo:core/Time";

// Mixin for all new content-and-media control repair methods.
// Adds: brand tagline, hero image IDs, competence section toggle,
// per-card isVisible, per-testimonial isVisible with admin/public split.
mixin (
  brandTagline : { var value : Text },
  heroImageIds : { var value : MediaTypes.HeroImageIds },
  competenceSectionVisible : { var value : Bool },
  competenceCards : List.List<ContentTypes.CompetenceCard>,
  testimonials : List.List<ContentTypes.Testimonial>,
  roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
  activityLog : List.List<RolesTypes.ActivityLog>,
  nextLogId : { var value : Nat },
) {
  // ── Public queries ──────────────────────────────────────────────────────────

  public query func getBrandTagline() : async Text {
    ContentAndMediaLib.getTagline(brandTagline)
  };

  public query func getHeroImageIds() : async MediaTypes.HeroImageIds {
    ContentAndMediaLib.getHeroImageIds(heroImageIds)
  };

  public query func getCompetenceSectionVisible() : async Bool {
    ContentAndMediaLib.getCompetenceSectionVisible(competenceSectionVisible)
  };

  // Returns only visible competence cards for public consumers.
  public query func getCompetenceCardsVisible() : async [ContentTypes.CompetenceCard] {
    ContentAndMediaLib.getVisibleCards(competenceCards)
  };

  // Returns only visible testimonials for public consumers.
  public query func getVisibleTestimonials() : async [ContentTypes.Testimonial] {
    ContentAndMediaLib.getVisibleTestimonials(testimonials)
  };

  // ── Admin methods (RBAC: CanEditContent) ────────────────────────────────────

  public shared ({ caller }) func adminGetBrandTagline() : async Text {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanEditContent);
    ContentAndMediaLib.getTagline(brandTagline)
  };

  public shared ({ caller }) func adminSetBrandTagline(tagline : Text) : async () {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanEditContent);
    ContentAndMediaLib.setTagline(brandTagline, tagline);
    RolesLib.logActivity(activityLog, nextLogId, caller, RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }), "adminSetBrandTagline", "brandTagline", Time.now())
  };

  public shared ({ caller }) func adminGetHeroImageIds() : async MediaTypes.HeroImageIds {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanEditContent);
    ContentAndMediaLib.getHeroImageIds(heroImageIds)
  };

  public shared ({ caller }) func adminSetHeroImageIds(ids : MediaTypes.HeroImageIds) : async () {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanEditContent);
    ContentAndMediaLib.setHeroImageIds(heroImageIds, ids);
    RolesLib.logActivity(activityLog, nextLogId, caller, RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }), "adminSetHeroImageIds", "heroImageIds", Time.now())
  };

  public shared ({ caller }) func adminGetCompetenceSectionVisible() : async Bool {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanEditContent);
    ContentAndMediaLib.getCompetenceSectionVisible(competenceSectionVisible)
  };

  public shared ({ caller }) func adminSetCompetenceSectionVisible(visible : Bool) : async () {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanEditContent);
    ContentAndMediaLib.setCompetenceSectionVisible(competenceSectionVisible, visible);
    RolesLib.logActivity(activityLog, nextLogId, caller, RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }), "adminSetCompetenceSectionVisible", "competenceSectionVisible", Time.now())
  };

  // Returns all competence cards including isVisible for admin editing.
  public shared ({ caller }) func adminGetCompetenceCards() : async [ContentTypes.CompetenceCard] {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanEditContent);
    ContentAndMediaLib.getAllCards(competenceCards)
  };

  // Returns all testimonials including isVisible for admin editing.
  public shared ({ caller }) func adminGetAllTestimonials() : async [ContentTypes.Testimonial] {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanEditContent);
    ContentAndMediaLib.getAllTestimonials(testimonials)
  };
};
