import ContactDetailsTypes "../types/contact-details";
import RolesTypes "../types/roles";
import RolesLib "roles";
import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  // ── Legacy: get flat ContactDetails (backward compat) ────────────────────────

  public func getContactDetails(
    contactDetails : { var value : ContactDetailsTypes.ContactDetails }
  ) : ContactDetailsTypes.ContactDetails {
    contactDetails.value
  };

  public func adminSetContactDetails(
    contactDetails : { var value : ContactDetailsTypes.ContactDetails },
    roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
    activityLog : List.List<RolesTypes.ActivityLog>,
    nextLogId : { var value : Nat },
    caller : Principal,
    payload : ContactDetailsTypes.ContactDetails,
  ) : { #ok : Text; #err : Text } {
    RolesLib.requirePermission(roleUsers, caller, #CanEditContactDetails);
    let role = switch (RolesLib.getRole(roleUsers, caller)) {
      case (?r) { r };
      case null { #Customer };
    };
    contactDetails.value := { payload with updatedAt = Time.now() };
    RolesLib.logActivity(activityLog, nextLogId, caller, role, "SetContactDetails", "ContactDetails", 0);
    #ok("Contact details updated successfully")
  };

  // ── New: 17-platform contact manager ─────────────────────────────────────────

  // Returns only visible platforms sorted by ascending order
  public func getVisibleContactPlatforms(
    contactManager : { var value : ContactDetailsTypes.ContactManagerData }
  ) : [ContactDetailsTypes.ContactPlatform] {
    let visible = contactManager.value.platforms.filter(func(p) { p.isVisible });
    visible.sort(func(a, b) { if (a.order < b.order) { #less } else if (a.order > b.order) { #greater } else { #equal } })
  };

  // Returns all platforms (admin view — visible + hidden)
  public func getAllContactPlatforms(
    contactManager : { var value : ContactDetailsTypes.ContactManagerData }
  ) : [ContactDetailsTypes.ContactPlatform] {
    let all = contactManager.value.platforms;
    all.sort(func(a, b) { if (a.order < b.order) { #less } else if (a.order > b.order) { #greater } else { #equal } })
  };

  // Replaces the full platforms list; stamps updatedAt
  public func setContactPlatforms(
    contactManager : { var value : ContactDetailsTypes.ContactManagerData },
    platforms : [ContactDetailsTypes.ContactPlatform],
  ) {
    contactManager.value := {
      platforms = platforms;
      updatedAt = Time.now();
    };
  };

  // Flips isVisible for a platform by id; returns new visibility state
  public func togglePlatformVisibility(
    contactManager : { var value : ContactDetailsTypes.ContactManagerData },
    id : Text,
  ) : Bool {
    var newVisibility = false;
    let updated = contactManager.value.platforms.map(
      func(p : ContactDetailsTypes.ContactPlatform) : ContactDetailsTypes.ContactPlatform {
        if (p.id == id) {
          newVisibility := not p.isVisible;
          { p with isVisible = newVisibility }
        } else { p }
      }
    );
    contactManager.value := { platforms = updated; updatedAt = Time.now() };
    newVisibility
  };

  // Updates the order field for a platform by id
  public func reorderPlatform(
    contactManager : { var value : ContactDetailsTypes.ContactManagerData },
    id : Text,
    newOrder : Nat,
  ) {
    let updated = contactManager.value.platforms.map(
      func(p : ContactDetailsTypes.ContactPlatform) : ContactDetailsTypes.ContactPlatform {
        if (p.id == id) { { p with order = newOrder } } else { p }
      }
    );
    contactManager.value := { platforms = updated; updatedAt = Time.now() };
  };

  // Builds the default 17-platform list; all start with isVisible = false
  // Admin must explicitly toggle ON the ones they want visible
  // Builds the default 17-platform list with correct Chefiyke social handles pre-seeded.
  // Key platforms (WhatsApp, Facebook, Instagram, TikTok, YouTube) start visible with real URLs.
  // All others start with isVisible = false — admin can enable them explicitly.
  // IMPORTANT: This function is only called when contactManager is in its initial empty state.
  // If the owner has already saved their own data, this is never called again (stable variable preserves it).
  public func defaultPlatforms() : [ContactDetailsTypes.ContactPlatform] {
    [
      { id = "whatsapp";  platformKey = "whatsapp";  platformName = "WhatsApp";     url = "https://wa.me/2348035614528";             displayLabel = ?"+2348035614528";  isVisible = true;  order = 0  },
      { id = "phone";     platformKey = "phone";     platformName = "Phone";        url = "";                                        displayLabel = null;               isVisible = false; order = 2  },
      { id = "email";     platformKey = "email";     platformName = "Email";        url = "";                                        displayLabel = null;               isVisible = false; order = 3  },
      { id = "facebook";  platformKey = "facebook";  platformName = "Facebook";     url = "https://www.facebook.com/chefiyke";       displayLabel = ?"chefiyke";        isVisible = true;  order = 1  },
      { id = "instagram"; platformKey = "instagram"; platformName = "Instagram";    url = "https://www.instagram.com/iamchefiyke";   displayLabel = ?"iamchefiyke";     isVisible = true;  order = 2  },
      { id = "tiktok";    platformKey = "tiktok";    platformName = "TikTok";       url = "https://www.tiktok.com/@chefiyke";        displayLabel = ?"@chefiyke";       isVisible = true;  order = 3  },
      { id = "linkedin";  platformKey = "linkedin";  platformName = "LinkedIn";     url = "";                                        displayLabel = null;               isVisible = false; order = 7  },
      { id = "x_twitter"; platformKey = "x_twitter"; platformName = "X / Twitter"; url = "";                                        displayLabel = null;               isVisible = false; order = 8  },
      { id = "youtube";   platformKey = "youtube";   platformName = "YouTube";      url = "https://www.youtube.com/@chefiyke";       displayLabel = ?"chefiyke";        isVisible = true;  order = 4  },
      { id = "telegram";  platformKey = "telegram";  platformName = "Telegram";     url = "";                                        displayLabel = null;               isVisible = false; order = 10 },
      { id = "snapchat";  platformKey = "snapchat";  platformName = "Snapchat";     url = "";                                        displayLabel = null;               isVisible = false; order = 11 },
      { id = "threads";   platformKey = "threads";   platformName = "Threads";      url = "";                                        displayLabel = null;               isVisible = false; order = 12 },
      { id = "twitch";    platformKey = "twitch";    platformName = "Twitch";       url = "";                                        displayLabel = null;               isVisible = false; order = 13 },
      { id = "reddit";    platformKey = "reddit";    platformName = "Reddit";       url = "";                                        displayLabel = null;               isVisible = false; order = 14 },
      { id = "pinterest"; platformKey = "pinterest"; platformName = "Pinterest";    url = "";                                        displayLabel = null;               isVisible = false; order = 15 },
      { id = "website";   platformKey = "website";   platformName = "Website";      url = "";                                        displayLabel = null;               isVisible = false; order = 16 },
      { id = "custom";    platformKey = "custom";    platformName = "Custom";       url = "";                                        displayLabel = null;               isVisible = false; order = 17 },
    ]
  };
};
