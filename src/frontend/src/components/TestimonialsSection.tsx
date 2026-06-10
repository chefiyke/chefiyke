import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { useTestimonials } from "../hooks/usePageContent";

function QuoteIcon() {
  return (
    <svg
      aria-hidden="true"
      width="28"
      height="22"
      viewBox="0 0 28 22"
      fill="none"
      className="opacity-60"
    >
      <path
        d="M0 22V13.2C0 9.73 1.03 6.8 3.1 4.4C5.2 2 8.07 0.533 11.7 0L13 2.6C10.13 3.27 7.97 4.47 6.5 6.2C5.07 7.9 4.37 9.9 4.4 12.2H8.8V22H0ZM15.2 22V13.2C15.2 9.73 16.23 6.8 18.3 4.4C20.4 2 23.27 0.533 26.9 0L28.2 2.6C25.33 3.27 23.17 4.47 21.7 6.2C20.27 7.9 19.57 9.9 19.6 12.2H24V22H15.2Z"
        fill="currentColor"
        className="text-primary"
      />
    </svg>
  );
}

export function TestimonialsSection() {
  const { data: testimonials, isLoading } = useTestimonials();

  return (
    <section
      id="testimonials"
      className="section-pad bg-muted/30"
      data-ocid="testimonials.section"
    >
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-body uppercase tracking-[0.2em] text-primary mb-3 opacity-80">
            Social Proof
          </p>
          <h2 className="heading-lg text-foreground">What People Are Saying</h2>
          <div className="gold-divider w-24 mx-auto mt-5" />
        </motion.div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card rounded-xl p-7 border-t-2 border-primary/30"
              >
                <Skeleton className="h-4 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-6" />
                <Skeleton className="h-3 w-1/3 mb-1" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            data-ocid="testimonials.list"
          >
            {(testimonials ?? []).map((t, i) => (
              <motion.div
                key={`${t.author}-${i}`}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                data-ocid={`testimonials.item.${i + 1}`}
                className="group relative bg-card rounded-xl p-7 flex flex-col gap-5 border-t-2 border-primary/40 shadow-card transition-all duration-200 hover:-translate-y-0.5"
              >
                {/* Gold top accent bar */}
                <div className="absolute top-0 left-6 right-6 h-[2px] rounded-full bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

                <QuoteIcon />

                <blockquote className="flex-1">
                  <p className="font-body text-base italic text-foreground/90 leading-relaxed">
                    "{t.text}"
                  </p>
                </blockquote>

                <div className="flex flex-col gap-0.5">
                  <span className="font-display font-bold text-sm text-foreground">
                    {t.author}
                  </span>
                  <span className="font-body text-xs text-primary/80 uppercase tracking-wider">
                    {t.role}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
