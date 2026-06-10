import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard } from "lucide-react";
import { motion } from "motion/react";
import { createActor } from "../backend";
import type {
  ConsultancyService,
  ContactDetails,
  PricingData,
} from "../backend.d";
import { Layout } from "../components/Layout";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TierData {
  id: string;
  title: string;
  description: string;
  price: string;
  cta: string;
  ctaHref: string;
  includesDashboard: boolean;
  badge?: string;
}

// ─── Fallback CTA base URL ────────────────────────────────────────────────────
// The real WhatsApp URL is loaded from the backend contact manager.
// This is only used if no WhatsApp number has been configured.
const FALLBACK_CTA_BASE = "/#contact";

function buildWhatsAppUrl(
  whatsappBase: string | undefined,
  text: string,
): string {
  if (!whatsappBase) return FALLBACK_CTA_BASE;
  // whatsappBase may already be a full wa.me URL or just a phone number
  const base = whatsappBase.startsWith("http")
    ? whatsappBase
    : `https://wa.me/${whatsappBase.replace(/\D/g, "")}`;
  return `${base}?text=${encodeURIComponent(text)}`;
}

function buildFallbackTiers(whatsapp?: string): TierData[] {
  return [
    {
      id: "1",
      title: "Quick Call",
      description:
        "A focused 30–60 minute call to address a specific challenge, get clarity on a decision, or validate your direction with an expert eye.",
      price: "₦50,000",
      cta: "Book a Call",
      ctaHref: buildWhatsAppUrl(whatsapp, "I'd like to book a Quick Call"),
      includesDashboard: false,
    },
    {
      id: "2",
      title: "Strategy Session",
      description:
        "A deep 2–3 hour strategy session to map your goals, identify gaps, and build a clear, actionable roadmap tailored to your situation.",
      price: "₦120,000",
      cta: "Get Strategy Session",
      ctaHref: buildWhatsAppUrl(whatsapp, "I'd like a Strategy Session"),
      includesDashboard: false,
    },
    {
      id: "3",
      title: "Business Development",
      description:
        "Hands-on business development support — from idea validation to market entry planning, structure design, and execution guidance.",
      price: "₦300,000",
      cta: "Develop My Idea",
      ctaHref: buildWhatsAppUrl(
        whatsapp,
        "I'd like Business Development consulting",
      ),
      includesDashboard: true,
    },
    {
      id: "4",
      title: "Advisory / Mentorship",
      description:
        "Ongoing advisory and mentorship for entrepreneurs and professionals ready to operate at a higher level. Structured sessions, direct access, and accountability.",
      price: "₦750,000+",
      cta: "Work Closely With Me",
      ctaHref: buildWhatsAppUrl(whatsapp, "I'd like Advisory / Mentorship"),
      includesDashboard: true,
    },
    {
      id: "5",
      title: "Bakery Setup",
      description:
        "Full bakery setup system including structure, equipment planning, workflow design, supplier sourcing, and complete staff processes to launch a professional bakery operation.",
      price: "₦2,500,000",
      cta: "Start My Bakery Setup",
      ctaHref: buildWhatsAppUrl(whatsapp, "I'd like Bakery Setup consulting"),
      includesDashboard: true,
    },
    {
      id: "6",
      title: "Bakery Setup + Recipes",
      description:
        "The complete bakery system with full setup plus 2–3 commercial production recipes, integration training, and hands-on recipe development tailored to your market.",
      price: "₦5,000,000",
      cta: "Build My Bakery Business",
      ctaHref: buildWhatsAppUrl(whatsapp, "I'd like Bakery Setup + Recipes"),
      includesDashboard: true,
      badge: "Most Complete",
    },
    {
      id: "7",
      title: "Speaking / Training",
      description:
        "Keynote speaking or structured training sessions for teams, events, and organisations. Standard (1–2 hrs) ₦150k · Half Day (3–4 hrs) ₦300k · Full Day ₦500k+.",
      price: "₦150,000+",
      cta: "Book Me to Speak",
      ctaHref: buildWhatsAppUrl(
        whatsapp,
        "I'd like to book a Speaking / Training session",
      ),
      includesDashboard: false,
    },
  ];
}

const DASHBOARD_TIER_KEYWORDS = [
  "business development",
  "advisory",
  "mentorship",
  "bakery setup",
  "bakery setup + recipes",
  "bakery",
];

