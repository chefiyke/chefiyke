import { motion } from "motion/react";

const AREAS = [
  "Business Building",
  "Bakery & Food Systems",
  "SME Development",
  "AI Tools",
  "Web Apps",
  "Coaching",
  "Creative Direction",
  "Digital Strategy",
];

export function AreasSection() {
  return (
    <section data-ocid="areas.section" className="section-pad bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <p className="font-body text-sm uppercase tracking-[0.2em] text-primary mb-4">
            Fields of Work
          </p>
          <h2 className="heading-lg text-foreground">Areas I Work In</h2>
          <div className="mt-4 w-16 h-0.5 bg-primary rounded-full mx-auto" />
        </motion.div>

        {/* Area chips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="flex flex-wrap justify-center gap-3"
          data-ocid="areas.list"
        >
          {AREAS.map((area, i) => (
            <motion.span
              key={area}
              initial={{ opacity: 0, scale: 0.88 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
              data-ocid={`areas.item.${i + 1}`}
              className="inline-flex items-center px-5 py-2.5 rounded-full font-body font-medium text-sm text-foreground/80 border border-primary/30 bg-card hover:border-primary/60 hover:text-primary hover:shadow-gold transition-smooth cursor-default"
            >
              {area}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
