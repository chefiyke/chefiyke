import ContentTypes "types/content";
import SecurityTypes "types/security";
import MediaTypes "types/media";
import FinanceTypes "types/finance";
import TrainingTypes "types/training";
import AffiliateTypes "types/affiliate";
import RolesTypes "types/roles";
import LeadsTypes "types/leads";
import SalesTypes "types/sales";
import ContactDetailsTypes "types/contact-details";
import PaymentTypes "types/payment";
import BuyerLeadsTypes "types/buyer-leads";
import AuditTypes "types/audit";
import PricingTypes "types/pricing";
import ClientPortalTypes "types/client-portal";
import CryptoPaymentTypes "types/crypto-payment";
import SystemsTypes "types/systems";
import LegalTypes "types/legal";
import ClientPortalLib "lib/client-portal";
import ContactDetailsLib "lib/contact-details";
import LegalLib "lib/legal";
import List "mo:core/List";
import Map "mo:core/Map";
import ContentMixin "mixins/content-api";
import SecurityMixin "mixins/security-api";
import MediaMixin "mixins/media-api";
import FinanceMixin "mixins/finance-api";
import TrainingMixin "mixins/training-api";
import AffiliateMixin "mixins/affiliate-api";
import RolesMixin "mixins/roles-api";
import SalesMixin "mixins/sales-api";
import LeadsMixin "mixins/leads-api";
import ContactDetailsMixin "mixins/contact-details-api";
import PaymentConfigMixin "mixins/payment-config-api";
import PaymentOrdersMixin "mixins/payment-orders-api";
import BuyerLeadsMixin "mixins/buyer-leads-api";
import AuditLogMixin "mixins/audit-log-api";
import PricingMixin "mixins/pricing-api";
import ClientPortalMixin "mixins/client-portal-api";
import CryptoPaymentMixin "mixins/crypto-payment-api";
import SystemsMixin "mixins/systems-api";
import LegalMixin "mixins/legal-api";
import ContentAndMediaTypes "types/content-and-media";
import ContentAndMediaMixin "mixins/content-and-media-api";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import SystemConfigMixin "mixins/system-config-api";







