import { Button } from "@/components/ui/button";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import { SectionHeader, fieldClass } from "./AdminShared";

type LegalTab = "terms" | "privacy" | "disclaimer" | "refund";

const LEGAL_TABS: { id: LegalTab; label: string; defaultTitle: string }[] = [
  {
    id: "terms",
    label: "Terms & Conditions",
    defaultTitle: "Terms & Conditions",
  },
  { id: "privacy", label: "Privacy Policy", defaultTitle: "Privacy Policy" },
  { id: "disclaimer", label: "Disclaimer", defaultTitle: "Disclaimer" },
  { id: "refund", label: "Refund Policy", defaultTitle: "Refund Policy" },
];

// Safe call wrapper for optional backend methods (added after bindgen)
async function safeFetchLegal(
  actor: Record<string, unknown>,
  id: string,
): Promise<{ title: string; content: string } | null> {
  const fn = actor.getLegalContent;
  if (typeof fn !== "function") return null;
  try {
    const result = await (fn as (id: string) => Promise<unknown>).call(
      actor,
      id,
    );
    if (
      result &&
      typeof result === "object" &&
      "__kind__" in (result as object) &&
      (result as { __kind__: string }).__kind__ === "Some" &&
      "value" in (result as object)
    ) {
      return (
        result as {
          __kind__: "Some";
          value: { title: string; content: string };
        }
      ).value;
    }
  } catch {
    // method not yet available
  }
  return null;
}

async function safeSaveLegal(
  actor: Record<string, unknown>,
  id: string,
  title: string,
  content: string,
): Promise<void> {
  const fn = actor.adminSetLegalContent;
  if (typeof fn !== "function")
    throw new Error(
      "Backend method not available yet. Redeploy with legal content support.",
    );
  const result = await (
    fn as (id: string, title: string, content: string) => Promise<unknown>
  ).call(actor, id, title, content);
  if (
    result &&
    typeof result === "object" &&
    "__kind__" in (result as object) &&
    (result as { __kind__: string }).__kind__ === "err"
  ) {
    throw new Error((result as { __kind__: "err"; err: string }).err);
  }
}

function LegalEditor({
  pageId,
  defaultTitle,
}: { pageId: LegalTab; defaultTitle: string }) {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();

  const [titleValue, setTitleValue] = useState("");
  const [contentValue, setContentValue] = useState("");
  const [loaded, setLoaded] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "legal", pageId],
    queryFn: async () => {
      if (!actor) return null;
      return safeFetchLegal(
        actor as unknown as Record<string, unknown>,
        pageId,
      );
    },
    enabled: !!actor && !isFetching,
  });

  useEffect(() => {
    if (!loaded && !isLoading) {
      setTitleValue(data?.title ?? defaultTitle);
      setContentValue(data?.content ?? "");
      setLoaded(true);
    }
  }, [data, isLoading, loaded, defaultTitle]);

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      await safeSaveLegal(
        actor as unknown as Record<string, unknown>,
        pageId,
        titleValue.trim() || defaultTitle,
        contentValue.trim(),
      );
    },
    onSuccess: () => {
      toast.success("Legal page saved successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "legal", pageId] });
      queryClient.invalidateQueries({ queryKey: ["legal", pageId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save legal page");
    },
  });

  if (isLoading) {
    return (
      <div
        className="space-y-3 animate-pulse"
        data-ocid={`admin.legal.${pageId}.loading_state`}
      >
        <div className="h-10 bg-muted rounded-lg" />
        <div className="h-48 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-ocid={`admin.legal.${pageId}.panel`}>
      <div>
        <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
          Page Title
        </span>
        <input
          className={fieldClass()}
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
          placeholder={defaultTitle}
          data-ocid={`admin.legal.${pageId}.title_input`}
        />
      </div>

      <div>
        <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
          Content
        </span>
        <textarea
          className={`${fieldClass()} resize-y`}
          rows={18}
          value={contentValue}
          onChange={(e) => setContentValue(e.target.value)}
          placeholder="Enter the full legal content here. Use numbered headings (e.g. '1. SECTION TITLE') to create section headers automatically."
          data-ocid={`admin.legal.${pageId}.content_textarea`}
        />
        <p className="text-[11px] text-muted-foreground mt-1">
          Lines starting with a number and period (e.g. &quot;1. SECTION&quot;)
          will be styled as gold headings on the public page.
        </p>
      </div>

      <Button
        onClick={() => saveMut.mutate()}
        disabled={saveMut.isPending}
        className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        data-ocid={`admin.legal.${pageId}.save_button`}
      >
        {saveMut.isPending ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Saving…
          </>
        ) : (
          <>
            <Save size={14} /> Save Legal Page
          </>
        )}
      </Button>
    </div>
  );
}

export function AdminLegalPages() {
  const [activeTab, setActiveTab] = useState<LegalTab>("terms");
  const active = LEGAL_TABS.find((t) => t.id === activeTab)!;

  return (
    <div data-ocid="admin.legal.panel">
      <SectionHeader
        title="Legal Pages"
        subtitle="Edit the content for Terms, Privacy Policy, Disclaimer, and Refund Policy pages."
      />

      {/* Tab bar */}
      <div
        className="flex flex-wrap gap-2 mb-6 border-b border-border pb-3"
        role="tablist"
        aria-label="Legal page tabs"
      >
        {LEGAL_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            data-ocid={`admin.legal.tab.${tab.id}`}
            className={`px-4 py-2 rounded-lg text-xs font-body font-semibold border transition-colors ${
              activeTab === tab.id
                ? "bg-primary/20 border-primary text-primary"
                : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <LegalEditor
        key={activeTab}
        pageId={activeTab}
        defaultTitle={active.defaultTitle}
      />
    </div>
  );
}
