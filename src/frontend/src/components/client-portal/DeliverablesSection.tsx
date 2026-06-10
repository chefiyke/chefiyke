import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Lock, Package } from "lucide-react";
import { motion } from "motion/react";
import type { Deliverable } from "../../backend.d";

interface DeliverablesSectionProps {
  deliverables: Deliverable[];
}

const FILE_TYPE_ICONS: Record<string, string> = {
  pdf: "📄",
  doc: "📝",
  docx: "📝",
  xls: "📊",
  xlsx: "📊",
  zip: "📦",
  png: "🖼️",
  jpg: "🖼️",
  mp4: "🎬",
  link: "🔗",
};

function getFileIcon(fileType?: string): string {
  if (!fileType) return "📁";
  return FILE_TYPE_ICONS[fileType.toLowerCase()] ?? "📁";
}

export function DeliverablesSection({
  deliverables,
}: DeliverablesSectionProps) {
  return (
    <div className="space-y-4" data-ocid="client.deliverables_section">
      <div className="flex items-center gap-2 mb-2">
        <Package size={16} className="text-primary" />
        <h3 className="font-display font-semibold text-foreground text-sm uppercase tracking-widest">
          Deliverables
        </h3>
        <span className="ml-auto text-xs bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-full font-body">
          {deliverables.filter((d) => d.isAvailable).length} /{" "}
          {deliverables.length} ready
        </span>
      </div>

      {deliverables.length === 0 ? (
        <div
          className="bg-card border border-border rounded-2xl p-8 text-center"
          data-ocid="client.deliverables_empty_state"
        >
          <Package
            size={32}
            className="text-muted-foreground/40 mx-auto mb-3"
          />
          <p className="text-muted-foreground text-sm font-body">
            Deliverables will appear here as they are completed and made
            available.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {deliverables.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              className={`relative bg-card border rounded-2xl p-5 flex flex-col gap-3 transition-colors ${
                item.isAvailable
                  ? "border-primary/30 hover:border-primary/60"
                  : "border-border opacity-75"
              }`}
              data-ocid={`client.deliverable.item.${index + 1}`}
            >
              {/* File type icon + availability badge */}
              <div className="flex items-start justify-between">
                <span className="text-2xl leading-none" aria-hidden="true">
                  {getFileIcon(item.fileType)}
                </span>
                {item.isAvailable ? (
                  <span className="text-[10px] uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-body font-semibold">
                    Ready
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full font-body">
                    <Lock size={9} />
                    Coming Soon
                  </span>
                )}
              </div>

              <div className="flex-1">
                <h4 className="font-display font-semibold text-foreground text-sm mb-1 leading-snug">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-muted-foreground text-xs font-body leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              {item.isAvailable && item.url && (
                <Button
                  asChild
                  size="sm"
                  className="w-full bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/50 font-semibold text-xs gap-1.5"
                  data-ocid={`client.deliverable.download_button.${index + 1}`}
                >
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.fileType === "link" ? (
                      <>
                        <ExternalLink size={12} /> Open Link
                      </>
                    ) : (
                      <>
                        <Download size={12} /> Download
                      </>
                    )}
                  </a>
                </Button>
              )}

              {/* Locked overlay shimmer */}
              {!item.isAvailable && (
                <div className="absolute inset-0 rounded-2xl bg-background/20 pointer-events-none" />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
