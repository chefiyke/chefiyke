import { Linkedin, Mail, Phone } from "lucide-react";
import { motion } from "motion/react";
import {
  SiFacebook,
  SiInstagram,
  SiPinterest,
  SiReddit,
  SiSnapchat,
  SiTelegram,
  SiThreads,
  SiTiktok,
  SiTwitch,
  SiWhatsapp,
  SiX,
  SiYoutube,
} from "react-icons/si";
import type { ContactPlatform } from "../backend.d";
import { useContactPlatforms } from "../hooks/useContactDetails";
import { useContactLinks } from "../hooks/usePageContent";
import { useThrottle } from "../hooks/useThrottle";
import { ContactForm } from "./ContactForm";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function openEmailSafe(encoded: string) {
  try {
    let decoded: string;
    try {
      decoded = atob(encoded);
    } catch {
      decoded = encoded;
    }
    window.open(`mailto:${decoded}`, "_blank", "noopener,noreferrer");
  } catch {
    // silently fail — never expose in DOM
  }
}

function openUrl(url: string) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

function openWhatsApp(raw: string) {
  const url = raw.startsWith("https://")
    ? raw
    : `https://wa.me/${raw.replace(/\D/g, "")}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

// ─── Platform icon mapping ────────────────────────────────────────────────────

interface PlatformMeta {
  icon: React.ReactNode;
  color: string;
}

function getPlatformMeta(platformKey: string): PlatformMeta {
  switch (platformKey.toLowerCase()) {
    case "whatsapp":
      return {
        icon: (
          <SiWhatsapp
            className="w-5 h-5 shrink-0"
            style={{ color: "#25D366" }}
            aria-hidden
          />
        ),
        color: "#25D366",
      };
    case "facebook":
      return {
        icon: (
          <SiFacebook
            className="w-5 h-5 shrink-0"
            style={{ color: "#1877F2" }}
            aria-hidden
          />
        ),
        color: "#1877F2",
      };
    case "instagram":
      return {
        icon: (
          <SiInstagram
            className="w-5 h-5 shrink-0"
            style={{ color: "#E1306C" }}
            aria-hidden
          />
        ),
        color: "#E1306C",
      };
    case "x":
    case "twitter":
      return {
        icon: <SiX className="w-5 h-5 shrink-0 text-foreground" aria-hidden />,
        color: "#888888",
      };
    case "tiktok":
      return {
        icon: (
          <SiTiktok className="w-5 h-5 shrink-0 text-foreground" aria-hidden />
        ),
        color: "#888888",
      };
    case "linkedin":
      return {
        icon: (
          <Linkedin
            className="w-5 h-5 shrink-0"
            style={{ color: "#0A66C2" }}
            strokeWidth={1.5}
            aria-hidden
          />
        ),
        color: "#0A66C2",
      };
    case "snapchat":
      return {
        icon: (
          <SiSnapchat className="w-5 h-5 shrink-0 text-primary" aria-hidden />
        ),
        color: "#B8960C",
      };
    case "youtube":
      return {
        icon: (
          <SiYoutube
            className="w-5 h-5 shrink-0"
            style={{ color: "#FF0000" }}
            aria-hidden
          />
        ),
        color: "#FF0000",
      };
    case "telegram":
      return {
        icon: (
          <SiTelegram
            className="w-5 h-5 shrink-0"
            style={{ color: "#26A5E4" }}
            aria-hidden
          />
        ),
        color: "#26A5E4",
      };
    case "threads":
      return {
        icon: (
          <SiThreads className="w-5 h-5 shrink-0 text-foreground" aria-hidden />
        ),
        color: "#888888",
      };
    case "twitch":
      return {
        icon: (
          <SiTwitch
            className="w-5 h-5 shrink-0"
            style={{ color: "#9146FF" }}
            aria-hidden
          />
        ),
        color: "#9146FF",
      };
    case "reddit":
      return {
        icon: (
          <SiReddit
            className="w-5 h-5 shrink-0"
            style={{ color: "#FF4500" }}
            aria-hidden
          />
        ),
        color: "#FF4500",
      };
    case "pinterest":
      return {
        icon: (
          <SiPinterest
            className="w-5 h-5 shrink-0"
            style={{ color: "#E60023" }}
            aria-hidden
          />
        ),
        color: "#E60023",
      };
    case "email":
      return {
        icon: (
          <Mail
            className="w-5 h-5 shrink-0 text-primary"
            strokeWidth={1.5}
            aria-hidden
          />
        ),
        color: "#B8960C",
      };
    case "phone":
      return {
        icon: (
          <Phone
            className="w-5 h-5 shrink-0 text-primary"
            strokeWidth={1.5}
            aria-hidden
          />
        ),
        color: "#B8960C",
      };
    default:
      return {
        icon: (
          <span className="w-5 h-5 shrink-0 text-muted-foreground text-base">
            🔗
          </span>
        ),
        color: "#888888",
      };
  }
}

function handlePlatformClick(platform: ContactPlatform) {
  const key = platform.platformKey.toLowerCase();
  if (key === "whatsapp") {
    openWhatsApp(platform.url);
  } else if (key === "email") {
    openEmailSafe(platform.url);
  } else if (key === "phone") {
    window.open(`tel:${platform.url}`, "_blank", "noopener,noreferrer");
  } else {
    openUrl(platform.url);
  }
}

// ─── Platform button ──────────────────────────────────────────────────────────

function PlatformButton({
  platform,
  index,
}: {
  platform: ContactPlatform;
  index: number;
}) {
  const meta = getPlatformMeta(platform.platformKey);
  const label = platform.displayLabel ?? platform.platformName;

  return (
    <button
      type="button"
      data-ocid={`contact.platform.item.${index + 1}`}
      onClick={() => handlePlatformClick(platform)}
      className="flex items-center gap-3 bg-card border border-border rounded-xl px-5 py-4 transition-smooth group text-left min-h-[56px] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Contact via ${label}`}
      style={
        {
          "--hover-color": meta.color,
        } as React.CSSProperties
      }
    >
      {meta.icon}
      <span className="font-body font-medium text-foreground group-hover:opacity-80 transition-colors duration-200 text-sm truncate">
        {label}
      </span>
    </button>
  );
}

