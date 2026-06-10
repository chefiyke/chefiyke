import { Link } from "@tanstack/react-router";
import { AboutSection } from "../components/AboutSection";
import { AreasSection } from "../components/AreasSection";
import { CompetenceSection } from "../components/CompetenceSection";
import { ContactSection } from "../components/ContactSection";
import { HeroCarousel } from "../components/HeroCarousel";
import { HowIHelpSection } from "../components/HowIHelpSection";
import { Layout } from "../components/Layout";
import { PresenceSection } from "../components/PresenceSection";
import { PricingSection } from "../components/PricingSection";
import ProfileBlock from "../components/ProfileBlock";
import { SignatureEdgeSection } from "../components/SignatureEdgeSection";
import { TestimonialsSection } from "../components/TestimonialsSection";

export function HomePage() {
  return (
    <Layout>
      <HeroCarousel />
      <PresenceSection />
      <ProfileBlock />
      <div>
        <AboutSection />
      </div>
      <div>
        <CompetenceSection />
      </div>
      <SignatureEdgeSection />
      <AreasSection />
      <TestimonialsSection />
      <HowIHelpSection />

      {/* Pricing — only renders when backend has visible pricing items */}
      <PricingSection />

      <ContactSection />

      {/* Systems Portfolio CTA — links to /systems page */}
      <section
        className="py-12 border-t border-border"
        style={{ background: "oklch(0.09 0 0)" }}
        data-ocid="systems_cta.section"
      >
        <div className="container mx-auto max-w-3xl px-4 flex flex-col items-center gap-4 text-center">
          <div
            className="w-8 h-0.5 rounded-full"
            style={{ background: "rgba(184,150,12,0.5)" }}
          />
          <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground tracking-tight">
            See My Work in Action
          </h2>
          <p className="font-body text-sm md:text-base text-foreground/75 max-w-md leading-relaxed">
            Real apps. Real systems. Real results — browse the live platforms
            I've built and deployed.
          </p>
          <Link
            to="/systems"
            data-ocid="systems_cta.explore_button"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-lg font-body font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              border: "1.5px solid #B8960C",
              color: "#B8960C",
              background: "rgba(184,150,12,0.06)",
            }}
          >
            Explore My Systems
          </Link>
        </div>
      </section>

      {/* Affiliate CTA — public, conversion-focused, marketing language only */}
      <section
        className="py-14 border-t border-border"
        style={{ background: "rgba(184,150,12,0.04)" }}
        data-ocid="affiliate_cta.section"
      >
        <div className="container mx-auto max-w-3xl px-4 flex flex-col items-center gap-5 text-center">
          {/* Accent line */}
          <div
            className="w-10 h-0.5 rounded-full"
            style={{ background: "rgba(184,150,12,0.6)" }}
          />

          <h2
            className="font-display font-bold text-2xl md:text-3xl tracking-tight"
            style={{ color: "#B8960C" }}
          >
            Earn With Me
          </h2>

          <p className="font-body text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed">
            Refer clients and earn{" "}
            <span className="font-semibold" style={{ color: "#B8960C" }}>
              25% commission
            </span>{" "}
            on every successful sale — across all my projects and services. Free
            to join, instant approval, lifetime earnings.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-1">
            <Link
              to="/affiliate/signup"
              data-ocid="affiliate_cta.become_affiliate_button"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg font-body font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{
                background: "#B8960C",
                color: "#0a0a0a",
                boxShadow: "0 4px 20px rgba(184,150,12,0.30)",
              }}
            >
              <span className="text-base font-bold">✦</span>
              Become My Affiliate
            </Link>

            <p className="font-body text-xs text-muted-foreground">
              Free to join · Instant approval · Lifetime earnings
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
