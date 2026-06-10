import { Bell } from "lucide-react";
import { motion } from "motion/react";
import type { ProjectUpdate } from "../../backend.d";

interface ProjectUpdatesProps {
  updates: ProjectUpdate[];
}

function formatDate(ts: bigint): string {
  const date = new Date(Number(ts) / 1_000_000);
  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProjectUpdates({ updates }: ProjectUpdatesProps) {
  const published = [...updates]
    .filter((u) => u.isPublished)
    .sort((a, b) => Number(b.createdAt - a.createdAt));

  return (
    <div className="space-y-4" data-ocid="client.updates_section">
      <div className="flex items-center gap-2 mb-2">
        <Bell size={16} className="text-primary" />
        <h3 className="font-display font-semibold text-foreground text-sm uppercase tracking-widest">
          Project Updates
        </h3>
        {published.length > 0 && (
          <span className="ml-auto text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-body font-semibold">
            {published.length}
          </span>
        )}
      </div>

      {published.length === 0 ? (
        <div
          className="bg-card border border-border rounded-2xl p-8 text-center"
          data-ocid="client.updates_empty_state"
        >
          <Bell size={32} className="text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm font-body">
            No updates yet. Chefiyke will post progress notes here as your
            project moves forward.
          </p>
        </div>
      ) : (
        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="absolute left-4 top-5 bottom-5 w-px bg-border hidden sm:block" />

          {published.map((update, index) => (
            <motion.div
              key={update.id}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07, duration: 0.4 }}
              className="sm:pl-10 relative"
              data-ocid={`client.update.item.${index + 1}`}
            >
              {/* Timeline dot */}
              <div className="hidden sm:flex absolute left-0 top-4 w-8 h-8 rounded-full bg-card border-2 border-primary/40 items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>

              <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-display font-semibold text-foreground text-sm leading-snug">
                    {update.title}
                  </h4>
                  {index === 0 && (
                    <span className="flex-shrink-0 text-[10px] uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full font-body font-semibold">
                      Latest
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm font-body leading-relaxed mb-3">
                  {update.content}
                </p>
                <p className="text-[11px] text-muted-foreground/60 font-body">
                  {formatDate(update.createdAt)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
