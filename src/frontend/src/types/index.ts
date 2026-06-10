// Types matching the backend interface in backend.d.ts
// Defined here for use across the app
import type { Principal } from "@icp-sdk/core/principal";

// Re-export backend enum types for convenience
export {
  UserRole,
  Permission,
  LeadStatus,
  LeadSource,
  OrderStatus,
  PayoutStatus,
  AffiliateStatus,
  EntryType,
  Variant_active_pending_inactive,
} from "../backend.d";

export type {
  ActivityLog,
  StaffUser,
  Lead,
  Order,
  AffiliateStats,
  PayoutRecord,
  CommissionSettings,
} from "../backend.d";

// ───── Content Types ─────

export interface SlideButton {
  href: string;
  text: string;
}

export interface HeroSlide {
  body: string;
  headline: string;
  button1: SlideButton;
  button2: SlideButton;
  subheadline: string;
}

export interface CompetenceCard {
  title: string;
  description: string;
}

export interface HelpBlock {
  title: string;
  description: string;
}

export interface Testimonial {
  role: string;
  text: string;
  author: string;
}

export interface ContactLinks {
  primaryCtaText: string;
  instagram: string;
  whatsapp: string;
  email: string;
  facebook: string;
}

export interface AboutSection {
  bio: string;
  title: string;
}

export interface SignatureEdge {
  quote: string;
  pillar1: string;
  pillar2: string;
  pillar3: string;
}

export interface ContactMessage {
  id: bigint;
  messageText: string;
  timestamp: bigint;
  senderName: string;
}

export interface BlockEntry {
  key: string;
  blockedAt: bigint;
  reason: string;
}

export type SubmitResult =
  | { __kind__: "ok"; ok: string }
  | { __kind__: "err"; err: string };

// Page content aggregate type
export interface PageContent {
  heroSlides: HeroSlide[];
  competenceCards: CompetenceCard[];
  helpBlocks: HelpBlock[];
  testimonials: Testimonial[];
  contactLinks: ContactLinks;
  about: AboutSection;
  signatureEdge: SignatureEdge;
}

// ───── Gallery & Media ─────

export interface GalleryImage {
  id: bigint;
  storageId: string;
  caption: string;
  uploadedAt: bigint;
}

export interface GalleryVideo {
  id: bigint;
  url: string;
  title: string;
  description: string;
  isVisible: boolean;
  isFeatured: boolean;
  uploadedAt: bigint;
}

// ───── Finance ─────

export interface FinanceEntry {
  id: bigint;
  entryType: { income: null } | { expense: null };
  amount: bigint;
  description: string;
  date: string;
  createdAt: bigint;
}

export interface FinanceSummary {
  totalIncome: bigint;
  totalExpenses: bigint;
  netBalance: bigint;
  entryCount: bigint;
}

// ───── Training & Live Sessions ─────

export interface TrainingModule {
  id: number;
  title: string;
  description: string;
  videoStorageId: [] | [string];
  textContent: string;
  order: number;
  createdAt: bigint;
}

export interface LiveSession {
  id: number;
  title: string;
  description: string;
  date: bigint;
  joinLink: string;
  createdAt: bigint;
}

// ───── Affiliate (legacy frontend-only shape) ─────

export interface AffiliateProfile {
  principal: Principal;
  inviteCode: string;
  name: string;
  joinedAt: bigint;
}

// ───── Role & Access Types ─────

/** Null when unauthenticated */
export type UserRoleOrNull =
  | "PlatformOwner"
  | "Admin"
  | "Staff"
  | "Affiliate"
  | "Customer"
  | null;

export interface LeadStats {
  totalLeads: bigint;
  newLeads: bigint;
  qualifiedLeads: bigint;
}

export interface SalesStats {
  totalOrders: bigint;
  totalRevenue: number;
  pendingPayments: bigint;
}

// ───── Pricing Engine Types ─────

export interface LandingPageOffer {
  id: string;
  tier: string;
  title: string;
  description: string;
  price: bigint;
  currency: string;
  isVisible: boolean;
}

export interface ConsultancyService {
  id: string;
  title: string;
  description: string;
  price: bigint;
  currency: string;
  isVisible: boolean;
  order: bigint;
}

export interface CompetencePricing {
  id: string;
  title: string;
  shortDescription: string;
  price: bigint;
  currency: string;
  isVisible: boolean;
  order: bigint;
}

export interface Bundle {
  id: string;
  title: string;
  description: string;
  includedServiceIds: string[];
  bundlePrice: bigint;
  currency: string;
  isVisible: boolean;
  order: bigint;
}

export interface GiveawayItem {
  id: string;
  title: string;
  description: string;
  isFree: boolean;
  discountedPrice?: bigint;
  currency: string;
  isVisible: boolean;
  isActive: boolean;
  order: bigint;
}

export interface PricingData {
  landingPageOffers: LandingPageOffer[];
  consultancyServices: ConsultancyService[];
  competencePricing: CompetencePricing[];
  bundles: Bundle[];
  giveaways: GiveawayItem[];
}

// ───── Contact Platform Types ─────

export interface ContactPlatform {
  id: string;
  platformKey: string;
  platformName: string;
  url: string;
  displayLabel?: string;
  isVisible: boolean;
  order: bigint;
}
