import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { createActor } from "../backend";
import type {
  Bundle,
  CompetencePricing,
  ConsultancyService,
  GiveawayItem,
  LandingPageOffer,
  PricingData,
} from "../backend.d";
import { CryptoPaymentOption } from "./admin/AdminCryptoPayment";

// ─── Hook ──────────────────────────────────────────────────────────────────────

function usePricingData() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<PricingData | null>({
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
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(price: bigint, currency: string) {
  const num = Number(price);
  const cur = currency || "NGN";
  if (cur === "NGN") {
    return `₦${num.toLocaleString()}`;
  }
  return `${cur} ${num.toLocaleString()}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-body uppercase tracking-[0.2em] text-primary opacity-70 mb-2">
      {children}
    </p>
  );
}

function GroupHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display font-bold text-xl md:text-2xl text-foreground mb-6">
      {children}
    </h3>
  );
}

// Landing Page Offers
function LandingOfferCard({
  offer,
  index,
}: {
  offer: LandingPageOffer;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="relative bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 card-hover"
      data-ocid={`pricing.landing_offer.item.${index + 1}`}
    >
      {/* Tier badge */}
      <span
        className="inline-block self-start text-[11px] font-display font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
        style={{
          background: "rgba(184,150,12,0.12)",
          color: "#B8960C",
          border: "1px solid rgba(184,150,12,0.25)",
        }}
      >
        {offer.tier}
      </span>

      <div>
        <h4 className="font-display font-bold text-lg text-foreground leading-snug">
          {offer.title}
        </h4>
        <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">
          {offer.description}
        </p>
      </div>

      <div className="mt-auto pt-3 border-t border-border">
        <p
          className="font-display font-bold text-2xl"
          style={{ color: "#B8960C" }}
        >
          {formatPrice(offer.price, offer.currency)}
        </p>
        <CryptoPaymentOption
          offerId={offer.id}
          offerTitle={offer.title}
          price={offer.price}
          currency={offer.currency}
        />
      </div>
    </motion.div>
  );
}

// Consultancy Services
function ConsultancyCard({
  service,
  index,
}: {
  service: ConsultancyService;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-3 card-hover"
      data-ocid={`pricing.consultancy.item.${index + 1}`}
    >
      <h4 className="font-display font-semibold text-base text-foreground">
        {service.title}
      </h4>
      <p className="font-body text-sm text-muted-foreground leading-relaxed flex-1">
        {service.description}
      </p>
      <p
        className="font-display font-bold text-xl mt-auto"
        style={{ color: "#B8960C" }}
      >
        {formatPrice(service.price, service.currency)}
      </p>
    </motion.div>
  );
}

// Competence Pricing
function CompetenceCard({
  item,
  index,
}: {
  item: CompetencePricing;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-2 card-hover"
      data-ocid={`pricing.competence.item.${index + 1}`}
    >
      <h4 className="font-display font-semibold text-sm text-foreground">
        {item.title}
      </h4>
      <p className="font-body text-xs text-muted-foreground leading-relaxed flex-1">
        {item.shortDescription}
      </p>
      <p
        className="font-display font-bold text-lg mt-1"
        style={{ color: "#B8960C" }}
      >
        {formatPrice(item.price, item.currency)}
      </p>
    </motion.div>
  );
}

// Bundles
function BundleCard({ bundle, index }: { bundle: Bundle; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="relative bg-card border rounded-2xl p-6 flex flex-col gap-3 card-hover overflow-hidden"
      style={{ borderColor: "rgba(184,150,12,0.3)" }}
      data-ocid={`pricing.bundle.item.${index + 1}`}
    >
      {/* Bundle badge */}
      <span
        className="absolute top-4 right-4 text-[10px] font-display font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
        style={{
          background: "rgba(184,150,12,0.18)",
          color: "#B8960C",
        }}
      >
        Bundle Deal
      </span>

      <h4 className="font-display font-semibold text-base text-foreground pr-20">
        {bundle.title}
      </h4>
      <p className="font-body text-sm text-muted-foreground leading-relaxed flex-1">
        {bundle.description}
      </p>
      <p
        className="font-display font-bold text-2xl mt-auto"
        style={{ color: "#B8960C" }}
      >
        {formatPrice(bundle.bundlePrice, bundle.currency)}
      </p>
    </motion.div>
  );
}

// Giveaways
function GiveawayCard({ item, index }: { item: GiveawayItem; index: number }) {
  const isActuallyFree = item.isFree || !item.discountedPrice;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="relative bg-card border border-border rounded-2xl p-6 flex flex-col gap-3 card-hover overflow-hidden"
      data-ocid={`pricing.giveaway.item.${index + 1}`}
    >
      {/* Status ribbon */}
      {!item.isActive && (
        <span className="absolute top-3 right-3 text-[10px] font-body uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          Inactive
        </span>
      )}

      <div className="flex items-start gap-3">
        <span
          className="inline-block text-xs font-display font-bold uppercase tracking-wider px-3 py-1 rounded-full shrink-0"
          style={
            isActuallyFree
              ? {
                  background: "rgba(184,150,12,0.18)",
                  color: "#B8960C",
                  border: "1px solid rgba(184,150,12,0.3)",
                }
              : {
                  background: "rgba(99,220,99,0.1)",
                  color: "#5cb85c",
                  border: "1px solid rgba(99,220,99,0.25)",
                }
          }
        >
          {isActuallyFree ? "Free" : "Special Offer"}
        </span>
      </div>

      <h4 className="font-display font-semibold text-base text-foreground">
        {item.title}
      </h4>
      <p className="font-body text-sm text-muted-foreground leading-relaxed flex-1">
        {item.description}
      </p>

      <p
        className="font-display font-bold text-xl mt-auto"
        style={{ color: "#B8960C" }}
      >
        {isActuallyFree
          ? "FREE"
          : formatPrice(item.discountedPrice!, item.currency)}
      </p>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function PricingSection() {
  const { data: pricing, isLoading } = usePricingData();

  if (isLoading) return null;
  if (!pricing) return null;

  const visibleLanding = pricing.landingPageOffers.filter((o) => o.isVisible);
  const visibleConsultancy = pricing.consultancyServices
    .filter((s) => s.isVisible)
    .sort((a, b) => Number(a.order) - Number(b.order));
  const visibleCompetence = pricing.competencePricing
    .filter((c) => c.isVisible)
    .sort((a, b) => Number(a.order) - Number(b.order));
  const visibleBundles = pricing.bundles
    .filter((b) => b.isVisible)
    .sort((a, b) => Number(a.order) - Number(b.order));
  const visibleGiveaways = pricing.giveaways
    .filter((g) => g.isVisible)
    .sort((a, b) => Number(a.order) - Number(b.order));

  const hasContent =
    visibleLanding.length > 0 ||
    visibleConsultancy.length > 0 ||
    visibleCompetence.length > 0 ||
    visibleBundles.length > 0 ||
    visibleGiveaways.length > 0;

  if (!hasContent) return null;

  return (
    <section
      id="pricing"
      className="section-pad"
      style={{ background: "rgba(184,150,12,0.02)" }}
      data-ocid="pricing.section"
    >
      <div className="container mx-auto max-w-6xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <SectionLabel>Investment</SectionLabel>
          <h2 className="heading-lg text-foreground">Work With Me</h2>
          <div className="gold-divider w-24 mx-auto mt-5 mb-6" />
          <p className="body-lg text-muted-foreground max-w-xl mx-auto">
            Transparent pricing for every service. Pick what fits your stage and
            goals.
          </p>
        </motion.div>

        <div className="space-y-16">
          {/* Landing Page Offers */}
          {visibleLanding.length > 0 && (
            <div data-ocid="pricing.landing_offers.panel">
              <SectionLabel>Landing Page Packages</SectionLabel>
              <GroupHeading>Premium Landing Page Offers</GroupHeading>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleLanding.map((offer, i) => (
                  <LandingOfferCard key={offer.id} offer={offer} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Consultancy Services */}
          {visibleConsultancy.length > 0 && (
            <div data-ocid="pricing.consultancy.panel">
              <SectionLabel>Consultancy</SectionLabel>
              <GroupHeading>Strategy & Advisory Services</GroupHeading>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleConsultancy.map((service, i) => (
                  <ConsultancyCard
                    key={service.id}
                    service={service}
                    index={i}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Competence-based pricing */}
          {visibleCompetence.length > 0 && (
            <div data-ocid="pricing.competence.panel">
              <SectionLabel>By Competence</SectionLabel>
              <GroupHeading>Area-Specific Pricing</GroupHeading>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {visibleCompetence.map((item, i) => (
                  <CompetenceCard key={item.id} item={item} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Bundles */}
          {visibleBundles.length > 0 && (
            <div data-ocid="pricing.bundles.panel">
              <SectionLabel>Combo Packages</SectionLabel>
              <GroupHeading>Bundle Deals</GroupHeading>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {visibleBundles.map((bundle, i) => (
                  <BundleCard key={bundle.id} bundle={bundle} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Giveaways */}
          {visibleGiveaways.length > 0 && (
            <div data-ocid="pricing.giveaways.panel">
              <SectionLabel>Special Offers</SectionLabel>
              <GroupHeading>Free & Discounted Resources</GroupHeading>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleGiveaways.map((item, i) => (
                  <GiveawayCard key={item.id} item={item} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