actor {
  // ── Content state ──────────────────────────────────────────────────────────

  // Hero slides — 3 canonical Chefiyke slides.
  // Self-healing: if the list is empty at startup (e.g. after accidental clear),
  // the seed block below re-populates from these hardcoded defaults.
  let heroSlides = List.fromArray<ContentTypes.HeroSlide>([
    {
      headline = "Most people have ideas. Very few build systems.";
      subheadline = "Authority · Structure · Systems";
      body = "I help people and businesses turn scattered ideas into structured systems, premium digital experiences, stronger brands, and measurable results.";
      button1 = { text = "Work With Me"; href = "#how-i-help" };
      button2 = { text = "Explore My Systems"; href = "/systems" };
    },
    {
      headline = "If your business isn't converting, something is missing.";
      subheadline = "Conversion · Trust · Structure";
      body = "Traffic, effort, and ideas mean nothing without structure. I build systems that help businesses attract attention, gain trust, and convert consistently.";
      button1 = { text = "Get This Landing Page"; href = "#pricing" };
      button2 = { text = "Work With Me"; href = "#how-i-help" };
    },
    {
      headline = "What you're building deserves structure.";
      subheadline = "Vision · Scale · Infrastructure";
      body = "From premium landing pages to backend-controlled platforms, I create systems designed to scale, perform, and stay in control.";
      button1 = { text = "See How I Help"; href = "#how-i-help" };
      button2 = { text = "Explore My Systems"; href = "/systems" };
    },
  ]);

  let competenceCards = List.fromArray<ContentTypes.CompetenceCard>([
    // Primary 8
    { title = "Entrepreneur"; description = "Building ventures from concept to traction with real-world execution."; isVisible = true },
    { title = "Bakery Consultant"; description = "Helping bakery businesses grow with systems, recipes, and strategy."; isVisible = true },
    { title = "Food Business Developer"; description = "Turning food ideas into scalable, profitable enterprises."; isVisible = true },
    { title = "SME Consultant"; description = "Providing clarity, structure, and strategic direction for small businesses."; isVisible = true },
    { title = "AI Business Tools Creator"; description = "Designing AI-powered tools that solve real business problems."; isVisible = true },
    { title = "System Builder"; description = "Creating structured workflows, processes, and operational systems."; isVisible = true },
    { title = "Mobile Web App Designer"; description = "Building fast, responsive, mobile-first web applications."; isVisible = true },
    { title = "Business Coach"; description = "Guiding individuals and teams from confusion to confident execution."; isVisible = true },
    // Secondary 7
    { title = "SME Consultant"; description = "Helping small and medium enterprises navigate growth, operations, and strategy."; isVisible = true },
    { title = "Creativity Activator"; description = "Unlocking creative potential and turning it into action."; isVisible = true },
    { title = "Digital Prophet"; description = "Identifying and communicating emerging digital trends and opportunities."; isVisible = true },
    { title = "Crypto Enthusiast"; description = "Exploring and educating on blockchain and digital asset ecosystems."; isVisible = true },
    { title = "Relationship Realist"; description = "Offering grounded, practical wisdom on human connections."; isVisible = true },
    { title = "Content Orchestrator"; description = "Crafting and organizing content that informs, engages, and converts."; isVisible = true },
    { title = "Strategic Thinker"; description = "Connecting the dots between vision, resources, and outcomes."; isVisible = true },
  ]);

  let helpBlocks = List.fromArray<ContentTypes.HelpBlock>([
    {
      title = "Business Clarity";
      description = "I help you see your business idea clearly — what it is, what it does, who it serves, and how to make it work.";
    },
    {
      title = "Food & Bakery Growth";
      description = "From recipes to revenue — I help food entrepreneurs build systems, scale production, and grow profitable bakery businesses.";
    },
    {
      title = "SME Strategy";
      description = "Small business needs big thinking. I help SMEs build solid strategy, improve operations, and move forward with confidence.";
    },
    {
      title = "AI & Digital Tools";
      description = "I create and deploy AI-powered tools that automate tasks, improve decisions, and give businesses a competitive edge.";
    },
    {
      title = "Offers, Pages & Systems";
      description = "I design compelling offers, conversion-ready pages, and end-to-end digital systems that work while you sleep.";
    },
    {
      title = "Human Direction";
      description = "Sometimes you just need someone to help you see the next step. I provide coaching, clarity, and direction for life and work.";
    },
  ]);

  let testimonials = List.fromArray<ContentTypes.Testimonial>([
    {
      author = "Client A";
      role = "Business Owner";
      text = "Practical and strategic — Chefiyke helped me move from a vague idea to a working business plan in just a few sessions.";
      isVisible = true;
    },
    {
      author = "Client B";
      role = "Food Entrepreneur";
      text = "Brings clarity to ideas. My bakery business completely transformed after working through his structured system.";
      isVisible = true;
    },
    {
      author = "Client C";
      role = "SME Director";
      text = "Strong direction and value. The tools and frameworks he provided are still driving results months later.";
      isVisible = true;
    },
  ]);

  let contactLinks : { var value : ContentTypes.ContactLinks } = {
    var value = {
      whatsapp = "https://wa.me/234XXXXXXXXXX";
      facebook = "https://facebook.com/chefiyke";
      instagram = "https://instagram.com/chefiyke";
      email = "hello@chefiyke.com";
      primaryCtaText = "Send a Message";
    };
  };

  let aboutSection : { var value : ContentTypes.AboutSection } = {
    var value = {
      title = "Who I Am";
      bio = "I am Chefiyke — an entrepreneur, bakery consultant, food business developer, SME consultant, AI business tools creator, mobile-ready web app designer, system builder, teacher, encourager, and creative problem solver.\n\nMy strength is helping people see clearly, build wisely, and move from confusion to execution.";
    };
  };

  let signatureEdge : { var value : ContentTypes.SignatureEdge } = {
    var value = {
      pillar1 = "Clarity";
      pillar2 = "Structure";
      pillar3 = "Activation";
      quote = "Not just ideas. Not just motivation. Structure, direction, and execution.";
    };
  };

  let contactMessages = List.empty<ContentTypes.ContactMessage>();
  let nextMessageId : { var value : Nat } = { var value = 0 };

  // ── Security state ─────────────────────────────────────────────────────────
  let blockedKeys = Map.empty<Text, SecurityTypes.BlockEntry>();
  let rateLimits = Map.empty<Text, SecurityTypes.RateLimitEntry>();
  let rateLimitViolations = Map.empty<Text, Nat>();

  // ── Media state ────────────────────────────────────────────────────────────
  let galleryImages = List.empty<MediaTypes.GalleryImage>();
  let galleryVideos = List.empty<MediaTypes.GalleryVideo>();
  let nextImageId : { var value : Nat } = { var value = 0 };
  let nextVideoId : { var value : Nat } = { var value = 0 };

  // ── Finance state ──────────────────────────────────────────────────────────
  let financeEntries = List.empty<FinanceTypes.FinanceEntry>();
  let nextFinanceId : { var value : Nat } = { var value = 0 };

  // ── Training state ─────────────────────────────────────────────────────────
  let trainingModules = List.empty<TrainingTypes.TrainingModule>();
  let liveSessions = List.empty<TrainingTypes.LiveSession>();
  let nextModuleId : { var value : Nat } = { var value = 0 };
  let nextSessionId : { var value : Nat } = { var value = 0 };

  // ── Affiliate state ────────────────────────────────────────────────────────
  let affiliates = Map.empty<Principal, AffiliateTypes.AffiliateProfile>();
  let nextAffiliateId : { var value : Nat } = { var value = 0 };
  let affiliateClicks = List.empty<AffiliateTypes.ClickEvent>();
  let affiliateConversions = List.empty<AffiliateTypes.ConversionEvent>();
  let affiliatePayouts = List.empty<AffiliateTypes.PayoutRecord>();
  let affiliateLeadRefs = Map.empty<Text, Nat>();
  // PLATFORM STANDARD: 25% affiliate commission rate across all projects — do not lower without owner approval
  let commissionSettings : { var value : AffiliateTypes.CommissionSettings } = {
    var value = { defaultRate = 0.25; overrideRates = [] };
  };
  let nextPayoutId : { var value : Nat } = { var value = 0 };

  // ── Sales state ────────────────────────────────────────────────────────────
  let orders = List.empty<SalesTypes.Order>();
  let nextOrderId : { var value : Nat } = { var value = 0 };

  // ── Leads state ────────────────────────────────────────────────────────────
  let leads = List.empty<LeadsTypes.Lead>();
  let nextLeadId : { var value : Nat } = { var value = 0 };

  // ── Roles state ────────────────────────────────────────────────────────────
  let roleUsers = Map.empty<Principal, RolesTypes.StaffUser>();
  let activityLog = List.empty<RolesTypes.ActivityLog>();
  let nextLogId : { var value : Nat } = { var value = 0 };
  // Stores the first controller principal that triggers bootstrap — persists across upgrades
  let ownerPrincipal : { var value : ?Principal } = { var value = null };

  // ── Contact details state ──────────────────────────────────────────────────
  let contactDetails : { var value : ContactDetailsTypes.ContactDetails } = {
    var value = {
      phone = null;
      whatsapp = null;
      facebook = null;
      instagram = null;
      x = null;
      tiktok = null;
      linkedin = null;
      snapchat = null;
      email = null;
      otherLinks = [];
      updatedAt = 0;
    };
  };

  // ── Contact manager state (17-platform rich system) ────────────────────────
  // Default platforms all start with isVisible = false; admin enables them explicitly
  let contactManager : { var value : ContactDetailsTypes.ContactManagerData } = {
    var value = {
      platforms = ContactDetailsLib.defaultPlatforms();
      updatedAt = 0;
    };
  };

  // ── Payment state ──────────────────────────────────────────────────────────
  let paymentConfig : { var value : PaymentTypes.PaymentConfig } = {
    var value = {
      enabledMethods = [];
      localBank = null;
      paystack = null;
      flutterwave = null;
      defaultCurrency = "NGN";
      servicePriceNgn = 0;
      updatedAt = 0;
    };
  };
  let paymentOrders = List.empty<PaymentTypes.PaymentOrder>();
  let nextPaymentOrderId : { var value : Nat } = { var value = 0 };
  // Webhook secret hash — stored separately from public payment config, never exposed to frontend.
  // Set via adminSetWebhookSecretHash. When set, all incoming webhooks must match this hash.
  let webhookSecretHash : { var value : Text } = { var value = "" };

  // ── Buyer leads state ──────────────────────────────────────────────────────
  let buyerLeads = List.empty<BuyerLeadsTypes.BuyerLead>();
  let nextBuyerLeadId : { var value : Nat } = { var value = 0 };

  // ── Audit state ────────────────────────────────────────────────────────────
  let auditLogs = List.empty<AuditTypes.AuditLog>();
  let nextAuditLogId : { var value : Nat } = { var value = 0 };
  let loginAttempts = Map.empty<Text, AuditTypes.LoginAttempt>();
  let securityPolicy : { var value : AuditTypes.SecurityPolicy } = {
    var value = {
      maxLoginAttempts = 5;
      lockoutDurationMins = 15;
      sessionTimeoutMins = 60;
      rateLimitPerMin = 30;
      rateLimitPublicPerMin = 10;
    };
  };

  // ── Pricing state ──────────────────────────────────────────────────────────
  // Pre-seeded with the canonical 5 landing page tiers and 7 consulting tiers
  // so the frontend renders real content immediately without admin data entry.
  let pricingState : { var value : PricingTypes.PricingData } = {
    var value = {
      landingPageOffers = [
        {
          id = "lp-1";
          tier = "Starter";
          title = "Starter";
          description = "Clean, high-conversion landing page with essential structure and mobile responsiveness.";
          price = 200_000;
          currency = "NGN";
          isVisible = true;
          tag = null;
        },
        {
          id = "lp-2";
          tier = "Pro Setup";
          title = "Pro Setup (Most Popular)";
          description = "Advanced landing page with optimized structure and improved conversion performance.";
          price = 350_000;
          currency = "NGN";
          isVisible = true;
          tag = ?"Most Popular";
        },
        {
          id = "lp-3";
          tier = "Advanced Build";
          title = "Advanced Build";
          description = "Full system build with deeper customization and enhanced user experience.";
          price = 700_000;
          currency = "NGN";
          isVisible = true;
          tag = null;
        },
        {
          id = "lp-4";
          tier = "Full Build + Consulting";
          title = "Full Build + Consulting";
          description = "Complete system build combined with strategic consulting and execution support.";
          price = 1_300_000;
          currency = "NGN";
          isVisible = true;
          tag = null;
        },
        {
          id = "lp-5";
          tier = "Enterprise";
          title = "Enterprise";
          description = "High-level custom system for serious businesses requiring advanced structure and scalability. Custom depending on scope.";
          price = 2_500_000;
          currency = "NGN";
          isVisible = true;
          tag = null;
        },
      ];
      consultancyServices = [
        {
          id = "cs-1";
          title = "Quick Call";
          description = "Focused session to address a specific issue, provide clarity, and give immediate actionable direction.";
          price = 50_000;
          currency = "NGN";
          isVisible = true;
          order = 1;
        },
        {
          id = "cs-2";
          title = "Strategy Session";
          description = "Deep strategic session to analyze your business, refine direction, and build a clear execution roadmap.";
          price = 120_000;
          currency = "NGN";
          isVisible = true;
          order = 2;
        },
        {
          id = "cs-3";
          title = "Business Development";
          description = "Structured support to develop your idea into a functional business system with clear execution steps. Includes access to Builder's Dashboard.";
          price = 300_000;
          currency = "NGN";
          isVisible = true;
          order = 3;
        },
        {
          id = "cs-4";
          title = "Advisory / Mentorship";
          description = "Ongoing strategic support, guidance, and system refinement for serious builders. Includes access to Builder's Dashboard. Custom pricing depending on scope.";
          price = 750_000;
          currency = "NGN";
          isVisible = true;
          order = 4;
        },
        {
          id = "cs-5";
          title = "Bakery Setup";
          description = "Complete bakery system setup including equipment planning, workflow design, and operational structure. Includes Builder's Dashboard.";
          price = 2_500_000;
          currency = "NGN";
          isVisible = true;
          order = 5;
        },
        {
          id = "cs-6";
          title = "Bakery Setup + Recipes";
          description = "Full bakery setup with 2-3 commercial production recipes and full system integration. Includes Builder's Dashboard.";
          price = 5_000_000;
          currency = "NGN";
          isVisible = true;
          order = 6;
        },
        {
          id = "cs-7";
          title = "Speaking / Training";
          description = "Professional speaking and training sessions focused on business systems, execution, and personal development. Pricing: Standard Session (1-2 hrs): NGN 150,000 | Half Day (3-4 hrs): NGN 300,000 | Full Day: NGN 500,000+";
          price = 150_000;
          currency = "NGN";
          isVisible = true;
          order = 7;
        },
      ];
      competencePricing = [
        {
          id = "cp-1";
          title = "Business Strategy & Systems";
          shortDescription = "Design and structuring of scalable business systems for growth and efficiency.";
          price = 300_000;
          currency = "NGN";
          isVisible = true;
          order = 1;
        },
        {
          id = "cp-2";
          title = "Bakery & Food Business Consulting";
          shortDescription = "Expert guidance on building, scaling, and optimizing bakery or food businesses.";
          price = 300_000;
          currency = "NGN";
          isVisible = true;
          order = 2;
        },
        {
          id = "cp-3";
          title = "AI Tools & System Integration";
          shortDescription = "Implementation of AI tools and digital systems to improve business productivity and automation.";
          price = 300_000;
          currency = "NGN";
          isVisible = true;
          order = 3;
        },
        {
          id = "cp-4";
          title = "Business Coaching & Development";
          shortDescription = "Guidance for entrepreneurs to develop mindset, structure, and execution discipline.";
          price = 300_000;
          currency = "NGN";
          isVisible = true;
          order = 4;
        },
      ];
      bundles = [
        {
          id = "bundle-1";
          title = "Business Starter Bundle";
          description = "Includes Strategy Session + Business Development support.";
          includedServiceIds = ["cs-2", "cs-3"];
          bundlePrice = 400_000;
          currency = "NGN";
          isVisible = true;
          order = 1;
        },
        {
          id = "bundle-2";
          title = "Business Growth Bundle";
          description = "Includes Strategy + Advisory support + system refinement.";
          includedServiceIds = ["cs-2", "cs-4"];
          bundlePrice = 900_000;
          currency = "NGN";
          isVisible = true;
          order = 2;
        },
        {
          id = "bundle-3";
          title = "Full Business Build Bundle";
          description = "Includes full system build + consulting + execution support.";
          includedServiceIds = ["lp-4", "cs-3"];
          bundlePrice = 1_500_000;
          currency = "NGN";
          isVisible = true;
          order = 3;
        },
      ];
      giveaways = [
        {
          id = "giveaway-1";
          title = "Free Strategy Insight";
          description = "Access to a free insight or tip to help improve your business thinking and direction.";
          isFree = true;
          discountedPrice = null;
          currency = "NGN";
          isVisible = true;
          isActive = true;
          order = 1;
        },
        {
          id = "giveaway-2";
          title = "Discount Offer";
          description = "Limited-time offer for selected services or bundles.";
          isFree = false;
          discountedPrice = null;
          currency = "NGN";
          isVisible = true;
          isActive = true;
          order = 2;
        },
      ];
    };
  };

  // ── Client portal state ────────────────────────────────────────────────────
  let clientProjects : ClientPortalLib.ProjectMap = Map.empty<Text, ClientPortalTypes.ClientProject>();

  // ── Affiliate click rate-limit state (separate from main rateLimits) ──────────
  let affiliateRateLimits = Map.empty<Text, { var timestamps : [Int] }>();

  // ── Crypto payment config state ────────────────────────────────────────────
  // Persistent backend storage — replaces localStorage in AdminCryptoPayment.tsx
  let cryptoPaymentConfig : { var value : ?CryptoPaymentTypes.CryptoPaymentConfig } = {
    var value = null;
  };

  // ── Systems portfolio state ────────────────────────────────────────────────
  let systemsApps = List.empty<SystemsTypes.SystemApp>();

  // ── Legal content state ────────────────────────────────────────────────────
  // Pre-seeded with Terms, Privacy Policy, Disclaimer, Refund Policy on first init.
  let legalContent = Map.empty<Text, LegalTypes.LegalContent>();
  // ── Content-and-media control repair state ────────────────────────────────────────
  let brandTagline : { var value : Text } = { var value = "The King of Wealth" };
  let heroImageIds : { var value : ContentAndMediaTypes.HeroImageIds } = {
    var value = {
      slide1ImageId = null;
      slide2ImageId = null;
      slide3ImageId = null;
      aboutImageId = null;
      presenceImageId = null;
    };
  };
  let competenceSectionVisible : { var value : Bool } = { var value = true };

  // ── SYSTEM_CONFIG — central persistent config for all editable frontend content ──
  // This is the single source of truth. The Virtual Office reads and writes here.
  // Enhanced orthogonal persistence guarantees this survives every upgrade.
  let systemConfig : { var value : ContentAndMediaTypes.SystemConfig } = {
    var value = {
      heroHeadline = "Chefiyke";
      heroSubtext = "Entrepreneur - Consultant - System Builder - Digital Creator";
      brandTagline = "The King of Wealth";
      ctaWorkWithMe = "Work With Me";
      ctaGetLandingPage = "Get This Landing Page";
      ctaExploreSystems = "Explore My Systems";
      ctaViewCompetence = "View My Competence";
      footerText = "Chefiyke. All rights reserved.";
      siteTitle = "Chefiyke";
      siteDescription = "Premium Personal Brand Platform";
      maintenanceMode = false;
      competenceSectionVisible = true;
      environment = "production";
    };
  };

  // ── Version control — auto-incremented on every deployment ────────────────
  // buildVersion starts at 43 to reflect current production version.
  // Each upgrade increments it automatically via the deployment log.
  let buildVersion : { var value : Nat } = { var value = 44 };
  let lastDeployedAt : { var value : Int } = { var value = Time.now() };
  let deploymentLog = List.empty<ContentAndMediaTypes.DeploymentEntry>();
  // Record this deployment
  deploymentLog.add({ version = 44; deployedAt = Time.now(); note = "Hero slides self-healing seed + console hardening" });

  // ── Hero slides self-healing seed ─────────────────────────────────────────
  // With Enhanced Orthogonal Persistence the List object persists across upgrades.
  // If slides were accidentally cleared, re-populate from hardcoded defaults so the
  // hero carousel always renders on the live site.
  if (heroSlides.size() == 0) {
    heroSlides.add({
      headline = "Most people have ideas. Very few build systems.";
      subheadline = "Authority · Structure · Systems";
      body = "I help people and businesses turn scattered ideas into structured systems, premium digital experiences, stronger brands, and measurable results.";
      button1 = { text = "Work With Me"; href = "#how-i-help" };
      button2 = { text = "Explore My Systems"; href = "/systems" };
    });
    heroSlides.add({
      headline = "If your business isn't converting, something is missing.";
      subheadline = "Conversion · Trust · Structure";
      body = "Traffic, effort, and ideas mean nothing without structure. I build systems that help businesses attract attention, gain trust, and convert consistently.";
      button1 = { text = "Get This Landing Page"; href = "#pricing" };
      button2 = { text = "Work With Me"; href = "#how-i-help" };
    });
    heroSlides.add({
      headline = "What you\u{2019}re building deserves structure.";
      subheadline = "Vision · Scale · Infrastructure";
      body = "From premium landing pages to backend-controlled platforms, I create systems designed to scale, perform, and stay in control.";
      button1 = { text = "See How I Help"; href = "#how-i-help" };
      button2 = { text = "Explore My Systems"; href = "/systems" };
    });
  };

  // ── Mixin composition ──────────────────────────────────────────────────────
  include RolesMixin(
    roleUsers,
    activityLog,
    nextLogId,
    ownerPrincipal,
  );

  include ContentMixin(
    heroSlides,
    competenceCards,
    helpBlocks,
    testimonials,
    contactLinks,
    aboutSection,
    signatureEdge,
    contactMessages,
    nextMessageId,
    blockedKeys,
    rateLimits,
    rateLimitViolations,
    roleUsers,
    activityLog,
    nextLogId,
    leads,
    nextLeadId,
  );

  include SecurityMixin(
    blockedKeys,
    rateLimits,
    roleUsers,
    activityLog,
    nextLogId,
  );

  include MediaMixin(
    galleryImages,
    galleryVideos,
    nextImageId,
    nextVideoId,
    roleUsers,
    activityLog,
    nextLogId,
    rateLimits,
    blockedKeys,
  );

  include FinanceMixin(
    financeEntries,
    nextFinanceId,
    roleUsers,
    activityLog,
    nextLogId,
  );

  include TrainingMixin(
    trainingModules,
    liveSessions,
    nextModuleId,
    nextSessionId,
    affiliates,
    roleUsers,
    activityLog,
    nextLogId,
  );

  include AffiliateMixin(
    affiliates,
    nextAffiliateId,
    roleUsers,
    activityLog,
    nextLogId,
    affiliateClicks,
    affiliateConversions,
    affiliatePayouts,
    affiliateLeadRefs,
    commissionSettings,
    nextPayoutId,
    affiliateRateLimits,
    auditLogs,
    nextAuditLogId,
  );

  include SalesMixin(
    orders,
    nextOrderId,
  );

  include LeadsMixin(
    leads,
    nextLeadId,
  );

  include ContactDetailsMixin(
    contactDetails,
    contactManager,
    roleUsers,
    activityLog,
    nextLogId,
  );

  include PaymentConfigMixin(
    paymentConfig,
    roleUsers,
    activityLog,
    nextLogId,
  );

  include PaymentOrdersMixin(
    paymentOrders,
    nextPaymentOrderId,
    paymentConfig,
    roleUsers,
    activityLog,
    nextLogId,
    rateLimits,
    blockedKeys,
    auditLogs,
    nextAuditLogId,
    webhookSecretHash,
  );

  include BuyerLeadsMixin(
    buyerLeads,
    nextBuyerLeadId,
    roleUsers,
    auditLogs,
    nextAuditLogId,
    rateLimits,
    blockedKeys,
  );

  include AuditLogMixin(
    auditLogs,
    nextAuditLogId,
    loginAttempts,
    securityPolicy,
    roleUsers,
    activityLog,
    nextLogId,
  );

  include PricingMixin(
    pricingState,
    roleUsers,
    activityLog,
    nextLogId,
  );

  include ClientPortalMixin(
    clientProjects,
    roleUsers,
  );

  include CryptoPaymentMixin(
    cryptoPaymentConfig,
    roleUsers,
    auditLogs,
    nextAuditLogId,
  );

  include SystemsMixin(
    systemsApps,
    roleUsers,
    activityLog,
    nextLogId,
  );

  include LegalMixin(
    legalContent,
    roleUsers,
  );

  include ContentAndMediaMixin(
    brandTagline,
    heroImageIds,
    competenceSectionVisible,
    competenceCards,
    testimonials,
    roleUsers,
    activityLog,
    nextLogId,
  );

  // ── One-time seed: populate legal content defaults if never set ────────────
  LegalLib.seedDefaultsIfEmpty(legalContent);

  include SystemConfigMixin(
    systemConfig,
    buildVersion,
    lastDeployedAt,
    deploymentLog,
    roleUsers,
    activityLog,
    nextLogId,
  );
};
