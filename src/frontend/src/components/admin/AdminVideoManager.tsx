import { Button } from "@/components/ui/button";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ExternalLink,
  Eye,
  EyeOff,
  Link2,
  Pencil,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type { GalleryVideo, GalleryVideoInput } from "../../backend";
import { FormCard, SectionHeader, fieldClass } from "./AdminShared";

// ─── URL Validation ──────────────────────────────────────────────────────────

function validateVideoUrl(url: string): string | null {
  if (!url.trim()) return "Video URL is required.";
  if (!url.startsWith("http://") && !url.startsWith("https://"))
    return "URL must start with http:// or https://";
  return null;
}

// ─── Video Source Badge ───────────────────────────────────────────────────────

function SourceBadge({ url }: { url: string }) {
  let source = "External";
  if (url.includes("youtube.com") || url.includes("youtu.be"))
    source = "YouTube";
  else if (url.includes("instagram.com")) source = "Instagram";
  else if (url.includes("tiktok.com")) source = "TikTok";
  else if (url.includes("facebook.com") || url.includes("fb.watch"))
    source = "Facebook";
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-semibold">
      <Link2 size={9} /> {source}
    </span>
  );
}

// ─── Empty form factory ───────────────────────────────────────────────────────

const emptyForm = (): GalleryVideoInput => ({
  url: "",
  title: "",
  description: "",
  isVisible: true,
  isFeatured: false,
});

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminVideoManager() {
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  const enabled = !!actor && !isFetching;

  const [addMode, setAddMode] = useState(false);
  const [form, setForm] = useState<GalleryVideoInput>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);

  const [editId, setEditId] = useState<bigint | null>(null);
  const [editForm, setEditForm] = useState<GalleryVideoInput>(emptyForm());
  const [editError, setEditError] = useState<string | null>(null);

  const [pendingDeleteId, setPendingDeleteId] = useState<bigint | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "videos"] });
    qc.invalidateQueries({ queryKey: ["videos"] });
  };

  // Admin list — all videos
  const { data: videos = [], isLoading } = useQuery<GalleryVideo[]>({
    queryKey: ["admin", "videos"],
    queryFn: () => actor!.adminGetGalleryVideos(),
    enabled,
  });

  // Add
  const addMut = useMutation({
    mutationFn: () => actor!.adminAddGalleryVideo(form),
    onSuccess: (res) => {
      if (res.__kind__ === "err") {
        toast.error(res.err);
        return;
      }
      toast.success("Video added successfully");
      invalidate();
      setAddMode(false);
      setForm(emptyForm());
      setFormError(null);
    },
    onError: () => toast.error("Failed to add video"),
  });

  // Edit
  const editMut = useMutation({
    mutationFn: ({ id, input }: { id: bigint; input: GalleryVideoInput }) =>
      actor!.adminEditGalleryVideo(id, input),
    onSuccess: (res) => {
      if (res.__kind__ === "err") {
        toast.error(res.err);
        return;
      }
      toast.success("Video updated");
      invalidate();
      setEditId(null);
      setEditError(null);
    },
    onError: () => toast.error("Failed to update video"),
  });

  // Toggle visibility
  const toggleVisMut = useMutation({
    mutationFn: (id: bigint) => actor!.adminToggleGalleryVideoVisibility(id),
    onSuccess: (res) => {
      if (res.__kind__ === "err") {
        toast.error(res.err);
        return;
      }
      toast.success(res.ok.isVisible ? "Video is now visible" : "Video hidden");
      invalidate();
    },
    onError: () => toast.error("Failed to update visibility"),
  });

  // Toggle featured
  const toggleFeatMut = useMutation({
    mutationFn: (id: bigint) => actor!.adminToggleGalleryVideoFeatured(id),
    onSuccess: (res) => {
      if (res.__kind__ === "err") {
        toast.error(res.err);
        return;
      }
      toast.success(res.ok.isFeatured ? "Marked as featured" : "Unfeatured");
      invalidate();
    },
    onError: () => toast.error("Failed to update featured status"),
  });

  // Delete
  const deleteMut = useMutation({
    mutationFn: (id: bigint) => actor!.adminDeleteGalleryVideo(id),
    onSuccess: () => {
      toast.success("Video removed");
      invalidate();
      setPendingDeleteId(null);
    },
    onError: () => toast.error("Failed to remove video"),
  });

  function handleAdd() {
    const urlErr = validateVideoUrl(form.url);
    if (urlErr) {
      setFormError(urlErr);
      return;
    }
    if (!form.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    setFormError(null);
    addMut.mutate();
  }

  function openEdit(vid: GalleryVideo) {
    setEditId(vid.id);
    setEditForm({
      url: vid.url,
      title: vid.title,
      description: vid.description,
      isVisible: vid.isVisible,
      isFeatured: vid.isFeatured,
    });
    setEditError(null);
  }

  function handleEdit() {
    if (!editId) return;
    const urlErr = validateVideoUrl(editForm.url);
    if (urlErr) {
      setEditError(urlErr);
      return;
    }
    if (!editForm.title.trim()) {
      setEditError("Title is required.");
      return;
    }
    setEditError(null);
    editMut.mutate({ id: editId, input: editForm });
  }

  return (
    <div data-ocid="admin.video_manager.section">
      <SectionHeader
        title="Video Manager"
        subtitle="Add external video links (YouTube, Instagram, TikTok, Facebook) that appear on your site."
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <p className="font-body text-sm text-muted-foreground">
          Videos use external links — no upload needed.
        </p>
        <Button
          size="sm"
          onClick={() => {
            setAddMode(true);
            setFormError(null);
          }}
          className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          data-ocid="admin.video_manager.add_button"
        >
          <Plus size={13} /> Add Video
        </Button>
      </div>

      {/* ── Add form ─────────────────────────────────────────────────────── */}
      {addMode && (
        <FormCard title="Add New Video">
          <VideoForm
            form={form}
            setForm={setForm}
            error={formError}
            prefix="add"
          />
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={addMut.isPending}
              className="gap-1.5 text-xs bg-primary text-primary-foreground"
              data-ocid="admin.video_manager.save_button"
            >
              {addMut.isPending ? "Saving…" : "Save Video"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setAddMode(false);
                setForm(emptyForm());
                setFormError(null);
              }}
              className="gap-1.5 text-xs"
              data-ocid="admin.video_manager.cancel_button"
            >
              <X size={13} /> Cancel
            </Button>
          </div>
        </FormCard>
      )}

      {/* ── Videos list ──────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {isLoading && (
          <div
            className="bg-card border border-border rounded-xl p-8 text-center"
            data-ocid="admin.video_manager.loading_state"
          >
            <p className="text-muted-foreground text-sm animate-pulse">
              Loading videos…
            </p>
          </div>
        )}

        {!isLoading && videos.length === 0 && (
          <div
            className="bg-card border border-border rounded-xl p-8 text-center"
            data-ocid="admin.video_manager.empty_state"
          >
            <p className="font-body text-sm text-muted-foreground mb-1">
              No videos added yet.
            </p>
            <p className="font-body text-xs text-muted-foreground">
              Click "Add Video" to add your first external video link.
            </p>
          </div>
        )}

        {videos.map((vid, i) => (
          <div
            key={String(vid.id)}
            className="bg-card border border-border rounded-xl p-4"
            data-ocid={`admin.video_manager.item.${i + 1}`}
          >
            {/* ── Confirm delete overlay ── */}
            {pendingDeleteId === vid.id ? (
              <div className="flex items-center justify-between gap-3">
                <p className="font-body text-sm text-foreground">
                  Remove <strong>{vid.title}</strong>? This cannot be undone.
                </p>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMut.mutate(vid.id)}
                    disabled={deleteMut.isPending}
                    className="text-xs gap-1"
                    data-ocid={`admin.video_manager.confirm_button.${i + 1}`}
                  >
                    {deleteMut.isPending ? "Removing…" : "Yes, remove"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPendingDeleteId(null)}
                    className="text-xs"
                    data-ocid={`admin.video_manager.cancel_button.${i + 1}`}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : editId === vid.id ? (
              /* ── Inline edit form ── */
              <div>
                <p className="font-display font-semibold text-sm text-foreground mb-3">
                  Edit Video
                </p>
                <VideoForm
                  form={editForm}
                  setForm={setEditForm}
                  error={editError}
                  prefix={`edit.${i + 1}`}
                />
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={handleEdit}
                    disabled={editMut.isPending}
                    className="gap-1.5 text-xs bg-primary text-primary-foreground"
                    data-ocid={`admin.video_manager.save_button.${i + 1}`}
                  >
                    {editMut.isPending ? "Saving…" : "Save Changes"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditId(null);
                      setEditError(null);
                    }}
                    className="text-xs"
                    data-ocid={`admin.video_manager.cancel_button.${i + 1}`}
                  >
                    <X size={13} /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              /* ── Normal row ── */
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-display font-semibold text-foreground text-sm">
                      {vid.title}
                    </p>
                    <SourceBadge url={vid.url} />
                    {vid.isFeatured && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-yellow-500/15 text-yellow-500 font-semibold">
                        <Star size={9} /> Featured
                      </span>
                    )}
                    {!vid.isVisible && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground font-semibold">
                        <EyeOff size={9} /> Hidden
                      </span>
                    )}
                  </div>
                  {vid.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {vid.description}
                    </p>
                  )}
                  {vid.url ? (
                    <a
                      href={vid.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-body font-semibold border border-primary/40 bg-primary/10 hover:bg-primary/20 transition-colors px-3 py-1.5 rounded-lg"
                      style={{ color: "#B8960C" }}
                      data-ocid={`admin.video_manager.view_button.${i + 1}`}
                    >
                      <ExternalLink size={11} /> Open Video
                    </a>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">
                      No URL set
                    </span>
                  )}
                </div>

                {/* Action icons */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleVisMut.mutate(vid.id)}
                    disabled={toggleVisMut.isPending}
                    className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    aria-label={vid.isVisible ? "Hide video" : "Show video"}
                    data-ocid={`admin.video_manager.toggle.${i + 1}`}
                  >
                    {vid.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleFeatMut.mutate(vid.id)}
                    disabled={toggleFeatMut.isPending}
                    className={`p-1.5 rounded-lg transition-colors ${
                      vid.isFeatured
                        ? "text-yellow-500 hover:bg-yellow-500/10"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                    aria-label={
                      vid.isFeatured ? "Unfeature video" : "Feature video"
                    }
                    data-ocid={`admin.video_manager.feature_toggle.${i + 1}`}
                  >
                    <Star size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(vid)}
                    className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Edit video"
                    data-ocid={`admin.video_manager.edit_button.${i + 1}`}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDeleteId(vid.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Delete video"
                    data-ocid={`admin.video_manager.delete_button.${i + 1}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Shared form fields ───────────────────────────────────────────────────────

function VideoForm({
  form,
  setForm,
  error,
  prefix,
}: {
  form: GalleryVideoInput;
  setForm: React.Dispatch<React.SetStateAction<GalleryVideoInput>>;
  error: string | null;
  prefix: string;
}) {
  return (
    <div className="space-y-3">
      <div>
        <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
          Video Title <span className="text-destructive">*</span>
        </span>
        <input
          className={fieldClass()}
          placeholder="e.g. How I Built My First System"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          data-ocid={`admin.video_manager.title_input.${prefix}`}
        />
      </div>

      <div>
        <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
          Video URL <span className="text-destructive">*</span>
        </span>
        <input
          className={fieldClass()}
          placeholder="https://youtube.com/watch?v=..."
          value={form.url}
          onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
          data-ocid={`admin.video_manager.url_input.${prefix}`}
        />
        <p className="text-[11px] text-muted-foreground mt-1">
          Supports YouTube, Instagram, TikTok, Facebook video, or any external
          video URL.
        </p>
      </div>

      <div>
        <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
          Short Description (optional)
        </span>
        <textarea
          className={`${fieldClass()} resize-none h-20`}
          placeholder="Brief description of this video..."
          value={form.description}
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
          data-ocid={`admin.video_manager.desc_input.${prefix}`}
        />
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isVisible}
            onChange={(e) =>
              setForm((p) => ({ ...p, isVisible: e.target.checked }))
            }
            className="rounded border-border"
            data-ocid={`admin.video_manager.visible_checkbox.${prefix}`}
          />
          <span className="text-xs text-foreground">Visible on site</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) =>
              setForm((p) => ({ ...p, isFeatured: e.target.checked }))
            }
            className="rounded border-border"
            data-ocid={`admin.video_manager.featured_checkbox.${prefix}`}
          />
          <span className="text-xs text-foreground">Featured video</span>
        </label>
      </div>

      {error && (
        <p
          className="text-xs text-destructive font-body"
          data-ocid={`admin.video_manager.${prefix}.error_state`}
        >
          {error}
        </p>
      )}
    </div>
  );
}
