import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FormSource } from "../backend";
import { useHeroSlides } from "../hooks/usePageContent";
import { useThrottle } from "../hooks/useThrottle";
import { STATIC_HERO_SLIDES } from "../utils/imageAssets";
import { scrollToSection } from "../utils/scroll";
import { BuyerInterestModal } from "./BuyerInterestModal";
import { CosmicCanvas } from "./CosmicCanvas";
import { HeroSlide } from "./HeroSlide";

const AUTOPLAY_INTERVAL = 7000;
const RESUME_AFTER_HOVER = 2000;

function handleNav(href: string) {
  if (!href) return;
  // Internal routes start with / but not // — navigate in-app
  if (href.startsWith("/") && !href.startsWith("//")) {
    window.location.assign(href);
    return;
  }
  if (href.startsWith("#")) {
    scrollToSection(href);
    return;
  }
  window.open(href, "_blank", "noopener,noreferrer");
}

export function HeroCarousel() {
  // Use static fallback slides immediately so the carousel NEVER shows zero
  // slides while the backend query is loading or if it returns empty.
  const { data: backendSlides } = useHeroSlides();
  const slides =
    backendSlides && backendSlides.length > 0
      ? backendSlides
      : STATIC_HERO_SLIDES;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    skipSnaps: false,
    dragFree: false,
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const autoPlayTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHovering = useRef(false);
  const [modalOpen, setModalOpen] = useState(false);

  // ── Autoplay ─────────────────────────────────────────────────────────────────
  const startAutoPlay = useCallback(() => {
    if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
    autoPlayTimer.current = setInterval(() => {
      if (!isHovering.current && emblaApi) emblaApi.scrollNext();
    }, AUTOPLAY_INTERVAL);
  }, [emblaApi]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayTimer.current) {
      clearInterval(autoPlayTimer.current);
      autoPlayTimer.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    isHovering.current = true;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      isHovering.current = false;
    }, RESUME_AFTER_HOVER);
  }, []);

  // ── Embla sync ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setActiveIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || slides.length === 0) return;
    startAutoPlay();
    return () => stopAutoPlay();
  }, [emblaApi, slides.length, startAutoPlay, stopAutoPlay]);

  useEffect(() => {
    return () => {
      if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, []);

  // ── Throttled nav ────────────────────────────────────────────────────────────
  const goPrev = useThrottle(
    useCallback(() => {
      emblaApi?.scrollPrev();
    }, [emblaApi]),
    500,
  );

  const goNext = useThrottle(
    useCallback(() => {
      emblaApi?.scrollNext();
    }, [emblaApi]),
    500,
  );

  const goToSlideRaw = useCallback(
    (i: number) => {
      emblaApi?.scrollTo(i);
    },
    [emblaApi],
  );
  const goToSlide = useThrottle(
    useCallback(
      (...args: unknown[]) => goToSlideRaw(args[0] as number),
      [goToSlideRaw],
    ),
    400,
  );

  const handleGetLandingPage = useCallback(() => {
    setModalOpen(true);
  }, []);

  return (
    <>
      <section
        id="home"
        data-ocid="hero.section"
        aria-label="Hero carousel"
        className="relative w-full overflow-hidden bg-[#0a0a0a]"
        style={{ height: "100svh", minHeight: "580px" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Cosmic canvas — z-0, behind all content */}
        <CosmicCanvas />

        {/* Embla viewport */}
        <div ref={emblaRef} className="w-full h-full overflow-hidden">
          <div className="flex h-full will-change-transform">
            {slides.map((slide, i) => (
              <div
                key={slide.headline}
                className="relative w-full h-full flex-shrink-0 flex-grow-0"
                style={{ minWidth: "100%" }}
              >
                <HeroSlide
                  slide={slide}
                  index={i}
                  isActive={i === activeIndex}
                  onNav={handleNav}
                  onGetLandingPage={handleGetLandingPage}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Prev / Next arrows ── */}
        <button
          type="button"
          aria-label="Previous slide"
          data-ocid="hero.prev_button"
          onClick={goPrev}
          className="
            absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-30
            w-10 h-10 md:w-12 md:h-12 flex items-center justify-center
            rounded-full backdrop-blur-sm transition-smooth
            focus-visible:ring-2
          "
          style={{
            background: "rgba(10,10,10,0.45)",
            border: "1px solid rgba(184,150,12,0.25)",
            color: "rgba(255,255,255,0.75)",
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.background = "rgba(184,150,12,0.18)";
            btn.style.borderColor = "rgba(184,150,12,0.60)";
            btn.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.background = "rgba(10,10,10,0.45)";
            btn.style.borderColor = "rgba(184,150,12,0.25)";
            btn.style.color = "rgba(255,255,255,0.75)";
          }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          aria-label="Next slide"
          data-ocid="hero.next_button"
          onClick={goNext}
          className="
            absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-30
            w-10 h-10 md:w-12 md:h-12 flex items-center justify-center
            rounded-full backdrop-blur-sm transition-smooth
            focus-visible:ring-2
          "
          style={{
            background: "rgba(10,10,10,0.45)",
            border: "1px solid rgba(184,150,12,0.25)",
            color: "rgba(255,255,255,0.75)",
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.background = "rgba(184,150,12,0.18)";
            btn.style.borderColor = "rgba(184,150,12,0.60)";
            btn.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.background = "rgba(10,10,10,0.45)";
            btn.style.borderColor = "rgba(184,150,12,0.25)";
            btn.style.color = "rgba(255,255,255,0.75)";
          }}
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* ── Dot indicators ── */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3"
          role="tablist"
          aria-label="Slide indicators"
        >
          {slides.map((slide, i) => (
            <button
              key={`dot-${slide.headline}`}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Go to slide ${i + 1}`}
              data-ocid={`hero.dot.${i + 1}`}
              onClick={() => goToSlide(i)}
              className="rounded-full transition-smooth focus-visible:ring-2 focus-visible:ring-primary"
              style={
                i === activeIndex
                  ? {
                      width: "28px",
                      height: "6px",
                      background: "#B8960C",
                      boxShadow: "0 0 8px rgba(184,150,12,0.55)",
                    }
                  : {
                      width: "7px",
                      height: "7px",
                      background: "rgba(255,255,255,0.30)",
                    }
              }
            />
          ))}
        </div>

        {/* ── Scroll hint ── */}
        <div
          aria-hidden="true"
          className="absolute bottom-9 right-6 md:right-10 z-30 flex flex-col items-center gap-1.5"
          style={{ opacity: 0.35 }}
        >
          <span
            className="font-body text-[10px] uppercase text-white rotate-90 origin-center"
            style={{ letterSpacing: "0.22em" }}
          >
            Scroll
          </span>
          <div
            className="w-px h-8"
            style={{
              background:
                "linear-gradient(to bottom, rgba(184,150,12,0.7), transparent)",
            }}
          />
        </div>
      </section>

      <BuyerInterestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        formSource={FormSource.Hero}
      />
    </>
  );
}
