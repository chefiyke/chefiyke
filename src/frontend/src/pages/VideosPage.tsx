import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, PlayCircle } from "lucide-react";
import { createActor } from "../backend";
import type { GalleryVideo } from "../backend";
import { Layout } from "../components/Layout";

function formatDate(ts: bigint) {
  return new Date(Number(ts / 1_000_000n)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isSafeUrl(url: string): boolean {
  if (!url || !url.trim()) return false;
  const lower = url.toLowerCase().trim();
  return lower.startsWith("https://") || lower.startsWith("http://");
}

function VideoCard({ video, index }: { video: GalleryVideo; index: number }) {
  if (!isSafeUrl(video.url)) return null;
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-200 hover:shadow-elevated group"
      data-ocid={`videos.item.${index}`}
      aria-label={`Watch: ${video.title}`}
    >
      {/* Thumbnail placeholder with play icon */}
      <div
        className="relative aspect-video bg-muted flex items-center justify-center"
        style={{ background: "#0d0d0d" }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
          style={{
            background: "rgba(184,150,12,0.15)",
            border: "1.5px solid rgba(184,150,12,0.4)",
          }}
        >
          <PlayCircle size={30} style={{ color: "#B8960C" }} />
        </div>
        {video.isFeatured && (
          <span
            className="absolute top-2 left-2 text-[10px] font-body font-semibold px-2 py-0.5 rounded"
            style={{
              background: "rgba(184,150,12,0.18)",
              color: "#B8960C",
              border: "1px solid rgba(184,150,12,0.35)",
            }}
          >
            Featured
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-base text-foreground mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">
          {video.title}
        </h3>
        {video.description && (
          <p className="font-body text-sm text-muted-foreground line-clamp-2 mb-3">
            {video.description}
          </p>
        )}
        <p className="font-body text-xs text-muted-foreground/50">
          {formatDate(video.uploadedAt)}
        </p>
      </div>
    </a>
  );
}

export function VideosPage() {
  const { actor, isFetching } = useActor(createActor);
  const { data: allVideos = [], isLoading } = useQuery<GalleryVideo[]>({
    queryKey: ["galleryVideos"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return (await actor.getGalleryVideos()) as GalleryVideo[];
      } catch {
        return [];
      }
    },
    enabled: !isFetching,
  });

  // Only show toggled-ON videos to public
  const videos = allVideos.filter((v) => v.isVisible);
  // Featured first
  const sorted = [
    ...videos.filter((v) => v.isFeatured),
    ...videos.filter((v) => !v.isFeatured),
  ];

  return (
    <Layout>
      <section
        className="section-pad bg-background min-h-[70vh]"
        data-ocid="videos.page"
      >
        <div className="max-w-6xl mx-auto">
          {/* Back link */}
          <a
            href="/"
            className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-primary transition-colors duration-200 mb-10"
            data-ocid="videos.back_link"
          >
            <ArrowLeft size={15} />
            Back to site
          </a>

          {/* Page header */}
          <div className="mb-12">
            <p className="font-body text-sm uppercase tracking-[0.2em] text-primary mb-3">
              Watch
            </p>
            <h1 className="heading-lg text-foreground mb-0">Videos</h1>
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              data-ocid="videos.loading_state"
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-video w-full rounded-xl" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-24 text-center"
              data-ocid="videos.empty_state"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-5">
                <PlayCircle className="text-muted-foreground" size={28} />
              </div>
              <h2 className="font-display font-semibold text-lg text-foreground mb-2">
                No videos yet
              </h2>
              <p className="font-body text-sm text-muted-foreground max-w-xs">
                Check back soon — videos will appear here once uploaded.
              </p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              data-ocid="videos.list"
            >
              {sorted.map((video, i) => (
                <VideoCard key={String(video.id)} video={video} index={i + 1} />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
