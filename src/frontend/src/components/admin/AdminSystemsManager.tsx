import { Button } from "@/components/ui/button";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit2, Eye, EyeOff, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type { SystemApp } from "../../backend.d";
import { FormCard, SectionHeader, fieldClass } from "./AdminShared";

// ─── Validation ───────────────────────────────────────────────────────────────

function validateUrl(url: string): string | null {
  if (!url.trim()) return "URL is required.";
  if (!url.startsWith("http://") && !url.startsWith("https://"))
    return "URL must start with http:// or https://";
  return null;
}

function validateForm(
  name: string,
  description: string,
  url: string,
): string | null {
  if (!name.trim()) return "App name is required.";
  if (!description.trim()) return "Description is required.";
  return validateUrl(url);
}

// ─── Visibility toggle ────────────────────────────────────────────────────────

function VisibilityToggle({
  isVisible,
  onToggle,
  loading,
}: {
  isVisible: boolean;
  onToggle: () => void;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={loading}
      title={isVisible ? "Visible — click to hide" : "Hidden — click to show"}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-body font-semibold border transition-colors ${
        isVisible
          ? "bg-primary/15 border-primary/40 text-primary hover:bg-primary/25"
          : "bg-muted border-border text-muted-foreground hover:bg-primary/10 hover:text-primary"
      }`}
    >
      {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
      {isVisible ? "ON" : "OFF"}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminSystemsManager() {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();

  const [addMode, setAddMode] = useState(false);
  const [newForm, setNewForm] = useState({
    name: "",
    description: "",
    url: "",
  });
  const [newError, setNewError] = useState<string | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    url: "",
  });
  const [editError, setEditError] = useState<string | null>(null);

  // ── Data ──────────────────────────────────────────────────────────────────

  const { data: apps = [], isLoading } = useQuery<SystemApp[]>({
    queryKey: ["admin", "systems"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.adminGetSystemsApps();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });

  // ── Mutations ─────────────────────────────────────────────────────────────

  const addMut = useMutation({
    mutationFn: ({
      name,
      description,
      url,
    }: { name: string; description: string; url: string }) =>
      actor!.adminAddSystemApp(name, description, url),
    onSuccess: () => {
      toast.success("App added successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "systems"] });
      queryClient.invalidateQueries({ queryKey: ["systemsApps"] });
      setAddMode(false);
      setNewForm({ name: "", description: "", url: "" });
      setNewError(null);
    },
    onError: () => toast.error("Failed to add app"),
  });

  const editMut = useMutation({
    mutationFn: ({
      id,
      name,
      description,
      url,
    }: {
      id: string;
      name: string;
      description: string;
      url: string;
    }) => actor!.adminEditSystemApp(id, name, description, url),
    onSuccess: () => {
      toast.success("App updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "systems"] });
      queryClient.invalidateQueries({ queryKey: ["systemsApps"] });
      setEditId(null);
      setEditError(null);
    },
    onError: () => toast.error("Failed to update app"),
  });

  const toggleMut = useMutation({
    mutationFn: (id: string) => actor!.adminToggleSystemApp(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "systems"] });
      queryClient.invalidateQueries({ queryKey: ["systemsApps"] });
    },
    onError: () => toast.error("Toggle failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => actor!.adminDeleteSystemApp(id),
    onSuccess: () => {
      toast.success("App removed");
      queryClient.invalidateQueries({ queryKey: ["admin", "systems"] });
      queryClient.invalidateQueries({ queryKey: ["systemsApps"] });
    },
    onError: () => toast.error("Failed to delete app"),
  });

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleAdd() {
    const err = validateForm(newForm.name, newForm.description, newForm.url);
    if (err) {
      setNewError(err);
      return;
    }
    setNewError(null);
    addMut.mutate(newForm);
  }

  function startEdit(app: SystemApp) {
    setEditId(app.id);
    setEditForm({ name: app.name, description: app.description, url: app.url });
    setEditError(null);
  }

  function handleSaveEdit() {
    if (!editId) return;
    const err = validateForm(editForm.name, editForm.description, editForm.url);
    if (err) {
      setEditError(err);
      return;
    }
    setEditError(null);
    editMut.mutate({ id: editId, ...editForm });
  }

  function handleCancelEdit() {
    setEditId(null);
    setEditError(null);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div data-ocid="admin.systems.panel">
      <SectionHeader
        title="Systems Manager"
        subtitle="Add and manage your portfolio of live apps and systems."
      />

      {/* Add form */}
      <div className="flex items-center justify-between mb-4">
        <p className="font-body text-sm text-muted-foreground">
          Only apps with visibility ON will appear on the public{" "}
          <span className="text-primary font-semibold">/systems</span> page.
        </p>
        <Button
          size="sm"
          onClick={() => {
            setAddMode(true);
            setNewError(null);
          }}
          className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          data-ocid="admin.systems.add_button"
        >
          <Plus size={13} /> Add App
        </Button>
      </div>

      {addMode && (
        <FormCard title="Add New App">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                App Name *
              </span>
              <input
                className={fieldClass()}
                placeholder="e.g. Chefiyke Platform"
                value={newForm.name}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, name: e.target.value }))
                }
                data-ocid="admin.systems.name_input"
              />
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Live URL{" "}
                <span style={{ color: "#B8960C" }} aria-label="required">
                  *
                </span>
              </span>
              <input
                className={fieldClass()}
                placeholder="https://yourapp.com"
                value={newForm.url}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, url: e.target.value }))
                }
                data-ocid="admin.systems.url_input"
                aria-describedby="new-url-hint"
              />
              <p
                id="new-url-hint"
                className="text-[11px] text-muted-foreground mt-1"
              >
                Must start with https:// — required for "View Live App" button
              </p>
            </div>
            <div className="sm:col-span-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Description *
              </span>
              <textarea
                className={`${fieldClass()} resize-none h-20`}
                placeholder="Briefly describe what this app does..."
                value={newForm.description}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, description: e.target.value }))
                }
                data-ocid="admin.systems.description_textarea"
              />
            </div>
          </div>

          {newError && (
            <p
              className="text-xs text-destructive mb-3 font-body"
              data-ocid="admin.systems.add.error_state"
            >
              {newError}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={addMut.isPending}
              className="gap-1.5 text-xs bg-primary text-primary-foreground"
              data-ocid="admin.systems.save_button"
            >
              <Save size={13} /> Save App
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setAddMode(false);
                setNewError(null);
                setNewForm({ name: "", description: "", url: "" });
              }}
              className="gap-1.5 text-xs"
              data-ocid="admin.systems.cancel_button"
            >
              <X size={13} /> Cancel
            </Button>
          </div>
        </FormCard>
      )}

      {/* Apps list */}
      <div className="space-y-3">
        {isLoading && (
          <div
            className="bg-card border border-border rounded-xl p-8 text-center"
            data-ocid="admin.systems.loading_state"
          >
            <p className="text-muted-foreground text-sm animate-pulse">
              Loading apps…
            </p>
          </div>
        )}

        {!isLoading && apps.length === 0 && (
          <div
            className="bg-card border border-border rounded-xl p-8 text-center"
            data-ocid="admin.systems.empty_state"
          >
            <p className="text-muted-foreground text-sm">
              No apps yet. Click "Add App" to add your first system.
            </p>
          </div>
        )}

        {apps.map((app, i) => (
          <div
            key={app.id}
            className="bg-card border border-border rounded-xl p-4"
            data-ocid={`admin.systems.item.${i + 1}`}
          >
            {editId === app.id ? (
              /* Edit mode */
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                      App Name
                    </span>
                    <input
                      className={fieldClass()}
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, name: e.target.value }))
                      }
                      data-ocid={`admin.systems.edit_name_input.${i + 1}`}
                    />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                      Live URL{" "}
                      <span style={{ color: "#B8960C" }} aria-label="required">
                        *
                      </span>
                    </span>
                    <input
                      className={fieldClass()}
                      placeholder="https://yourapp.com"
                      value={editForm.url}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, url: e.target.value }))
                      }
                      data-ocid={`admin.systems.edit_url_input.${i + 1}`}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                      Description
                    </span>
                    <textarea
                      className={`${fieldClass()} resize-none h-20`}
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                      data-ocid={`admin.systems.edit_description_textarea.${i + 1}`}
                    />
                  </div>
                </div>

                {editError && (
                  <p
                    className="text-xs text-destructive font-body"
                    data-ocid={`admin.systems.edit.error_state.${i + 1}`}
                  >
                    {editError}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={editMut.isPending}
                    className="gap-1.5 text-xs bg-primary text-primary-foreground"
                    data-ocid={`admin.systems.save_button.${i + 1}`}
                  >
                    <Save size={12} /> Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="gap-1.5 text-xs"
                    data-ocid={`admin.systems.cancel_button.${i + 1}`}
                  >
                    <X size={12} /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              /* View mode */
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display font-semibold text-foreground text-sm mb-1 truncate">
                    {app.name}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {app.description}
                  </p>
                  {/* View Live App — always renders; disabled if URL is missing */}
                  {app.url?.trim() ? (
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-body font-semibold border border-primary/40 bg-primary/10 hover:bg-primary/20 transition-colors"
                      style={{ color: "#B8960C" }}
                      data-ocid={`admin.systems.view_app_button.${i + 1}`}
                    >
                      View Live App ↗
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-body font-semibold border border-border text-muted-foreground cursor-not-allowed opacity-50"
                      data-ocid={`admin.systems.view_app_unavailable.${i + 1}`}
                      aria-disabled="true"
                    >
                      Link unavailable
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <VisibilityToggle
                    isVisible={app.isVisible}
                    onToggle={() => toggleMut.mutate(app.id)}
                    loading={toggleMut.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => startEdit(app)}
                    className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    data-ocid={`admin.systems.edit_button.${i + 1}`}
                    aria-label="Edit app"
                  >
                    <Edit2 size={14} />
                  </button>
                  {confirmDeleteId === app.id ? (
                    <div
                      className="flex items-center gap-1.5"
                      data-ocid={`admin.systems.delete_confirm.${i + 1}`}
                    >
                      <span className="text-[11px] text-destructive font-body whitespace-nowrap">
                        Remove app?
                      </span>
                      <Button
                        size="sm"
                        onClick={() => {
                          deleteMut.mutate(app.id);
                          setConfirmDeleteId(null);
                        }}
                        disabled={deleteMut.isPending}
                        className="gap-1 text-[11px] h-7 px-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        data-ocid={`admin.systems.confirm_button.${i + 1}`}
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfirmDeleteId(null)}
                        className="gap-1 text-[11px] h-7 px-2"
                        data-ocid={`admin.systems.cancel_button.${i + 1}`}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(app.id)}
                      disabled={deleteMut.isPending}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      data-ocid={`admin.systems.delete_button.${i + 1}`}
                      aria-label="Delete app"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