function includesDashboard(title: string): boolean {
  const lower = title.toLowerCase();
  return DASHBOARD_TIER_KEYWORDS.some((kw) => lower.includes(kw));
}

function formatPrice(price: bigint, currency: string): string {
  const num = Number(price);
  if (currency === "NGN" || !currency) return `₦${num.toLocaleString()}`;
  return `${currency} ${num.toLocaleString()}`;
}

function serviceToTier(
  service: ConsultancyService,
  index: number,
  whatsapp?: string,
): TierData {
  return {
    id: service.id,
    title: service.title,
    description: service.description,
    price: formatPrice(service.price, service.currency),
    cta: getCta(service.title),
    ctaHref: buildWhatsAppUrl(
      whatsapp,
      `I'd like to enquire about ${service.title}`,
    ),
    includesDashboard: includesDashboard(service.title),
    badge: index === 5 ? "Most Complete" : undefined,
  };
}

function getCta(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes("quick call")) return "Book a Call";
  if (lower.includes("strategy")) return "Get Strategy Session";
  if (lower.includes("business development")) return "Develop My Idea";
  if (lower.includes("advisory") || lower.includes("mentorship"))
    return "Work Closely With Me";
  if (
    lower.includes("bakery setup + recipes") ||
    lower.includes("bakery setup + recipe")
  )
    return "Build My Bakery Business";
  if (lower.includes("bakery setup")) return "Start My Bakery Setup";
  if (lower.includes("speaking") || lower.includes("training"))
    return "Book Me to Speak";
  return "Get Started";
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useConsultingTiers(): {
  tiers: TierData[];
  isLoading: boolean;
  whatsapp?: string;
} {
  const { actor, isFetching } = useActor(createActor);

  // Load WhatsApp contact from backend so CTAs always use the configured number
  const { data: contactDetails } = useQuery<ContactDetails | null>({
    queryKey: ["contactDetails"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getContactDetails();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 10 * 60 * 1000,
  });

  const whatsapp = contactDetails?.whatsapp ?? undefined;

  const { data, isLoading } = useQuery<PricingData | null>({
    queryKey: ["pricingData"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getPricingData();
      } catch {
        return null;
      }
    },
    enabled: !isFetching,
    staleTime: 5 * 60 * 1000,
  });

  const backendTiers = data?.consultancyServices
    ?.filter((s) => s.isVisible)
    .sort((a, b) => Number(a.order) - Number(b.order))
    .map((s, i) => serviceToTier(s, i, whatsapp));

  return {
    tiers:
      backendTiers && backendTiers.length > 0
        ? backendTiers
        : buildFallbackTiers(whatsapp),
    isLoading: isLoading || isFetching,
    whatsapp,
  };
}

// ─── TierCard Component ───────────────────────────────────────────────────────

