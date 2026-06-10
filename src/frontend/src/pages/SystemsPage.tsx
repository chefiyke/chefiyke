import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import { createActor } from "../backend";
import type { SystemApp } from "../backend.d";
import { Layout } from "../components/Layout";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function AppCardSkeleton({ index }: { index: number }) {
  return (
    <div
      className="rounded-2xl border border-border/30 p-6 animate-pulse"
      style={{
        background: "oklch(0.11 0 0)",
        animationDelay: `${index * 80}ms`,
      }}
    >
      <div className="h-5 w-2/3 rounded-md bg-muted mb-3" />
      <div className="h-3.5 w-full rounded-md bg-muted mb-2" />
      <div className="h-3.5 w-4/5 rounded-md bg-muted mb-6" />
      <div className="h-9 w-36 rounded-lg bg-muted" />
    </div>
  );
}

// ─── App Card ─────────────────────────────────────────────────────────────────

function AppCard({ app, index }: { app: SystemApp; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.48, delay: index * 0.07 }}
      className="relative flex flex-col rounded-2xl border group"
      style={{
        background: "oklch(0.11 0 0)",
        borderColor: "rgba(255,255,255,0.07)",
        overflow: "visible",
      }}
      data-ocid={`systems.app.item.${index + 1}`}
    >
      {/* Gold accent bar on hover */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "rgba(184,150,12,0.7)" }}
        aria-hidden="true"
      />

      <div
        className="p-6 flex flex-col gap-4 flex-1"
        style={{ overflow: "visible" }}
      >
        {/* Index badge */}
        <span
          className="self-start inline-flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-display font-bold"
          style={{
            background: "rgba(184,150,12,0.13)",
            color: "#B8960C",
            border: "1px solid rgba(184,150,12,0.3)",
          }}
        >
          {index + 1}
        </span>

        {/* App name */}
        <h3 className="font-display font-bold text-lg text-foreground leading-snug tracking-tight">
          {app.name}
        </h3>

        {/* Description */}
        <p className="font-body text-sm text-foreground/75 leading-relaxed flex-1">
          {app.description}
        </p>

        {/* CTA — always renders, never hidden */}
        <div
          className="pt-3 border-t mt-auto"
          style={{
            borderColor: "rgba(255,255,255,0.07)",
            display: "block",
            position: "relative",
            zIndex: 10,
          }}
        >
          {app.url ? (
            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{
                background: "#B8960C",
                color: "#0a0a0a",
                boxShadow: "0 2px 14px rgba(184,150,12,0.22)",
                display: "inline-flex",
                position: "relative",
                zIndex: 10,
              }}
              data-ocid={`systems.app.cta.${index + 1}`}
            >
              <ExternalLink size={14} />
              View Live App
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold cursor-not-allowed"
              style={{
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.25)",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "inline-flex",
                position: "relative",
                zIndex: 10,
              }}
              data-ocid={`systems.app.cta.${index + 1}`}
              aria-label="Link unavailable"
            >
              <ExternalLink size={14} />
              Link unavailable
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SystemsPage() {
  const { actor, isFetching } = useActor(createActor);

  const { data: apps, isLoading } = useQuery<SystemApp[]>({
    queryKey: ["systemsApps"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getSystemsApps();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
  });

  const showLoading = isLoading || isFetching;
  const visibleApps = apps ?? [];

  return (
    <Layout>
      <div
        className="min-h-screen"
        style={{ background: "oklch(0.07 0 0)" }}
        data-ocid="systems.page"
      >
        {/* Hero header */}
        <section
          className="relative overflow-hidden py-20 md:py-28"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.10 0 0) 0%, oklch(0.07 0 0) 100%)",
            borderBottom: "1px solid rgba(184,150,12,0.12)",
          }}
          data-ocid="systems.header.section"
        >
          {/* Decorative grain */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            }}
            aria-hidden="true"
          />

          <div className="relative container mx-auto max-w-3xl px-4 text-center">
            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xs font-body font-semibold uppercase tracking-[0.22em] mb-5"
              style={{ color: "rgba(184,150,12,0.8)" }}
            >
              Systems Portfolio
            </motion.p>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.1] tracking-tight mb-5"
            >
              Systems I've{" "}
              <span
                style={{
                  color: "#B8960C",
                  textShadow: "0 0 40px rgba(184,150,12,0.25)",
                }}
              >
                Built
              </span>
            </motion.h1>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-20 h-0.5 mx-auto mb-6 rounded-full"
              style={{ background: "rgba(184,150,12,0.55)" }}
            />

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.25 }}
              className="font-body text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto"
            >
              Real apps.&nbsp; Real systems.&nbsp; Real results.
            </motion.p>
          </div>
        </section>

        {/* Apps grid */}
        <section
          className="container mx-auto max-w-5xl px-4 py-16 md:py-20"
          data-ocid="systems.apps.section"
        >
          {showLoading ? (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              data-ocid="systems.apps.loading_state"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton indices are stable
                <AppCardSkeleton key={i} index={i} />
              ))}
            </div>
          ) : visibleApps.length === 0 ? (
            <div
              className="flex flex-col items-center gap-4 py-20 text-center"
              data-ocid="systems.apps.empty_state"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: "rgba(184,150,12,0.08)",
                  border: "1px solid rgba(184,150,12,0.2)",
                }}
              >
                <span style={{ color: "#B8960C", fontSize: "1.5rem" }}>⬡</span>
              </div>
              <h2 className="font-display font-bold text-xl text-foreground">
                No systems available yet
              </h2>
              <p className="font-body text-sm text-muted-foreground max-w-sm leading-relaxed">
                Check back soon — more systems will be published here as they
                launch.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleApps.map((app, i) => (
                <AppCard key={app.id} app={app} index={i} />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
