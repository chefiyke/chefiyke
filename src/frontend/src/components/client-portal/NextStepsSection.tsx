import { CheckCircle2, Circle, ListChecks } from "lucide-react";
import { motion } from "motion/react";
import type { NextStep } from "../../backend.d";

interface NextStepsSectionProps {
  nextSteps: NextStep[];
}

export function NextStepsSection({ nextSteps }: NextStepsSectionProps) {
  const sorted = [...nextSteps].sort((a, b) => Number(a.order - b.order));
  const completedCount = sorted.filter((s) => s.isCompleted).length;

  return (
    <div className="space-y-4" data-ocid="client.next_steps_section">
      <div className="flex items-center gap-2 mb-2">
        <ListChecks size={16} className="text-primary" />
        <h3 className="font-display font-semibold text-foreground text-sm uppercase tracking-widest">
          Next Steps
        </h3>
        <span className="ml-auto text-xs bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-full font-body">
          {completedCount}/{sorted.length} done
        </span>
      </div>

      {sorted.length === 0 ? (
        <div
          className="bg-card border border-border rounded-2xl p-8 text-center"
          data-ocid="client.next_steps_empty_state"
        >
          <ListChecks
            size={32}
            className="text-muted-foreground/40 mx-auto mb-3"
          />
          <p className="text-muted-foreground text-sm font-body">
            Your action plan will appear here once the project is set up.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {sorted.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06, duration: 0.35 }}
              className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                index < sorted.length - 1 ? "border-b border-border" : ""
              } ${step.isCompleted ? "opacity-70" : "opacity-100"}`}
              data-ocid={`client.next_step.item.${index + 1}`}
            >
              {/* Step number + icon */}
              <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-0.5">
                <span className="text-[10px] font-mono font-bold text-muted-foreground/50 leading-none">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {step.isCompleted ? (
                  <CheckCircle2
                    size={18}
                    className="text-emerald-400 flex-shrink-0"
                  />
                ) : (
                  <Circle
                    size={18}
                    className="text-muted-foreground/40 flex-shrink-0"
                  />
                )}
              </div>

              {/* Description */}
              <p
                className={`text-sm font-body leading-relaxed flex-1 ${
                  step.isCompleted
                    ? "line-through text-muted-foreground/60"
                    : "text-foreground"
                }`}
              >
                {step.description}
              </p>

              {/* Completion pill */}
              {step.isCompleted && (
                <span className="flex-shrink-0 text-[10px] uppercase tracking-widest text-emerald-400 font-body font-semibold">
                  Done
                </span>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {sorted.length > 0 && (
        <p className="text-xs text-muted-foreground font-body text-center pt-1">
          Step completion is managed by Chefiyke as your project progresses.
        </p>
      )}
    </div>
  );
}
