import { motion } from "motion/react";
import { useSignatureEdge } from "../hooks/usePageContent";

export function SignatureEdgeSection() {
  const { data: edge } = useSignatureEdge();

  const pillars = [
    edge?.pillar1 ?? "Clarity",
    edge?.pillar2 ?? "Structure",
    edge?.pillar3 ?? "Activation",
  ];
  const quote =
    edge?.quote ??
    "Not just ideas. Not just motivation. Structure, direction, and execution.";

  return (
    <section
      data-ocid="signature-edge.section"
      className="section-pad bg-card relative overflow-hidden"
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, oklch(var(--primary)/0.06) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="w-full max-w-5xl mx-auto text-center relative z-10 overflow-hidden px-2">
        {/* Pillars */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-0 mb-12 w-full overflow-hidden"
          data-ocid="signature-edge.pillars"
        >
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="flex flex-col sm:flex-row items-center min-w-0"
            >
              {/* Pillar word */}
              <span className="font-display font-bold text-5xl md:text-6xl lg:text-[4.5rem] xl:text-7xl text-gradient-accent leading-none tracking-tight px-2 py-1 whitespace-nowrap">
                {pillar}
              </span>

              {/* Divider — shown between pillars only */}
              {i < pillars.length - 1 && (
                <span
                  className="hidden sm:block w-px h-16 md:h-20 mx-4 md:mx-6 rounded-full"
                  style={{
                    background: "oklch(var(--primary)/0.5)",
                  }}
                  aria-hidden="true"
                />
              )}
              {/* Mobile divider */}
              {i < pillars.length - 1 && (
                <span
                  className="block sm:hidden w-16 h-px my-3 rounded-full"
                  style={{
                    background: "oklch(var(--primary)/0.4)",
                  }}
                  aria-hidden="true"
                />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Gold divider line */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="gold-divider w-48 mx-auto mb-10"
          aria-hidden="true"
        />

        {/* Quote */}
        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.55 }}
          data-ocid="signature-edge.quote"
          className="font-body italic text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
        >
          "{quote}"
        </motion.blockquote>
      </div>
    </section>
  );
}
