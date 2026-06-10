import { Button } from "@/components/ui/button";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Calendar, Plus, Radio, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type { LiveSession, TrainingModule } from "../../backend";
import { SectionHeader, fieldClass } from "./AdminShared";

type Tab = "modules" | "sessions";

function TrainingModulesPanel() {
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  const enabled = !!actor && !isFetching;

  const { data: modules = [], isLoading } = useQuery<TrainingModule[]>({
    queryKey: ["admin", "training-modules"],
    queryFn: () => actor!.adminGetTrainingModules(),
    enabled,
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    textContent: "",
    order: "1",
    videoStorageId: "",
  });

  const { mutate: create, isPending } = useMutation({
    mutationFn: async () => {
      if (!actor) return;
      await actor.adminCreateTrainingModule(
        form.title,
        form.description,
        form.videoStorageId.trim() || null,
        form.textContent,
        BigInt(Number(form.order)),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "training-modules"] });
      setForm({
        title: "",
        description: "",
        textContent: "",
        order: "1",
        videoStorageId: "",
      });
      toast.success("Module created");
    },
    onError: () => toast.error("Failed to create module"),
  });

  const { mutate: deleteModule } = useMutation({
    mutationFn: (id: bigint) => actor!.adminDeleteTrainingModule(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "training-modules"] });
      toast.success("Module deleted");
    },
    onError: () => toast.error("Failed to delete"),
  });

  const sorted = [...modules].sort((a, b) =>
    a.order < b.order ? -1 : a.order > b.order ? 1 : 0,
  );

  return (
    <div>
      <div className="bg-card border border-border rounded-xl p-5 mb-5">
        <h3 className="font-display font-semibold text-sm text-foreground mb-3 pb-3 border-b border-border">
          Add Training Module
        </h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                htmlFor="mod-title"
                className="font-body text-xs text-muted-foreground block mb-1"
              >
                Title
              </label>
              <input
                id="mod-title"
                type="text"
                className={fieldClass()}
                placeholder="Module title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                data-ocid="admin.training.title_input"
              />
            </div>
            <div>
              <label
                htmlFor="mod-order"
                className="font-body text-xs text-muted-foreground block mb-1"
              >
                Order
              </label>
              <input
                id="mod-order"
                type="number"
                min="1"
                className={fieldClass()}
                value={form.order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, order: e.target.value }))
                }
                data-ocid="admin.training.order_input"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="mod-desc"
              className="font-body text-xs text-muted-foreground block mb-1"
            >
              Description
            </label>
            <textarea
              id="mod-desc"
              rows={2}
              className={fieldClass()}
              placeholder="Short description"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              data-ocid="admin.training.desc_input"
            />
          </div>
          <div>
            <label
              htmlFor="mod-text"
              className="font-body text-xs text-muted-foreground block mb-1"
            >
              Text Content
            </label>
            <textarea
              id="mod-text"
              rows={4}
              className={fieldClass()}
              placeholder="Lesson content…"
              value={form.textContent}
              onChange={(e) =>
                setForm((f) => ({ ...f, textContent: e.target.value }))
              }
              data-ocid="admin.training.text_input"
            />
          </div>
          <div>
            <p className="font-body text-xs text-muted-foreground block mb-1">
              Video Storage ID (optional)
            </p>
            <input
              type="text"
              className={fieldClass()}
              placeholder="Paste object-storage video ID"
              value={form.videoStorageId}
              onChange={(e) =>
                setForm((f) => ({ ...f, videoStorageId: e.target.value }))
              }
              data-ocid="admin.training.video_input"
            />
          </div>
          <Button
            type="button"
            disabled={isPending || !form.title || !form.description}
            onClick={() => create()}
            className="w-full gap-2"
            data-ocid="admin.training.create_button"
          >
            <Plus size={15} /> {isPending ? "Creating…" : "Create Module"}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <p className="font-body text-sm text-muted-foreground">Loading…</p>
        ) : sorted.length === 0 ? (
          <div
            className="bg-card border border-border rounded-xl p-8 text-center"
            data-ocid="admin.training.modules_empty_state"
          >
            <BookOpen
              size={28}
              className="mx-auto text-muted-foreground mb-2"
            />
            <p className="font-body text-sm text-muted-foreground">
              No training modules yet.
            </p>
          </div>
        ) : (
          sorted.map((mod, i) => (
            <div
              key={String(mod.id)}
              className="bg-card border border-border rounded-xl p-4 flex items-start justify-between gap-3"
              data-ocid={`admin.training.module.${i + 1}`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-primary">
                    #{String(mod.order)}
                  </span>
                  <p className="font-display font-semibold text-sm text-foreground truncate">
                    {mod.title}
                  </p>
                </div>
                <p className="font-body text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {mod.description}
                </p>
                {mod.videoStorageId && (
                  <p className="font-body text-xs text-primary mt-1">
                    Video attached
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => deleteModule(mod.id)}
                aria-label="Delete module"
                className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                data-ocid={`admin.training.delete_module.${i + 1}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function LiveSessionsPanel() {
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  const enabled = !!actor && !isFetching;

  const { data: sessions = [], isLoading } = useQuery<LiveSession[]>({
    queryKey: ["admin", "live-sessions"],
    queryFn: () => actor!.getLiveSessions(),
    enabled,
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    datetime: "",
    joinLink: "",
  });

  const { mutate: create, isPending } = useMutation({
    mutationFn: async () => {
      if (!actor) return;
      const ts = BigInt(new Date(form.datetime).getTime()) * 1_000_000n;
      await actor.adminCreateLiveSession(
        form.title,
        form.description,
        ts,
        form.joinLink,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "live-sessions"] });
      setForm({ title: "", description: "", datetime: "", joinLink: "" });
      toast.success("Session created");
    },
    onError: () => toast.error("Failed to create session"),
  });

  const { mutate: deleteSession } = useMutation({
    mutationFn: (id: bigint) => actor!.adminDeleteLiveSession(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "live-sessions"] });
      toast.success("Session deleted");
    },
    onError: () => toast.error("Failed to delete"),
  });

  const sorted = [...sessions].sort((a, b) => (a.date < b.date ? -1 : 1));

  return (
    <div>
      <div className="bg-card border border-border rounded-xl p-5 mb-5">
        <h3 className="font-display font-semibold text-sm text-foreground mb-3 pb-3 border-b border-border">
          Schedule Live Session
        </h3>
        <div className="space-y-3">
          <div>
            <label
              htmlFor="sess-title"
              className="font-body text-xs text-muted-foreground block mb-1"
            >
              Title
            </label>
            <input
              id="sess-title"
              type="text"
              className={fieldClass()}
              placeholder="Session title"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              data-ocid="admin.training.session_title_input"
            />
          </div>
          <div>
            <label
              htmlFor="sess-desc"
              className="font-body text-xs text-muted-foreground block mb-1"
            >
              Description
            </label>
            <textarea
              id="sess-desc"
              rows={2}
              className={fieldClass()}
              placeholder="What will be covered?"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              data-ocid="admin.training.session_desc_input"
            />
          </div>
          <div>
            <label
              htmlFor="sess-datetime"
              className="font-body text-xs text-muted-foreground block mb-1"
            >
              Date & Time
            </label>
            <input
              id="sess-datetime"
              type="datetime-local"
              className={fieldClass()}
              value={form.datetime}
              onChange={(e) =>
                setForm((f) => ({ ...f, datetime: e.target.value }))
              }
              data-ocid="admin.training.session_date_input"
            />
          </div>
          <div>
            <label
              htmlFor="sess-link"
              className="font-body text-xs text-muted-foreground block mb-1"
            >
              Join Link (Zoom, Meet, etc.)
            </label>
            <input
              id="sess-link"
              type="url"
              className={fieldClass()}
              placeholder="https://…"
              value={form.joinLink}
              onChange={(e) =>
                setForm((f) => ({ ...f, joinLink: e.target.value }))
              }
              data-ocid="admin.training.session_link_input"
            />
          </div>
          <Button
            type="button"
            disabled={
              isPending || !form.title || !form.datetime || !form.joinLink
            }
            onClick={() => create()}
            className="w-full gap-2"
            data-ocid="admin.training.create_session_button"
          >
            <Plus size={15} /> {isPending ? "Creating…" : "Create Session"}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <p className="font-body text-sm text-muted-foreground">Loading…</p>
        ) : sorted.length === 0 ? (
          <div
            className="bg-card border border-border rounded-xl p-8 text-center"
            data-ocid="admin.training.sessions_empty_state"
          >
            <Radio size={28} className="mx-auto text-muted-foreground mb-2" />
            <p className="font-body text-sm text-muted-foreground">
              No live sessions scheduled yet.
            </p>
          </div>
        ) : (
          sorted.map((s, i) => (
            <div
              key={String(s.id)}
              className="bg-card border border-border rounded-xl p-4 flex items-start justify-between gap-3"
              data-ocid={`admin.training.session.${i + 1}`}
            >
              <div className="min-w-0">
                <p className="font-display font-semibold text-sm text-foreground truncate">
                  {s.title}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-xs font-body text-muted-foreground">
                  <Calendar size={12} />
                  <span>
                    {new Date(Number(s.date / 1_000_000n)).toLocaleString()}
                  </span>
                </div>
                <a
                  href={s.joinLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-xs text-primary hover:underline mt-0.5 block truncate"
                >
                  {s.joinLink}
                </a>
              </div>
              <button
                type="button"
                onClick={() => deleteSession(s.id)}
                aria-label="Delete session"
                className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                data-ocid={`admin.training.delete_session.${i + 1}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function AdminTraining() {
  const [activeTab, setActiveTab] = useState<Tab>("modules");

  return (
    <div data-ocid="admin.training.section">
      <SectionHeader
        title="Training & Live Sessions"
        subtitle="Manage training content for affiliates"
      />

      <div className="flex gap-2 mb-5">
        {(
          [
            ["modules", "Training Modules", BookOpen],
            ["sessions", "Live Sessions", Radio],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-body text-sm font-medium border transition-colors ${activeTab === id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:text-foreground"}`}
            data-ocid={`admin.training.tab.${id}`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "modules" ? (
        <TrainingModulesPanel />
      ) : (
        <LiveSessionsPanel />
      )}
    </div>
  );
}
