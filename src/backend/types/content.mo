module {
  // Hero carousel slides
  public type SlideButton = {
    text : Text;
    href : Text;
  };

  public type HeroSlide = {
    headline : Text;
    subheadline : Text;
    body : Text;
    button1 : SlideButton;
    button2 : SlideButton;
  };

  // Competence cards
  public type CompetenceCard = {
    title : Text;
    description : Text; // one-line explanation
    isVisible : Bool;
  };

  // How I Help blocks
  public type HelpBlock = {
    title : Text;
    description : Text;
  };

  // Testimonials
  public type Testimonial = {
    author : Text;
    role : Text;
    text : Text;
    isVisible : Bool;
  };

  // Contact links (email stored as raw value; obfuscation is handled at API boundary)
  public type ContactLinks = {
    whatsapp : Text;
    facebook : Text;
    instagram : Text;
    email : Text; // stored plaintext; API obfuscates before returning to unauthenticated callers
    primaryCtaText : Text;
  };

  // About section
  public type AboutSection = {
    title : Text;
    bio : Text;
  };

  // Signature Edge section
  public type SignatureEdge = {
    pillar1 : Text;
    pillar2 : Text;
    pillar3 : Text;
    quote : Text;
  };

  // Contact form message
  public type ContactMessage = {
    id : Nat;
    senderName : Text;
    messageText : Text;
    timestamp : Int; // nanoseconds
  };
};
