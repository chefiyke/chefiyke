import { AnimatePresence, motion } from "motion/react";
import {
  storageIdToUrl,
  useBrandTagline,
  useHeroImageIds,
} from "../hooks/usePageContent";
import { useThrottle } from "../hooks/useThrottle";
import type { HeroSlide as HeroSlideType } from "../types";
import {
  IMG_HERO_EXECUTIVE,
  IMG_HERO_ROYAL_CHEF,
  IMG_HERO_SUIT_OFFICE,
} from "../utils/imageAssets";

// ─── Slide configuration ──────────────────────────────────────────────────────
interface SlideConfig {
  /** Left-side gradient that fills the dark content area */
  bgGradient: string;
  hasGoldGlow: boolean;
  image: string;
}

const SLIDE_CONFIGS: SlideConfig[] = [
  {
    // Slide 1 — Royal Chef: identity / authority
    bgGradient:
      "linear-gradient(135deg, #0a0a0a 0%, #111111 60%, #0d0d0d 100%)",
    hasGoldGlow: true,
    image: IMG_HERO_ROYAL_CHEF,
  },
  {
    // Slide 2 — Suit/Office: systems / structure
    bgGradient:
      "linear-gradient(135deg, #0a0a0a 0%, #0f0f0f 60%, #111111 100%)",
    hasGoldGlow: false,
    image: IMG_HERO_SUIT_OFFICE,
  },
  {
    // Slide 3 — impact / transformation
    bgGradient:
      "linear-gradient(135deg, #0d0d0d 0%, #0a0a0a 60%, #111111 100%)",
    hasGoldGlow: false,
    image: IMG_HERO_EXECUTIVE,
  },
];

/** Map slide index to the HeroImageIds key for that slot */
const SLIDE_IMAGE_KEYS = [
  "slide1ImageId",
  "slide2ImageId",
  "slide3ImageId",
] as const;

// ─── Decorative elements ──────────────────────────────────────────────────────

const GoldCrownGlow = () => (
  <div
    aria-hidden="true"
    className="absolute pointer-events-none z-[2]"
    style={{
      top: "-10%",
      left: "50%",
      transform: "translateX(-50%)",
      width: "700px",
      height: "700px",
      background:
        "radial-gradient(circle, rgba(184,150,12,0.10) 0%, transparent 65%)",
      filter: "blur(30px)",
    }}
  />
);

// ─── Component ───────────────────────────────────────────────────────────────

interface HeroSlideProps {
  slide: HeroSlideType;
  index: number;
  isActive: boolean;
  onNav: (href: string) => void;
  onGetLandingPage: () => void;
}

