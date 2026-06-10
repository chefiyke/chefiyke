import { Button } from "@/components/ui/button";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Save, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type { Testimonial } from "../../backend";
import { FormCard, SectionHeader, fieldClass } from "./AdminShared";

export function AdminTestimonials() {
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ["admin", "testimonials"],
    queryFn: () => actor!.getTestimonials(),
    enabled: !!actor && !isFetching,
  });

  const [local, setLocal] = useState<Testimonial[] | null>(null);
  const current = local ?? data;

  const mutation = useMutation({
    mutationFn: (t: Testimonial[]) => actor!.adminSetTestimonials(t),
    onSuccess: () => {
      toast.success("Testimonials saved");
      qc.invalidateQueries({ queryKey: ["admin", "testimonials"] });
      setLocal(null);
    },
    onError: () => toast.error("Failed to save testimonials"),
  });

  const update = (i: number, field: keyof Testimonial, val: string) =>
    setLocal(current.map((t, idx) => (idx === i ? { ...t, [field]: val } : t)));

  const add = () =>
    setLocal([...current, { author: "", role: "", text: "", isVisible: true }]);

  const remove = (i: number) => setLocal(current.filter((_, idx) => idx !== i));

  return (
    <div data-ocid="admin.testimonials.section">
      <SectionHeader
        title="Testimonials"
        subtitle="Manage client and community testimonials shown on the public site."
      />

      <FormCard title="Testimonials">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-24 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : current.length === 0 ? (
          <div
            className="py-10 flex flex-col items-center gap-3 text-center"
            data-ocid="admin.testimonials.empty_state"
          >
            <Star size={32} className="text-muted-foreground/40" />
            <p className="font-body text-sm text-muted-foreground">
              No testimonials yet. Add your first one below.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {current.map((t, i) => (
              <div
                key={`testimonial-${t.author || i}`}
                className="border border-border rounded-xl p-4 space-y-3 bg-background"
                data-ocid={`admin.testimonials.item.${i + 1}`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      className={fieldClass()}
                      placeholder="Author name"
                      value={t.author}
                      onChange={(e) => update(i, "author", e.target.value)}
                      data-ocid={`admin.testimonials.author_input.${i + 1}`}
                    />
                    <input
                      className={fieldClass()}
                      placeholder="Role / Title"
                      value={t.role}
                      onChange={(e) => update(i, "role", e.target.value)}
                      data-ocid={`admin.testimonials.role_input.${i + 1}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label={`Remove testimonial ${i + 1}`}
                    data-ocid={`admin.testimonials.delete_button.${i + 1}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <textarea
                  className={`${fieldClass()} min-h-[80px] resize-y`}
                  placeholder="Testimonial text"
                  value={t.text}
                  onChange={(e) => update(i, "text", e.target.value)}
                  data-ocid={`admin.testimonials.text_input.${i + 1}`}
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={add}
            size="sm"
            data-ocid="admin.testimonials.add_button"
          >
            <Plus size={13} className="mr-1" /> Add Testimonial
          </Button>
          <Button
            onClick={() => mutation.mutate(current)}
            disabled={mutation.isPending || local === null}
            className="gap-2 disabled:opacity-50"
            data-ocid="admin.testimonials.save_button"
          >
            <Save size={14} />
            {mutation.isPending ? "Saving…" : "Save Testimonials"}
          </Button>
        </div>
      </FormCard>
    </div>
  );
}
