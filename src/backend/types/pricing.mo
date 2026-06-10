module {
  // ── Landing Page Offers ──────────────────────────────────────────────────────
  // Three tiers: base, customization, premium
  public type LandingPageOffer = {
    id : Text;
    tier : Text;
    title : Text;
    description : Text;
    price : Nat;
    currency : Text;
    isVisible : Bool;
    tag : ?Text;
  };

  // ── Consultancy Services ─────────────────────────────────────────────────────
  public type ConsultancyService = {
    id : Text;
    title : Text;
    description : Text;
    price : Nat;
    currency : Text;
    isVisible : Bool;
    order : Nat;
  };

  // ── Competence-Based Pricing ─────────────────────────────────────────────────
  public type CompetencePricing = {
    id : Text;
    title : Text;
    shortDescription : Text;
    price : Nat;
    currency : Text;
    isVisible : Bool;
    order : Nat;
  };

  // ── Bundles / Combos ─────────────────────────────────────────────────────────
  public type Bundle = {
    id : Text;
    title : Text;
    description : Text;
    includedServiceIds : [Text];
    bundlePrice : Nat;
    currency : Text;
    isVisible : Bool;
    order : Nat;
  };

  // ── Giveaway Items ───────────────────────────────────────────────────────────
  public type GiveawayItem = {
    id : Text;
    title : Text;
    description : Text;
    isFree : Bool;
    discountedPrice : ?Nat;
    currency : Text;
    isVisible : Bool;
    isActive : Bool;
    order : Nat;
  };

  // ── Aggregate ─────────────────────────────────────────────────────────────────
  public type PricingData = {
    landingPageOffers : [LandingPageOffer];
    consultancyServices : [ConsultancyService];
    competencePricing : [CompetencePricing];
    bundles : [Bundle];
    giveaways : [GiveawayItem];
  };
};