export function HeroSlide({
  slide,
  index,
  isActive,
  onNav,
  onGetLandingPage: _onGetLandingPage,
}: HeroSlideProps) {
  const handleBtn1 = useThrottle(() => onNav(slide.button1.href), 800);
  const handleBtn2 = useThrottle(() => onNav(slide.button2.href), 800);

  const { data: brandTagline = "The King of Wealth" } = useBrandTagline();
  const { data: heroImageIds = {} } = useHeroImageIds();

  const config = SLIDE_CONFIGS[index] ?? SLIDE_CONFIGS[0];
  const isSlide1 = index === 0;

  // Use backend image if set, fall back to static asset
  const imageKey = SLIDE_IMAGE_KEYS[index];
  const backendImageUrl = imageKey
    ? storageIdToUrl(heroImageIds[imageKey])
    : null;
  const slideImage = backendImageUrl ?? config.image;

  return (
    <div
      className="relative w-full h-full flex-shrink-0"
      aria-hidden={!isActive}
      style={{ background: config.bgGradient }}
    >
      {/* ── Subtle gold radial glow — Slide 1 only ── */}
      {isSlide1 && config.hasGoldGlow && <GoldCrownGlow />}

      {/* ── Full-body person image — right side, contained (NO cropping) ── */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 pointer-events-none select-none"
        style={{
          width: "100%",
          left: 0,
        }}
      >
        {/* Semi-transparent overlay on mobile so text remains readable */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.70) 40%, rgba(10,10,10,0.20) 75%, rgba(10,10,10,0.05) 100%)",
          }}
        />
        <img
          src={slideImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full"
          style={{
            objectFit: "contain",
            objectPosition: "right bottom",
            filter: "brightness(0.92) contrast(1.02)",
          }}
          loading="eager"
          draggable={false}
        />
      </div>

      {/* ── Gold bottom edge accent ── */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 z-[3] gold-divider opacity-40 pointer-events-none"
      />

      {/* ── Slide content ── */}
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.div
            key={`slide-content-${index}`}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 z-10 w-full flex items-center overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto px-6 md:px-12 w-full md:max-w-[55%] py-20 md:py-0">
              {/* Role tagline strip */}
              {slide.subheadline && (
                <motion.p
                  initial={{ opacity: 0, letterSpacing: "0.35em" }}
                  animate={{ opacity: 1, letterSpacing: "0.16em" }}
                  transition={{ duration: 0.85, delay: 0.08 }}
                  className="font-body text-[11px] md:text-sm uppercase tracking-[0.18em] mb-5 font-medium"
                  style={{ color: "#B8960C" }}
                >
                  {slide.subheadline}
                </motion.p>
              )}

              {/* Main headline */}
              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.72, delay: 0.14 }}
                className={`font-display font-bold leading-tight tracking-tight mb-4 text-white ${
                  isSlide1
                    ? "text-5xl md:text-7xl lg:text-8xl"
                    : "text-4xl md:text-5xl lg:text-6xl"
                }`}
                style={
                  isSlide1
                    ? {
                        background:
                          "linear-gradient(135deg, #C9A420 0%, #B8960C 45%, #C9A420 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        textShadow: "none",
                        filter: "drop-shadow(0 0 24px rgba(184,150,12,0.22))",
                      }
                    : {
                        textShadow:
                          "0 2px 20px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.4)",
                      }
                }
              >
                {slide.headline}
              </motion.h1>

              {/* Brand tagline — Slide 1 only, sourced from backend */}
              {isSlide1 && (
                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.22 }}
                  className="font-display font-semibold text-lg md:text-2xl lg:text-3xl tracking-widest uppercase mb-8"
                  style={{
                    color: "#B8960C",
                    letterSpacing: "0.22em",
                    textShadow: "0 1px 12px rgba(184,150,12,0.20)",
                  }}
                >
                  {brandTagline}
                </motion.p>
              )}

              {/* Body text */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: isSlide1 ? 0.3 : 0.22 }}
                className="font-body text-base md:text-lg leading-relaxed text-white/90 max-w-xl mb-8"
                style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}
              >
                {slide.body}
              </motion.p>

              {/* CTA Buttons — exactly 2 per slide, driven by backend slide config */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: isSlide1 ? 0.4 : 0.32 }}
                className="relative z-30 flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap"
              >
                {/* Primary — deep gold fill */}
                <button
                  type="button"
                  onClick={handleBtn1}
                  data-ocid={`hero.slide${index + 1}.primary_button`}
                  className="relative px-8 py-3.5 rounded-lg font-display font-semibold text-sm md:text-base min-w-[180px] transition-smooth focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97] overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, #C9A227 0%, #B8960C 60%, #A07B09 100%)",
                    color: "#0a0a0a",
                    boxShadow:
                      "0 0 18px rgba(184,150,12,0.28), 0 3px 10px rgba(0,0,0,0.35)",
                    border: "1px solid rgba(212,160,23,0.4)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform =
                      "scale(1.03)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 0 30px rgba(184,150,12,0.45), 0 4px 14px rgba(0,0,0,0.40)";
                    (e.currentTarget as HTMLButtonElement).style.filter =
                      "brightness(1.10)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform =
                      "scale(1)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 0 18px rgba(184,150,12,0.28), 0 3px 10px rgba(0,0,0,0.35)";
                    (e.currentTarget as HTMLButtonElement).style.filter = "";
                  }}
                >
                  {slide.button1.text}
                </button>

                {/* Secondary — transparent with gold border */}
                <button
                  type="button"
                  onClick={handleBtn2}
                  data-ocid={`hero.slide${index + 1}.secondary_button`}
                  className="px-8 py-3.5 rounded-lg font-display font-semibold text-sm md:text-base min-w-[180px] text-white transition-smooth active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{
                    background: "rgba(0,0,0,0.15)",
                    border: "1.5px solid rgba(184,150,12,0.55)",
                    backdropFilter: "blur(4px)",
                    color: "#ffffff",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform =
                      "scale(1.03)";
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(184,150,12,0.14)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "rgba(184,150,12,0.85)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform =
                      "scale(1)";
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(0,0,0,0.15)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "rgba(184,150,12,0.55)";
                  }}
                >
                  {slide.button2.text}
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
