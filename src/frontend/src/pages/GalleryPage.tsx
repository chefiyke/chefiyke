import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { createActor } from "../backend";
import { Layout } from "../components/Layout";
import type { GalleryImage } from "../types";

function GalleryGrid({ images }: { images: GalleryImage[] }) {
  if (images.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-24 text-center"
        data-ocid="gallery.empty_state"
      >
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-5">
          <ImageIcon className="text-muted-foreground" size={28} />
        </div>
        <h2 className="font-display font-semibold text-lg text-foreground mb-2">
          No photos yet
        </h2>
        <p className="font-body text-sm text-muted-foreground max-w-xs">
          Check back soon — photos will appear here once uploaded.
        </p>
      </div>
    );
  }

  return (
    <div
      className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-0"
      data-ocid="gallery.list"
    >
      {images.map((img, i) => {
        if (!img.storageId?.trim()) return null;
        return (
          <div
            key={String(img.id)}
            className="break-inside-avoid mb-4 rounded-xl overflow-hidden bg-card border border-border group cursor-pointer hover:border-primary/30 transition-colors duration-200"
            data-ocid={`gallery.item.${i + 1}`}
          >
            <div className="relative overflow-hidden">
              <img
                src={img.storageId}
                alt={img.caption || `Gallery photo ${i + 1}`}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
            </div>
            {img.caption && (
              <div className="px-3 py-2.5 border-t border-border/60">
                <p className="font-body text-xs text-muted-foreground leading-snug">
                  {img.caption}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function GalleryPage() {
  const { actor, isFetching } = useActor(createActor);
  const { data: images = [], isLoading } = useQuery<GalleryImage[]>({
    queryKey: ["galleryImages"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return (await actor.getGalleryImages()) as GalleryImage[];
      } catch {
        return [];
      }
    },
    enabled: !isFetching,
  });

  return (
    <Layout>
      <section
        className="section-pad bg-background min-h-[70vh]"
        data-ocid="gallery.page"
      >
        <div className="max-w-6xl mx-auto">
          {/* Back link */}
          <a
            href="/"
            className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-primary transition-colors duration-200 mb-10"
            data-ocid="gallery.back_link"
          >
            <ArrowLeft size={15} />
            Back to site
          </a>

          {/* Page header */}
          <div className="mb-12">
            <p className="font-body text-sm uppercase tracking-[0.2em] text-primary mb-3">
              Visual
            </p>
            <h1 className="heading-lg text-foreground mb-0">Gallery</h1>
            <div
              className="mt-4 h-0.5 rounded-full"
              style={{
                width: "3rem",
                background:
                  "linear-gradient(90deg, oklch(var(--primary)) 0%, oklch(var(--primary)/0.3) 100%)",
              }}
            />
          </div>

          {isLoading ? (
            <div
              className="columns-1 sm:columns-2 lg:columns-3 gap-4"
              data-ocid="gallery.loading_state"
            >
              {[180, 240, 200, 160, 220, 190].map((h) => (
                <div key={h} className="break-inside-avoid mb-4">
                  <Skeleton
                    className="w-full rounded-xl"
                    style={{ height: h }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <GalleryGrid images={images} />
          )}
        </div>
      </section>
    </Layout>
  );
}
