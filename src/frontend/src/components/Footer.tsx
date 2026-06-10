import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Settings } from "lucide-react";
import { useState } from "react";
import { FormSource } from "../backend";
import { useAdminCheck } from "../hooks/useAdminCheck";
import { scrollToSection } from "../utils/scroll";
import { BuyerInterestModal } from "./BuyerInterestModal";

const NAV_LINKS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "competence", label: "Competence" },
  { id: "how-i-help", label: "How I Help" },
  { id: "contact", label: "Contact" },
];

const LEGAL_LINKS = [
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/disclaimer", label: "Disclaimer" },
  { to: "/refund", label: "Refund Policy" },
];

export function Footer() {
  const year = new Date().getFullYear();
  const { isAuthenticated, login } = useInternetIdentity();
  const { isAdmin } = useAdminCheck();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleAdminClick = () => {
    if (isAuthenticated && isAdmin) {
      navigate({ to: "/admin" });
    } else if (!isAuthenticated) {
      login();
    }
  };

  return (
    <>
      <footer
        className="bg-background border-t border-border"
        data-ocid="footer.section"
      >
        {/* Divider accent */}
        <div className="gold-divider" />

        <div className="container mx-auto max-w-6xl px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Brand */}
            <div className="flex flex-col gap-2">
              <p className="font-display font-bold text-xl text-gradient-accent tracking-tight">
                Chefiyke
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Builder of ideas, systems, and people.
              </p>

              {/* Footer CTAs */}
              <div className="mt-3 flex flex-col gap-2">
                <p className="font-body text-xs text-muted-foreground">
                  Ready to own this page?
                </p>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  data-ocid="footer.get_your_version_button"
                  className="w-fit flex items-center gap-2 px-4 py-2 rounded-lg font-body text-xs font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
                  style={{
                    background: "rgba(184,150,12,0.07)",
                    border: "1px solid rgba(184,150,12,0.35)",
                    color: "#B8960C",
                  }}
                  onMouseEnter={(e) => {
                    const btn = e.currentTarget as HTMLButtonElement;
                    btn.style.background = "rgba(184,150,12,0.14)";
                    btn.style.borderColor = "rgba(184,150,12,0.60)";
                  }}
                  onMouseLeave={(e) => {
                    const btn = e.currentTarget as HTMLButtonElement;
                    btn.style.background = "rgba(184,150,12,0.07)";
                    btn.style.borderColor = "rgba(184,150,12,0.35)";
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: "#B8960C" }}
                  />
                  Get Your Own Version
                </button>

                {/* Affiliate CTA — visible to all visitors */}
                <div className="mt-1 flex flex-col gap-1">
                  <p className="font-body text-xs text-muted-foreground">
                    Earn 25% on every referral.
                  </p>
                  <Link
                    to="/affiliate/signup"
                    data-ocid="footer.become_affiliate_button"
                    className="w-fit flex items-center gap-2 px-4 py-2 rounded-lg font-body text-xs font-semibold transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
                    style={{
                      background: "rgba(184,150,12,0.15)",
                      border: "1.5px solid rgba(184,150,12,0.55)",
                      color: "#B8960C",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      el.style.background = "rgba(184,150,12,0.25)";
                      el.style.borderColor = "#B8960C";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      el.style.background = "rgba(184,150,12,0.15)";
                      el.style.borderColor = "rgba(184,150,12,0.55)";
                    }}
                  >
                    <span className="font-bold text-[11px]">✦</span>
                    Become My Affiliate
                  </Link>
                </div>
              </div>
            </div>

            {/* Nav — collapsed accordion */}
            <nav
              aria-label="Footer navigation"
              className="flex flex-col gap-0"
              data-ocid="footer.nav"
            >
              <button
                type="button"
                onClick={() => setNavOpen((prev) => !prev)}
                aria-expanded={navOpen}
                data-ocid="footer.navigate_toggle"
                className="flex items-center gap-1.5 w-fit font-display font-semibold text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors duration-200 mb-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
              >
                Navigate
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${navOpen ? "rotate-180" : "rotate-0"}`}
                />
              </button>

              <div
                className={`flex flex-col gap-1 overflow-hidden transition-all duration-300 ease-in-out ${
                  navOpen ? "max-h-64 opacity-100 mt-2" : "max-h-0 opacity-0"
                }`}
              >
                {NAV_LINKS.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => scrollToSection(`#${id}`)}
                    className="font-body text-sm text-muted-foreground hover:text-primary transition-colors duration-200 w-fit text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
                    data-ocid={`footer.${label.toLowerCase().replace(/\s+/g, "_")}_link`}
                  >
                    {label}
                  </button>
                ))}
                <Link
                  to="/gallery"
                  className="font-body text-sm text-muted-foreground hover:text-primary transition-colors duration-200 w-fit"
                  data-ocid="footer.gallery_link"
                >
                  Gallery
                </Link>
              </div>
            </nav>

            {/* Legal + Admin */}
            <div className="flex flex-col gap-2 md:text-right">
              <p className="font-body text-xs text-muted-foreground">
                © {year} Chefiyke. All rights reserved.
              </p>
              <p className="font-body text-xs text-muted-foreground">
                chefiyke.com — Authority. Clarity. Results.
              </p>

              {/* Hidden admin entry point — only visible when logged in and confirmed admin */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={handleAdminClick}
                  className="flex items-center gap-1 opacity-20 hover:opacity-60 transition-opacity duration-300 text-muted-foreground md:justify-end mt-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
                  aria-label="Admin portal"
                  title="Admin"
                  data-ocid="footer.admin_button"
                >
                  <Settings size={12} />
                  <span className="font-mono text-[10px]">A</span>
                </button>
              )}
            </div>
          </div>

          {/* Legal links row */}
          <div className="mt-10 pt-6 border-t border-border/40 flex flex-wrap gap-x-5 gap-y-2 justify-center md:justify-start">
            {LEGAL_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="font-body text-[11px] text-muted-foreground/60 hover:text-primary transition-colors duration-200"
                data-ocid={`footer.legal.${to.replace("/", "")}_link`}
                style={{ color: "rgba(184,150,12,0.55)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "#B8960C";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "rgba(184,150,12,0.55)";
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>

      <BuyerInterestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        formSource={FormSource.Footer}
      />
    </>
  );
}
