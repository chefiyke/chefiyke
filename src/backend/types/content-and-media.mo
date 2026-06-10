// Domain types for content-and-media control repair.
// New types only — existing types remain in types/content.mo and types/media.mo.
module {
  // Hero image storage IDs — each field is optional so images can be unset independently.
  public type HeroImageIds = {
    slide1ImageId : ?Text;
    slide2ImageId : ?Text;
    slide3ImageId : ?Text;
    aboutImageId : ?Text;
    presenceImageId : ?Text;
  };

  // ── SYSTEM_CONFIG — single source of truth for all editable frontend content ──
  // All fields that the owner can edit from the Virtual Office live here.
  // Frontend reads only from this record; never from hardcoded defaults.
  public type SystemConfig = {
    // Hero / brand
    heroHeadline : Text;
    heroSubtext : Text;
    brandTagline : Text;
    // CTA button labels
    ctaWorkWithMe : Text;
    ctaGetLandingPage : Text;
    ctaExploreSystems : Text;
    ctaViewCompetence : Text;
    // Site metadata
    footerText : Text;
    siteTitle : Text;
    siteDescription : Text;
    // Global visibility toggles
    maintenanceMode : Bool;
    competenceSectionVisible : Bool;
    // Deployment environment label (e.g. "production", "staging")
    environment : Text;
  };

  // ── Version / deployment tracking ───────────────────────────────────────────
  public type DeploymentEntry = {
    version : Nat;
    deployedAt : Int;
    note : Text;
  };

  public type VersionInfo = {
    buildVersion : Nat;
    lastDeployedAt : Int;
    systemVersion : Text;
    environment : Text;
  };
};
