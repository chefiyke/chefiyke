import { motion } from "motion/react";
import {
  storageIdToUrl,
  useAbout,
  useHeroImageIds,
} from "../hooks/usePageContent";
import { IMG_ABOUT_AGBADA_WHITE } from "../utils/imageAssets";

export function AboutSection() {
  const { data: about } = useAbout();
  const { data: heroImageIds = {} } = useHeroImageIds();

  const bio = about?.bio ?? "";
  const paragraphs = bio.split("\n\n").filter(Boolean);

  // Use backend about image if set, otherwise fall back to static asset
  const backendAboutUrl = storageIdToUrl(heroImageIds.aboutImageId);
  const aboutImageSrc = backendAboutUrl ?? IMG_ABOUT_AGBADA_WHITE;

  return (
    <section
      id="about"
      data-ocid="about.section"
      className="section-pad bg-background"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="font-body text-sm uppercase tracking-[0.2em] text-primary mb-4">
            Introduction
          </p>
          <h2 className="heading-lg text-foreground mb-0">
            {about?.title ?? "Who I Am"}
          </h2>
          <div className="mt-4 w-16 h-0.5 bg-primary rounded-full" />
        </motion.div>

        {/* 2-column layout: image left, text right */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-start">
          {/* Portrait */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="w-full md:w-auto md:flex-shrink-0"
          >
            <div
              className="relative rounded-2xl shadow-premium mx-auto"
              style={{
                maxWidth: "300px",
                width: "260px",
              }}
            >
              <img
                src={aboutImageSrc}
                alt="Chefiyke — white agbada, red traditional cap, coral beads"
                className="block rounded-2xl"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  objectFit: "contain",
                  filter: "brightness(0.97) contrast(1.01)",
                }}
                loading="lazy"
              />
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  boxShadow: "inset 0 0 0 1px rgba(184,150,12,0.20)",
                }}
                aria-hidden="true"
              />
            </div>
          </motion.div>

          {/* Bio card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative pl-6 md:pl-8 flex-1 min-w-0"
            data-ocid="about.card"
          >
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/60 to-transparent rounded-full" />

            <div className="bg-card rounded-xl p-8 md:p-10 border border-border shadow-card">
              {paragraphs.map((para, i) => (
                <p
                  // biome-ignore lint/suspicious/noArrayIndexKey: static bio paragraphs
                  key={i}
                  className={`body-lg text-foreground/90 leading-relaxed ${
                    i < paragraphs.length - 1 ? "mb-6" : ""
                  }`}
                >
                  {para}
                </p>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Accent detail */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-10 flex items-center gap-4"
        >
          <div className="w-8 h-px bg-primary/40" />
          <p className="font-body text-sm text-muted-foreground italic tracking-wide">
            Entrepreneur · Consultant · System Builder · Digital Creator ·
            Edifier
          </p>
        </motion.div>
      </div>
    </section>
  );
}