function TierCard({ tier, index }: { tier: TierData; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="relative flex flex-col rounded-2xl border overflow-hidden"
      style={{
        background: "oklch(0.11 0 0)",
        borderColor: tier.includesDashboard
          ? "rgba(184,150,12,0.35)"
          : "rgba(255,255,255,0.07)",
      }}
      data-ocid={`consulting.tier.item.${index + 1}`}
    >
      {/* Gold left accent bar for dashboard tiers */}
      {tier.includesDashboard && (
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5"
          style={{ background: "rgba(184,150,12,0.7)" }}
          aria-hidden="true"
        />
      )}

      <div className="p-6 flex flex-col gap-4 flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          {/* Tier number */}
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-display font-bold shrink-0"
            style={{
              background: "rgba(184,150,12,0.15)",
              color: "#B8960C",
              border: "1px solid rgba(184,150,12,0.3)",
            }}
          >
            {index + 1}
          </span>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 justify-end">
            {tier.badge && (
              <span
                className="text-[10px] font-display font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(184,150,12,0.2)",
                  color: "#B8960C",
                  border: "1px solid rgba(184,150,12,0.4)",
                }}
              >
                {tier.badge}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-lg text-foreground leading-snug">
          {tier.title}
        </h3>

        {/* Description */}
        <p className="font-body text-sm text-muted-foreground leading-relaxed flex-1">
          {tier.description}
        </p>

        {/* Builder's Dashboard badge */}
        {tier.includesDashboard && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{
              background: "rgba(184,150,12,0.07)",
              border: "1px solid rgba(184,150,12,0.2)",
            }}
          >
            <LayoutDashboard size={13} style={{ color: "#B8960C" }} />
            <span
              className="text-[11px] font-body font-semibold"
              style={{ color: "#B8960C" }}
            >
              Includes Builder's Dashboard
            </span>
          </div>
        )}

        {/* Price + CTA */}
        <div className="pt-3 border-t border-border/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-auto">
          <span
            className="font-display font-bold text-2xl"
            style={{ color: "#B8960C" }}
          >
            {tier.price}
          </span>

          <a
            href={tier.ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring whitespace-nowrap"
            style={{
              background: "#B8960C",
              color: "#0a0a0a",
              boxShadow: "0 2px 12px rgba(184,150,12,0.25)",
            }}
            data-ocid={`consulting.tier.cta.${index + 1}`}
          >
            {tier.cta}
          </a>
        </div>
      </div>
    </motion.article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ConsultingPage() {
  const { tiers, isLoading, whatsapp } = useConsultingTiers();
  const enquireHref = buildWhatsAppUrl(
    whatsapp,
    "Hi Chefiyke, I'd like to know which consulting tier is right for me",
  );

  return (
    <Layout>
      <div
        className="min-h-screen"
        style={{ background: "oklch(0.07 0 0)" }}
        data-ocid="consulting.page"
      >
        {/* Hero header */}
        <section
          className="relative overflow-hidden py-20 md:py-28"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.10 0 0) 0%, oklch(0.07 0 0) 100%)",
            borderBottom: "1px solid rgba(184,150,12,0.12)",
          }}
          data-ocid="consulting.header.section"
        >
          {/* Decorative grain */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            }}
            aria-hidden="true"
          />

          <div className="relative container mx-auto max-w-3xl px-4 text-center">
            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xs font-body font-semibold uppercase tracking-[0.22em] mb-5"
              style={{ color: "rgba(184,150,12,0.8)" }}
            >
              Consulting Services
            </motion.p>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.1] tracking-tight mb-5"
            >
              Work With{" "}
              <span
                style={{
                  color: "#B8960C",
                  textShadow: "0 0 40px rgba(184,150,12,0.25)",
                }}
              >
                Chefiyke
              </span>
            </motion.h1>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-20 h-0.5 mx-auto mb-6 rounded-full"
              style={{ background: "rgba(184,150,12,0.55)" }}
            />

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.25 }}
              className="font-body text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto"
            >
              Strategy.&nbsp; Structure.&nbsp; Execution.
            </motion.p>

            {/* Builder's Dashboard note */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="inline-flex items-center gap-2 mt-8 px-4 py-2.5 rounded-xl"
              style={{
                background: "rgba(184,150,12,0.06)",
                border: "1px solid rgba(184,150,12,0.18)",
              }}
            >
              <LayoutDashboard size={14} style={{ color: "#B8960C" }} />
              <span
                className="font-body text-xs font-medium"
                style={{ color: "rgba(184,150,12,0.9)" }}
              >
                Select tiers include access to the Builder's Dashboard — a
                private client progress portal
              </span>
            </motion.div>
          </div>
        </section>

        {/* Tiers grid */}
        <section
          className="container mx-auto max-w-5xl px-4 py-16 md:py-20"
          data-ocid="consulting.tiers.section"
        >
          {isLoading ? (
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              data-ocid="consulting.tiers.loading_state"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton indices are stable
                  key={i}
                  className="rounded-2xl border border-border/30 h-64 animate-pulse"
                  style={{ background: "oklch(0.11 0 0)" }}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tiers.map((tier, i) => (
                <TierCard key={tier.id} tier={tier} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Bottom CTA */}
        <section
          className="border-t py-16"
          style={{
            borderColor: "rgba(184,150,12,0.1)",
            background: "oklch(0.10 0 0)",
          }}
          data-ocid="consulting.bottom_cta.section"
        >
          <div className="container mx-auto max-w-2xl px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-5"
            >
              <div
                className="w-8 h-0.5 rounded-full"
                style={{ background: "rgba(184,150,12,0.5)" }}
              />
              <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground">
                Not sure which tier fits?
              </h2>
              <p className="font-body text-sm text-muted-foreground max-w-md leading-relaxed">
                Send a message and I'll help you figure out exactly where to
                start based on your current situation and goals.
              </p>
              <a
                href={enquireHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{
                  background: "#B8960C",
                  color: "#0a0a0a",
                  boxShadow: "0 4px 20px rgba(184,150,12,0.3)",
                }}
                data-ocid="consulting.enquire_button"
              >
                Send a Message
              </a>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
