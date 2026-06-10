import ContentTypes "../types/content";
import MediaTypes "../types/content-and-media";
import List "mo:core/List";

// Domain logic for the content-and-media control repair.
// Covers: brand tagline, hero image IDs, competence section toggle,
// per-card/per-testimonial isVisible filtering.
module {
  // ── Brand tagline ────────────────────────────────────────────────────────────

  public func getTagline(tagline : { var value : Text }) : Text {
    tagline.value
  };

  public func setTagline(tagline : { var value : Text }, newTagline : Text) {
    tagline.value := newTagline
  };

  // ── Hero image IDs ───────────────────────────────────────────────────────────

  public func getHeroImageIds(ids : { var value : MediaTypes.HeroImageIds }) : MediaTypes.HeroImageIds {
    ids.value
  };

  public func setHeroImageIds(ids : { var value : MediaTypes.HeroImageIds }, newIds : MediaTypes.HeroImageIds) {
    ids.value := newIds
  };

  // ── Competence section visibility ────────────────────────────────────────────

  public func getCompetenceSectionVisible(flag : { var value : Bool }) : Bool {
    flag.value
  };

  public func setCompetenceSectionVisible(flag : { var value : Bool }, visible : Bool) {
    flag.value := visible
  };

  // ── Competence cards with isVisible ──────────────────────────────────────────

  // Returns all cards (admin view).
  public func getAllCards(cards : List.List<ContentTypes.CompetenceCard>) : [ContentTypes.CompetenceCard] {
    cards.toArray()
  };

  // Returns only visible cards (public view).
  public func getVisibleCards(cards : List.List<ContentTypes.CompetenceCard>) : [ContentTypes.CompetenceCard] {
    cards.filter(func(c) { c.isVisible }).toArray()
  };

  // ── Testimonials with isVisible ───────────────────────────────────────────────

  // Returns only visible testimonials (public view).
  public func getVisibleTestimonials(testimonials : List.List<ContentTypes.Testimonial>) : [ContentTypes.Testimonial] {
    testimonials.filter(func(t) { t.isVisible }).toArray()
  };

  // Returns all testimonials regardless of visibility (admin view).
  public func getAllTestimonials(testimonials : List.List<ContentTypes.Testimonial>) : [ContentTypes.Testimonial] {
    testimonials.toArray()
  };
};
