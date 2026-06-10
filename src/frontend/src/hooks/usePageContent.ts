import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  AboutSection,
  CompetenceCard,
  ContactLinks,
  HelpBlock,
  HeroSlide,
  PageContent,
  SignatureEdge,
  Testimonial,
} from "../types";

// ─── Static Defaults (structural only — no hardcoded text content) ───────────
//
// These are intentionally empty so the frontend always waits for real backend
// data. Showing hardcoded text before the backend responds would let stale
// placeholder content appear as if it were the owner's real saved content.

const DEFAULT_ABOUT: AboutSection = { title: "", bio: "" };
const DEFAULT_CONTACT_LINKS: ContactLinks = {
  whatsapp: "",
  facebook: "",
  instagram: "",
  email: "",
  primaryCtaText: "",
};
const DEFAULT_SIGNATURE_EDGE: SignatureEdge = {
  pillar1: "",
  pillar2: "",
  pillar3: "",
  quote: "",
};

// ─── Hooks ─────────────────────────────────────────────────────────────────

export function useHeroSlides() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<HeroSlide[]>({
    queryKey: ["heroSlides"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getHeroSlides();
      } catch {
        return [];
      }
    },
    enabled: !isFetching,
  });
}

export function useAbout() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AboutSection>({
    queryKey: ["about"],
    queryFn: async () => {
      if (!actor) return DEFAULT_ABOUT;
      try {
        return await actor.getAbout();
      } catch {
        return DEFAULT_ABOUT;
      }
    },
    enabled: !isFetching,
  });
}

export function useCompetenceCards() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<CompetenceCard[]>({
    queryKey: ["competenceCards"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getCompetenceCards();
      } catch {
        return [];
      }
    },
    enabled: !isFetching,
  });
}

/** Returns only visible competence cards — for public frontend display.
 *  Falls back to all cards if the new backend method is not yet deployed. */
export function useCompetenceCardsVisible() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<CompetenceCard[]>({
    queryKey: ["competenceCardsVisible"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const extActor = actor as typeof actor & {
          getCompetenceCardsVisible?: () => Promise<CompetenceCard[]>;
        };
        if (typeof extActor.getCompetenceCardsVisible === "function") {
          return await extActor.getCompetenceCardsVisible();
        }
        return await actor.getCompetenceCards();
      } catch {
        return [];
      }
    },
    enabled: !isFetching,
  });
}

/** Whether the entire competence section is toggled visible on the frontend */
export function useCompetenceSectionVisible() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<boolean>({
    queryKey: ["competenceSectionVisible"],
    queryFn: async () => {
      if (!actor) return true;
      try {
        const extActor = actor as typeof actor & {
          getCompetenceSectionVisible?: () => Promise<boolean>;
        };
        if (typeof extActor.getCompetenceSectionVisible === "function") {
          return await extActor.getCompetenceSectionVisible();
        }
        return true;
      } catch {
        return true;
      }
    },
    enabled: !isFetching,
  });
}

/** Brand tagline displayed under the main headline on Slide 1 */
export function useBrandTagline() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<string>({
    queryKey: ["brandTagline"],
    queryFn: async () => {
      if (!actor) return "";
      try {
        const extActor = actor as typeof actor & {
          getBrandTagline?: () => Promise<string>;
        };
        if (typeof extActor.getBrandTagline === "function") {
          return await extActor.getBrandTagline();
        }
        return "";
      } catch {
        return "";
      }
    },
    enabled: !isFetching,
  });
}

/** Image storage IDs for the 5 named section slots */
export interface HeroImageIds {
  slide1ImageId?: string;
  slide2ImageId?: string;
  slide3ImageId?: string;
  aboutImageId?: string;
  presenceImageId?: string;
}

export function useHeroImageIds() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<HeroImageIds>({
    queryKey: ["heroImageIds"],
    queryFn: async () => {
      if (!actor) return {};
      try {
        const extActor = actor as typeof actor & {
          getHeroImageIds?: () => Promise<HeroImageIds>;
        };
        if (typeof extActor.getHeroImageIds === "function") {
          return (await extActor.getHeroImageIds()) ?? {};
        }
        return {};
      } catch {
        return {};
      }
    },
    enabled: !isFetching,
  });
}

/** Convert an object-storage storage ID to its public URL */
export function storageIdToUrl(
  storageId: string | undefined | null,
): string | null {
  if (!storageId) return null;
  return `/api/storage/${storageId}`;
}

export function useHelpBlocks() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<HelpBlock[]>({
    queryKey: ["helpBlocks"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getHelpBlocks();
      } catch {
        return [];
      }
    },
    enabled: !isFetching,
  });
}

/** Fetches only visible testimonials for public display.
 *  Falls back to all testimonials if getVisibleTestimonials is not yet deployed. */
export function useTestimonials() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Testimonial[]>({
    queryKey: ["testimonials"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const extActor = actor as typeof actor & {
          getVisibleTestimonials?: () => Promise<Testimonial[]>;
        };
        if (typeof extActor.getVisibleTestimonials === "function") {
          return await extActor.getVisibleTestimonials();
        }
        return await actor.getTestimonials();
      } catch {
        return [];
      }
    },
    enabled: !isFetching,
  });
}

export function useContactLinks() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ContactLinks>({
    queryKey: ["contactLinks"],
    queryFn: async () => {
      if (!actor) return DEFAULT_CONTACT_LINKS;
      try {
        return await actor.getContactLinks();
      } catch {
        return DEFAULT_CONTACT_LINKS;
      }
    },
    enabled: !isFetching,
  });
}

export function useSignatureEdge() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<SignatureEdge>({
    queryKey: ["signatureEdge"],
    queryFn: async () => {
      if (!actor) return DEFAULT_SIGNATURE_EDGE;
      try {
        return await actor.getSignatureEdge();
      } catch {
        return DEFAULT_SIGNATURE_EDGE;
      }
    },
    enabled: !isFetching,
  });
}

/** Aggregate hook — fetches all page content in parallel */
export function usePageContent() {
  const heroQuery = useHeroSlides();
  const aboutQuery = useAbout();
  const competenceQuery = useCompetenceCards();
  const helpQuery = useHelpBlocks();
  const testimonialsQuery = useTestimonials();
  const contactQuery = useContactLinks();
  const signatureQuery = useSignatureEdge();

  const isLoading =
    heroQuery.isLoading ||
    aboutQuery.isLoading ||
    competenceQuery.isLoading ||
    helpQuery.isLoading ||
    testimonialsQuery.isLoading ||
    contactQuery.isLoading ||
    signatureQuery.isLoading;

  const content: PageContent = {
    heroSlides: heroQuery.data ?? [],
    about: aboutQuery.data ?? DEFAULT_ABOUT,
    competenceCards: competenceQuery.data ?? [],
    helpBlocks: helpQuery.data ?? [],
    testimonials: testimonialsQuery.data ?? [],
    contactLinks: contactQuery.data ?? DEFAULT_CONTACT_LINKS,
    signatureEdge: signatureQuery.data ?? DEFAULT_SIGNATURE_EDGE,
  };

  return { content, isLoading };
}
