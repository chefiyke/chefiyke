import CommonTypes "common";

module {
  // ── Legacy types (kept for backward compat) ──────────────────────────────────
  public type ContactLink = { name : Text; url : Text };

  public type ContactDetails = {
    phone : ?Text;
    whatsapp : ?Text;
    facebook : ?Text;
    instagram : ?Text;
    x : ?Text;
    tiktok : ?Text;
    linkedin : ?Text;
    snapchat : ?Text;
    email : ?Text;
    otherLinks : [ContactLink];
    updatedAt : CommonTypes.Timestamp;
  };

  // ── Rich contact platform (17-platform system) ────────────────────────────────

  // Allowed platformKey values:
  //   "whatsapp" | "phone" | "email" | "facebook" | "instagram" | "tiktok"
  //   "linkedin" | "x_twitter" | "youtube" | "telegram" | "snapchat" | "threads"
  //   "twitch" | "reddit" | "pinterest" | "website" | "custom"
  public type ContactPlatform = {
    id : Text;           // unique stable identifier (e.g. "whatsapp", "email", uuid for custom)
    platformKey : Text;  // one of the 17 allowed keys above
    platformName : Text; // display name, e.g. "WhatsApp"
    url : Text;          // full redirect URL or tel:/mailto:
    displayLabel : ?Text; // optional custom label shown on frontend
    isVisible : Bool;    // ON/OFF toggle — controls frontend display
    order : Nat;         // ascending sort order for frontend
  };

  public type ContactManagerData = {
    platforms : [ContactPlatform];
    updatedAt : CommonTypes.Timestamp;
  };
};
