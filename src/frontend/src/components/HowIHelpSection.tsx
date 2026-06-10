import { motion } from "motion/react";
import { useState } from "react";
import { FormSource } from "../backend";
import { useHelpBlocks } from "../hooks/usePageContent";
import { BuyerInterestModal } from "./BuyerInterestModal";

function IconChart() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="w-6 h-6"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
      />
    </svg>
  );
}

function IconBakery() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="w-6 h-6"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M6.75 17.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75z"
      />
    </svg>
  );
}

function IconSME() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="w-6 h-6"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3"
      />
    </svg>
  );
}

function IconAI() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="w-6 h-6"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082"
      />
    </svg>
  );
}

function IconSystems() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="w-6 h-6"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3"
      />
    </svg>
  );
}

function IconPerson() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="w-6 h-6"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}

const BLOCK_ICONS = [
  IconChart,
  IconBakery,
  IconSME,
  IconAI,
  IconSystems,
  IconPerson,
];

export function HowIHelpSection() {
  const { data: blocks = [] } = useHelpBlocks();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section
        id="how-i-help"
        data-ocid="how-i-help.section"
        className="section-pad bg-background"
      >
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-14"
          >
            <p className="font-body text-sm uppercase tracking-[0.2em] text-primary mb-4">
              Services
            </p>
            <h2 className="heading-lg text-foreground">How I Help</h2>
            <div className="mt-4 w-16 h-0.5 bg-primary rounded-full" />
          </motion.div>

          {/* Blocks grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blocks.map((block, i) => {
              const Icon = BLOCK_ICONS[i] ?? BLOCK_ICONS[0];
              return (
                <motion.div
                  key={block.title}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: i * 0.1 }}
                  data-ocid={`how-i-help.item.${i + 1}`}
                  className="group flex gap-5 bg-card rounded-xl p-6 border border-border hover:border-primary/40 hover:shadow-gold transition-smooth"
                >
                  <div className="flex-shrink-0 flex items-start pt-0.5">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-smooth">
                      <Icon />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="heading-md text-foreground group-hover:text-primary transition-colors mb-2">
                      {block.title}
                    </h3>
                    <p className="body-base text-muted-foreground leading-relaxed">
                      {block.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── Mid-page CTA ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.15 }}
            data-ocid="how-i-help.cta_section"
            className="mt-16 rounded-2xl px-8 py-10 text-center flex flex-col items-center gap-5"
            style={{
              background:
                "linear-gradient(145deg, rgba(184,150,12,0.07) 0%, rgba(255,255,255,0.02) 100%)",
              border: "1px solid rgba(184,150,12,0.18)",
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(184,150,12,0.12)",
                border: "1px solid rgba(184,150,12,0.30)",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#B8960C"
                strokeWidth={1.5}
                className="w-5 h-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                />
              </svg>
            </div>

            <div className="max-w-md">
              <h3 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-3">
                Want This Built For You?
              </h3>
              <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed">
                I build premium, conversion-focused landing pages tailored to
                your brand and business goals — the same system powering this
                site.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              data-ocid="how-i-help.build_for_me_button"
              className="relative px-8 py-3.5 rounded-xl font-display font-semibold text-sm md:text-base transition-smooth focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
              style={{
                background:
                  "linear-gradient(135deg, #C9A227 0%, #B8960C 60%, #A07B09 100%)",
                color: "#0a0a0a",
                boxShadow:
                  "0 0 20px rgba(184,150,12,0.28), 0 4px 14px rgba(0,0,0,0.35)",
                border: "1px solid rgba(212,160,23,0.4)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "scale(1.03)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 28px rgba(184,150,12,0.42), 0 6px 18px rgba(0,0,0,0.40)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "scale(1)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 20px rgba(184,150,12,0.28), 0 4px 14px rgba(0,0,0,0.35)";
              }}
            >
              Build This For Me
            </button>

            <p className="font-body text-xs text-muted-foreground">
              Mobile-first. Fully editable. Delivered fast.
            </p>
          </motion.div>
        </div>
      </section>

      <BuyerInterestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        formSource={FormSource.MidPage}
      />
    </>
  );
}
