/**
 * Chefiyke Personal Image Assets — Three Approved Images Only
 * All paths point to /assets/images/ in the public folder.
 */

import type { HeroSlide } from "../types";

/** IMAGE 1 — Hero / Executive: black suit, full body, executive office, coffee-brown leather bag */
export const IMG_HERO_EXECUTIVE = "/assets/images/chefiyke-hero-executive.png";

/** IMAGE 2 — About / Identity: white agbada, red traditional cap, coral beads */
export const IMG_ABOUT_AGBADA_WHITE =
  "/assets/images/chefiyke-about-agbada-white.png";

/** IMAGE 3 — Presence / Authority: navy blue agbada, red cap, hands folded */
export const IMG_PRESENCE_AGBADA_NAVY =
  "/assets/images/chefiyke-presence-agbada-navy.png";

/**
 * IMAGE 3-B — Navy agbada in dark executive office environment (different viewpoint).
 * Used for the hero carousel slide 1 and the presence section.
 */
export const IMG_NAVY_AGBADA_OFFICE =
  "/assets/generated/hero-navy-agbada-office.dim_1200x1800.jpg";

/** Fallback placeholder when an image cannot be loaded */
export const IMG_PLACEHOLDER = "/assets/images/placeholder.svg";

/** IMAGE — Slide 1 hero: Royal Chef full body image */
export const IMG_HERO_ROYAL_CHEF = "/assets/chefiyke-hero-royal-chef.png";

/** IMAGE — Slide 2 hero: Suit/Office executive image */
export const IMG_HERO_SUIT_OFFICE = "/assets/chefiyke-hero-suit-office.png";

/** Hero carousel — per-slide default/fallback images */
export const HERO_SLIDES = [
  IMG_HERO_ROYAL_CHEF,
  IMG_HERO_SUIT_OFFICE,
  IMG_HERO_EXECUTIVE,
] as const;

/**
 * Static fallback slide content — used immediately on first render before the
 * backend responds. The carousel NEVER shows zero slides because of this.
 * Backend data replaces these values as soon as the query resolves.
 */
export const STATIC_HERO_SLIDES: HeroSlide[] = [
  {
    headline: "Most people have ideas. Very few build systems.",
    subheadline: "Chefiyke – The King of Wealth",
    body: "I help people and businesses turn scattered ideas into structured systems, premium digital experiences, stronger brands, and measurable results.",
    button1: { text: "Work With Me", href: "#contact" },
    button2: { text: "Explore My Systems", href: "/systems" },
  },
  {
    headline: "If your business isn't converting, something is missing.",
    subheadline: "Structure Creates Results",
    body: "Traffic, effort, and ideas mean nothing without structure. I build systems that help businesses attract attention, gain trust, and convert consistently.",
    button1: { text: "Get This Landing Page", href: "#contact" },
    button2: { text: "Work With Me", href: "#contact" },
  },
  {
    headline: "What you're building deserves structure.",
    subheadline: "Built to Scale",
    body: "From premium landing pages to backend-controlled platforms, I create systems designed to scale, perform, and stay in control.",
    button1: { text: "See How I Help", href: "#how-i-help" },
    button2: { text: "Explore My Systems", href: "/systems" },
  },
];
