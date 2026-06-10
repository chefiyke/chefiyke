import Types "../types/content";
import CommonTypes "../types/common";
import RolesTypes "../types/roles";
import LeadsTypes "../types/leads";
import SecurityTypes "../types/security";
import ContentLib "../lib/content";
import SecurityLib "../lib/security";
import RolesLib "../lib/roles";
import LeadsLib "../lib/leads";
import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import ContentAndMediaLib "../lib/content-and-media";

// Public API for content management.
// Admin functions require CanEditContent permission (enforced via RBAC).
// Public query functions are accessible to all.
mixin (
  heroSlides : List.List<Types.HeroSlide>,
  competenceCards : List.List<Types.CompetenceCard>,
  helpBlocks : List.List<Types.HelpBlock>,
  testimonials : List.List<Types.Testimonial>,
  contactLinks : { var value : Types.ContactLinks },
  aboutSection : { var value : Types.AboutSection },
  signatureEdge : { var value : Types.SignatureEdge },
  contactMessages : List.List<Types.ContactMessage>,
  nextMessageId : { var value : Nat },
  blockedKeys : Map.Map<Text, SecurityTypes.BlockEntry>,
  rateLimits : Map.Map<Text, SecurityTypes.RateLimitEntry>,
  // tracks how many times each principal has been rate-limited (for auto-block)
  rateLimitViolations : Map.Map<Text, Nat>,
  roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
  activityLog : List.List<RolesTypes.ActivityLog>,
  nextLogId : { var value : Nat },
  leads : List.List<LeadsTypes.Lead>,
  nextLeadId : { var value : Nat },
) {
  // ── Public queries ──────────────────────────────────────────────────────────

  public query func getHeroSlides() : async [Types.HeroSlide] {
    ContentLib.getSlides(heroSlides)
  };

  public query func getCompetenceCards() : async [Types.CompetenceCard] {
    ContentAndMediaLib.getVisibleCards(competenceCards)
  };

  public query func getHelpBlocks() : async [Types.HelpBlock] {
    ContentLib.getHelpBlocks(helpBlocks)
  };

  public query func getTestimonials() : async [Types.Testimonial] {
    ContentAndMediaLib.getVisibleTestimonials(testimonials)
  };

  // Returns contact links with email obfuscated for non-admin callers
  public query func getContactLinks() : async Types.ContactLinks {
    ContentLib.getObfuscatedContactLinks(contactLinks)
  };

  public query func getAbout() : async Types.AboutSection {
    ContentLib.getAbout(aboutSection)
  };

  public query func getSignatureEdge() : async Types.SignatureEdge {
    ContentLib.getSignatureEdge(signatureEdge)
  };

  // ── Public update: message submission ──────────────────────────────────────

  // Rate-limited to max 3 per caller principal per minute.
  // Honeypot field must be empty.
  // Principals exceeding the limit 5 times are auto-blocked.
  public shared ({ caller }) func submitContactMessage(
    senderName : Text,
    messageText : Text,
    honeypot : Text,
  ) : async CommonTypes.SubmitResult {
    // Reject anonymous callers
    if (caller.isAnonymous()) {
      return #err("Anonymous submissions are not accepted.")
    };
    let key = caller.toText();
    let now = Time.now();

    // Firewall check (blocked + rate limit)
    let verdict = SecurityLib.firewallCheck(blockedKeys, rateLimits, key, 3, now);
    switch (verdict) {
      case (#blocked(msg)) { return #err(msg) };
      case (#rateLimited(msg)) {
        // Increment violation counter and auto-block if threshold reached
        let violations = switch (rateLimitViolations.get(key)) {
          case null { 1 };
          case (?v) { v + 1 };
        };
        rateLimitViolations.add(key, violations);
        if (violations >= 5) {
          SecurityLib.blockKey(blockedKeys, key, "Exceeded rate limit 5 times", now)
        };
        return #err(msg)
      };
      case (#allow) {};
    };

    // Record this request for rate-limit tracking
    SecurityLib.recordRequest(rateLimits, key, now);

    // Delegate to content lib (handles honeypot + validation)
    let result = ContentLib.submitMessage(contactMessages, nextMessageId, senderName, messageText, honeypot, now);

    // Mirror every successful contact message as a lead for CRM tracking
    switch result {
      case (#ok(_)) {
        let leadId = "lead-" # debug_show(nextLeadId.value);
        nextLeadId.value += 1;
        LeadsLib.addLead(leads, {
          id = leadId;
          name = senderName;
          email = "";
          phone = null;
          message = messageText;
          source = #contact_form;
          status = #new_;
          notes = "";
          assignedStaff = null;
          createdAt = now;
          updatedAt = now;
          affiliateRef = null;
        });
      };
      case _ {};
    };
    result
  };

  // ── Admin updates (RBAC: CanEditContent) ────────────────────────────────────

  public shared ({ caller }) func adminSetHeroSlides(slides : [Types.HeroSlide]) : async () {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanEditContent);
    ContentLib.setSlides(heroSlides, slides);
    RolesLib.logActivity(activityLog, nextLogId, caller, RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }), "adminSetHeroSlides", "heroSlides", Time.now())
  };

  public shared ({ caller }) func adminSetCompetenceCards(cards : [Types.CompetenceCard]) : async () {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanEditContent);
    ContentLib.setCards(competenceCards, cards);
    RolesLib.logActivity(activityLog, nextLogId, caller, RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }), "adminSetCompetenceCards", "competenceCards", Time.now())
  };

  public shared ({ caller }) func adminSetHelpBlocks(blocks : [Types.HelpBlock]) : async () {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanEditContent);
    ContentLib.setHelpBlocks(helpBlocks, blocks);
    RolesLib.logActivity(activityLog, nextLogId, caller, RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }), "adminSetHelpBlocks", "helpBlocks", Time.now())
  };

  public shared ({ caller }) func adminSetTestimonials(items : [Types.Testimonial]) : async () {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanEditContent);
    ContentLib.setTestimonials(testimonials, items);
    RolesLib.logActivity(activityLog, nextLogId, caller, RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }), "adminSetTestimonials", "testimonials", Time.now())
  };

  public shared ({ caller }) func adminSetContactLinks(links : Types.ContactLinks) : async () {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanEditContent);
    ContentLib.setContactLinks(contactLinks, links);
    RolesLib.logActivity(activityLog, nextLogId, caller, RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }), "adminSetContactLinks", "contactLinks", Time.now())
  };

  public shared ({ caller }) func adminSetAbout(section : Types.AboutSection) : async () {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanEditContent);
    ContentLib.setAbout(aboutSection, section);
    RolesLib.logActivity(activityLog, nextLogId, caller, RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }), "adminSetAbout", "aboutSection", Time.now())
  };

  public shared ({ caller }) func adminSetSignatureEdge(edge : Types.SignatureEdge) : async () {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanEditContent);
    ContentLib.setSignatureEdge(signatureEdge, edge);
    RolesLib.logActivity(activityLog, nextLogId, caller, RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }), "adminSetSignatureEdge", "signatureEdge", Time.now())
  };

  public shared ({ caller }) func adminGetContactMessages() : async [Types.ContactMessage] {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageLeads);
    ContentLib.getMessages(contactMessages)
  };

  // Returns raw (unobfuscated) contact links for admin
  public shared ({ caller }) func adminGetContactLinks() : async Types.ContactLinks {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanEditContent);
    ContentLib.getContactLinks(contactLinks)
  };
};
