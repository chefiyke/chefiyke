import { motion } from "motion/react";
import { storageIdToUrl, useHeroImageIds } from "../hooks/usePageContent";
import { IMG_PRESENCE_AGBADA_NAVY } from "../utils/imageAssets";

export function PresenceSection() {
  const { data: heroImageIds = {} } = useHeroImageIds();

  // Use backend presence image if set, fall back to static asset
  const backendPresenceUrl = storageIdToUrl(heroImageIds.presenceImageId);
  const presenceImageSrc = backendPresenceUrl ?? IMG_PRESENCE_AGBADA_NAVY;

  return (
    <section
      id="presence"
      data-ocid="presence.section"
      className="section-pad"
      style={{ background: "#0d0d0d" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center">
          {/* Text — left column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex-1 min-w-0"
          >
            <p
              className="font-body text-sm uppercase tracking-[0.22em] mb-5 font-medium"
              style={{ color: "#B8960C" }}
            >
              Presence
            </p>

            <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl leading-tight tracking-tight text-white mb-6">
              A Presence Built{" "}
              <span style={{ color: "#B8960C" }}>on Purpose</span>
            </h2>

            <div
              className="w-14 h-0.5 mb-8 rounded-full"
              style={{
                background:
                  "linear-gradient(to right, #B8960C, rgba(184,150,12,0.2))",
              }}
            />

            <p className="font-body text-base md:text-lg leading-relaxed text-white/70 mb-8 max-w-xl">
              Every room has a center of gravity. Build yours with intention,
              clarity, and the authority that comes from knowing who you are and
              what you stand for.
            </p>

            <div className="flex items-center gap-4">
              <div
                className="w-8 h-px rounded-full"
                style={{ background: "rgba(184,150,12,0.40)" }}
              />
              <p
                className="font-body text-sm italic tracking-wide"
                style={{ color: "rgba(184,150,12,0.65)" }}
              >
                Identity · Heritage · Authority
              </p>
            </div>
          </motion.div>

          {/* Image — right column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, delay: 0.15 }}
            className="w-full md:w-auto md:flex-shrink-0"
            data-ocid="presence.card"
          >
            <div
              className="relative rounded-2xl mx-auto"
              style={{
                maxWidth: "260px",
                width: "260px",
                border: "1px solid rgba(184,150,12,0.22)",
                boxShadow:
                  "0 0 24px rgba(184,150,12,0.10), 0 4px 20px rgba(0,0,0,0.5)",
                borderRadius: "1rem",
                overflow: "visible",
                background: "#111",
              }}
            >
              <img
                src={presenceImageSrc}
                alt="Chefiyke — navy blue agbada, red cap, controlled authority"
                className="block rounded-2xl"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  objectFit: "contain",
                  objectPosition: "center bottom",
                  filter: "brightness(0.96) contrast(1.01)",
                }}
                loading="lazy"
              />
              <div
                className="px-5 py-4"
                style={{
                  background: "rgba(0,0,0,0.82)",
                  borderTop: "1px solid rgba(184,150,12,0.18)",
                  borderRadius: "0 0 1rem 1rem",
                }}
              >
                <p className="font-display font-bold text-white text-sm leading-tight">
                  Chefiyke
                </p>
                <p
                  className="font-body text-[10px] uppercase tracking-widest mt-0.5"
                  style={{ color: "#B8960C" }}
                >
                  The King of Wealth
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
