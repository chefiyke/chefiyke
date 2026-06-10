import { motion } from "motion/react";
import {
  useCompetenceCardsVisible,
  useCompetenceSectionVisible,
} from "../hooks/usePageContent";

const PRIMARY_COUNT = 8;

export function CompetenceSection() {
  const { data: isVisible = true } = useCompetenceSectionVisible();
  const { data: cards = [] } = useCompetenceCardsVisible();

  // Section is completely hidden when toggled off — no placeholder
  if (!isVisible) return null;

  const primary = cards.slice(0, PRIMARY_COUNT);
  const secondary = cards.slice(PRIMARY_COUNT);

  return (
    <section
      id="competence"
      data-ocid="competence.section"
      className="section-pad bg-card"
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
            Expertise
          </p>
          <h2 className="heading-lg text-foreground">My Competence</h2>
          <div className="mt-4 w-16 h-0.5 bg-primary rounded-full" />
        </motion.div>

        {/* Primary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
          {primary.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              data-ocid={`competence.item.${i + 1}`}
              className="group relative bg-background rounded-xl px-6 py-7 border border-border hover:border-primary/60 transition-smooth cursor-default"
              style={{
                borderTop: "2px solid #B8960C",
                boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 2px 12px rgba(0,0,0,0.5), 0 0 0 1px rgba(184,150,12,0.30)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 1px 3px rgba(0,0,0,0.4)";
              }}
            >
              <h3 className="font-display font-bold text-lg text-primary mb-2 leading-tight transition-colors">
                {card.title}
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Secondary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {secondary.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.04 }}
              data-ocid={`competence.item.${PRIMARY_COUNT + i + 1}`}
              className="group bg-card rounded-xl p-5 border border-border/60 hover:border-primary/35 hover:shadow-gold transition-smooth cursor-default"
            >
              <h3 className="font-display font-semibold text-base text-foreground/80 group-hover:text-primary mb-1.5 transition-colors">
                {card.title}
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