// ─── Fallback static buttons ──────────────────────────────────────────────────

function StaticFallback({
  onWhatsApp,
  onEmail,
  onFacebook,
  onInstagram,
}: {
  onWhatsApp: () => void;
  onEmail: () => void;
  onFacebook: () => void;
  onInstagram: () => void;
}) {
  return (
    <>
      <button
        type="button"
        data-ocid="contact.whatsapp_button"
        onClick={onWhatsApp}
        className="flex items-center gap-3 bg-card border border-border hover:border-[#25D366]/50 rounded-xl px-5 py-4 transition-smooth group hover:bg-[#25D366]/5 text-left min-h-[56px]"
        aria-label="Contact via WhatsApp"
      >
        <SiWhatsapp
          className="w-5 h-5 shrink-0"
          style={{ color: "#25D366" }}
          aria-hidden
        />
        <span className="font-body font-medium text-foreground group-hover:text-[#25D366] transition-colors duration-200 text-sm">
          WhatsApp
        </span>
      </button>
      <button
        type="button"
        data-ocid="contact.facebook_button"
        onClick={onFacebook}
        className="flex items-center gap-3 bg-card border border-border hover:border-[#1877F2]/50 rounded-xl px-5 py-4 transition-smooth group hover:bg-[#1877F2]/5 text-left min-h-[56px]"
        aria-label="Contact via Facebook"
      >
        <SiFacebook
          className="w-5 h-5 shrink-0"
          style={{ color: "#1877F2" }}
          aria-hidden
        />
        <span className="font-body font-medium text-foreground group-hover:text-[#1877F2] transition-colors duration-200 text-sm">
          Facebook
        </span>
      </button>
      <button
        type="button"
        data-ocid="contact.instagram_button"
        onClick={onInstagram}
        className="flex items-center gap-3 bg-card border border-border hover:border-pink-500/50 rounded-xl px-5 py-4 transition-smooth group hover:bg-pink-500/5 text-left min-h-[56px]"
        aria-label="Contact via Instagram"
      >
        <SiInstagram
          className="w-5 h-5 shrink-0"
          style={{ color: "#E1306C" }}
          aria-hidden
        />
        <span className="font-body font-medium text-foreground group-hover:text-pink-400 transition-colors duration-200 text-sm">
          Instagram
        </span>
      </button>
      <button
        type="button"
        data-ocid="contact.email_button"
        onClick={onEmail}
        className="flex items-center gap-3 bg-card border border-border hover:border-primary/50 rounded-xl px-5 py-4 transition-smooth group hover:bg-primary/5 text-left min-h-[56px]"
        aria-label="Contact via Email"
      >
        <Mail
          className="w-5 h-5 shrink-0 text-primary"
          strokeWidth={1.5}
          aria-hidden
        />
        <span className="font-body font-medium text-foreground group-hover:text-primary transition-colors duration-200 text-sm">
          Email
        </span>
      </button>
    </>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function ContactSection() {
  const { data: staticLinks } = useContactLinks();
  const { data: platforms } = useContactPlatforms();

  const hasPlatforms = platforms && platforms.length > 0;

  const throttledWhatsApp = useThrottle(() => {
    if (staticLinks?.whatsapp) openWhatsApp(staticLinks.whatsapp);
  }, 300);

  const throttledEmail = useThrottle(() => {
    if (staticLinks?.email) openEmailSafe(staticLinks.email);
  }, 300);

  const throttledFacebook = useThrottle(() => {
    if (staticLinks?.facebook) openUrl(staticLinks.facebook);
  }, 300);

  const throttledInstagram = useThrottle(() => {
    if (staticLinks?.instagram) openUrl(staticLinks.instagram);
  }, 300);

  return (
    <section
      id="contact"
      className="section-pad bg-background"
      data-ocid="contact.section"
    >
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-body uppercase tracking-[0.2em] text-primary mb-3 opacity-80">
            Get In Touch
          </p>
          <h2 className="heading-lg text-foreground">
            Let's Build Something Meaningful
          </h2>
          <div className="gold-divider w-24 mx-auto mt-5 mb-6" />
          <p className="body-lg text-muted-foreground max-w-xl mx-auto">
            Need clarity, strategy, structure, or digital direction? Let's talk.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Social / Platform Buttons */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col gap-6"
          >
            <p className="font-display font-semibold text-foreground/80 text-sm uppercase tracking-widest">
              Connect Directly
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {hasPlatforms ? (
                platforms.map((platform, i) => (
                  <PlatformButton
                    key={platform.id}
                    platform={platform}
                    index={i}
                  />
                ))
              ) : (
                <StaticFallback
                  onWhatsApp={throttledWhatsApp}
                  onEmail={throttledEmail}
                  onFacebook={throttledFacebook}
                  onInstagram={throttledInstagram}
                />
              )}
            </div>

            {/* Security note */}
            <p className="text-xs text-muted-foreground font-body">
              🔒 Contact links are secure. Email is never exposed in page
              source.
            </p>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card rounded-2xl p-7 md:p-9 border border-border shadow-elevated"
          >
            <h3 className="heading-md text-foreground mb-6">
              Send a Direct Message
            </h3>
            <ContactForm />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
