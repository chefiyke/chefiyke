import Types "../types/content";
import CommonTypes "../types/common";
import List "mo:core/List";
import Text "mo:core/Text";

module {
  // ── Hero slides ─────────────────────────────────────────────────────────────

  public func getSlides(slides : List.List<Types.HeroSlide>) : [Types.HeroSlide] {
    slides.toArray()
  };

  public func setSlides(slides : List.List<Types.HeroSlide>, newSlides : [Types.HeroSlide]) {
    slides.clear();
    slides.addAll(newSlides.values())
  };

  // ── Competence cards ────────────────────────────────────────────────────────

  public func getCards(cards : List.List<Types.CompetenceCard>) : [Types.CompetenceCard] {
    cards.toArray()
  };

  public func setCards(cards : List.List<Types.CompetenceCard>, newCards : [Types.CompetenceCard]) {
    cards.clear();
    cards.addAll(newCards.values())
  };

  // ── How I Help blocks ───────────────────────────────────────────────────────

  public func getHelpBlocks(blocks : List.List<Types.HelpBlock>) : [Types.HelpBlock] {
    blocks.toArray()
  };

  public func setHelpBlocks(blocks : List.List<Types.HelpBlock>, newBlocks : [Types.HelpBlock]) {
    blocks.clear();
    blocks.addAll(newBlocks.values())
  };

  // ── Testimonials ────────────────────────────────────────────────────────────

  public func getTestimonials(testimonials : List.List<Types.Testimonial>) : [Types.Testimonial] {
    testimonials.toArray()
  };

  public func setTestimonials(testimonials : List.List<Types.Testimonial>, newTestimonials : [Types.Testimonial]) {
    testimonials.clear();
    testimonials.addAll(newTestimonials.values())
  };

  // ── Contact links ───────────────────────────────────────────────────────────

  public func getContactLinks(links : { var value : Types.ContactLinks }) : Types.ContactLinks {
    links.value
  };

  // Returns contact links with email obfuscated (Base64-style chunking)
  // We encode the email as reversed chunks to frustrate simple scrapers
  public func getObfuscatedContactLinks(links : { var value : Types.ContactLinks }) : Types.ContactLinks {
    let raw = links.value;
    let obfuscated = obfuscateEmail(raw.email);
    { raw with email = obfuscated }
  };

  public func setContactLinks(links : { var value : Types.ContactLinks }, newLinks : Types.ContactLinks) {
    links.value := newLinks
  };

  // ── About section ───────────────────────────────────────────────────────────

  public func getAbout(about : { var value : Types.AboutSection }) : Types.AboutSection {
    about.value
  };

  public func setAbout(about : { var value : Types.AboutSection }, newAbout : Types.AboutSection) {
    about.value := newAbout
  };

  // ── Signature Edge ──────────────────────────────────────────────────────────

  public func getSignatureEdge(edge : { var value : Types.SignatureEdge }) : Types.SignatureEdge {
    edge.value
  };

  public func setSignatureEdge(edge : { var value : Types.SignatureEdge }, newEdge : Types.SignatureEdge) {
    edge.value := newEdge
  };

  // ── Contact messages ────────────────────────────────────────────────────────

  public func submitMessage(
    messages : List.List<Types.ContactMessage>,
    nextId : { var value : Nat },
    senderName : Text,
    messageText : Text,
    honeypot : Text,
    nowNanos : Int,
  ) : CommonTypes.SubmitResult {
    // Honeypot: must be empty (bots fill it in)
    if (honeypot != "") {
      return #err("Submission rejected.")
    };
    // Basic validation
    if (senderName.size() == 0) {
      return #err("Name is required.")
    };
    if (messageText.size() == 0) {
      return #err("Message is required.")
    };
    if (senderName.size() > 200) {
      return #err("Name is too long.")
    };
    if (messageText.size() > 2000) {
      return #err("Message is too long.")
    };
    let id = nextId.value;
    nextId.value += 1;
    messages.add({
      id;
      senderName;
      messageText;
      timestamp = nowNanos;
    });
    #ok("Message sent successfully.")
  };

  public func getMessages(messages : List.List<Types.ContactMessage>) : [Types.ContactMessage] {
    messages.toArray()
  };

  // ── Private helpers ─────────────────────────────────────────────────────────

  // Simple email obfuscation: split email at "@" and reverse-encode each part
  // Returns a chunked representation that can be decoded client-side
  // Format: "b64:<chars-reversed-around-@>"
  // For security we simply reverse the local-part and domain so bots scanning
  // plain text cannot harvest the address; the frontend reverses it back.
  func obfuscateEmail(email : Text) : Text {
    if (email == "") return "";
    // Encode as reversed text prefixed with a marker that the frontend knows
    let reversed = email.toArray();
    var result = "enc:";
    var i = reversed.size();
    while (i > 0) {
      i -= 1;
      result #= Text.fromChar(reversed[i])
    };
    result
  };
};
