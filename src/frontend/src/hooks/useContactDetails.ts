import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { ContactDetails, ContactPlatform } from "../backend.d";

// ─── Legacy hook (kept for backward compat) ──────────────────────────────────

export function useContactDetails() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<ContactDetails | null>({
    queryKey: ["contactDetails"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const details = await actor.getContactDetails();
        const hasAny =
          details.phone ||
          details.whatsapp ||
          details.facebook ||
          details.instagram ||
          details.x ||
          details.tiktok ||
          details.linkedin ||
          details.snapchat ||
          details.email ||
          (details.otherLinks && details.otherLinks.length > 0);
        return hasAny ? details : null;
      } catch {
        return null;
      }
    },
    enabled: !isFetching,
    staleTime: 60 * 1000,
  });
}

// ─── New 17-platform hook ─────────────────────────────────────────────────────

export function useContactPlatforms() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<ContactPlatform[]>({
    queryKey: ["contactPlatforms"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const platforms = await actor.getContactPlatforms();
        // Only return visible platforms, sorted by order ascending
        return platforms
          .filter((p) => p.isVisible)
          .sort((a, b) => Number(a.order) - Number(b.order));
      } catch {
        return [];
      }
    },
    enabled: !isFetching,
    staleTime: 60 * 1000,
  });
}
