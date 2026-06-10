import { Button } from "@/components/ui/button";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  EyeOff,
  ImageIcon,
  Images,
  Pencil,
  Save,
  Star,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type {
  GalleryImage,
  GalleryVideo,
  GalleryVideoInput,
} from "../../backend";
import type { HeroImageIds } from "../../hooks/usePageContent";
import { getFileUrlSync, uploadFile } from "../../utils/storage";
import { SectionHeader, fieldClass } from "./AdminShared";

// ─── Section Images Panel ───────────────────────────────────────────────────────

const SECTION_IMAGE_FIELDS: { key: keyof HeroImageIds; label: string }[] = [
  { key: "slide1ImageId", label: "Slide 1 Image" },
  { key: "slide2ImageId", label: "Slide 2 Image" },
  { key: "slide3ImageId", label: "Slide 3 Image" },
  { key: "aboutImageId", label: "About Image" },
  { key: "presenceImageId", label: "Presence Image" },
];

function SectionImagesPanel() {
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  const enabled = !!actor && !isFetching;

  const { data: ids = {} } = useQuery<HeroImageIds>({
    queryKey: ["admin", "hero-image-ids"],
    queryFn: async () => {
      const extActor = actor as typeof actor & {
        adminGetHeroImageIds?: () => Promise<HeroImageIds>;
        getHeroImageIds?: () => Promise<HeroImageIds>;
      };
      if (typeof extActor.adminGetHeroImageIds === "function")
        return (await extActor.adminGetHeroImageIds()) ?? {};
      if (typeof extActor.getHeroImageIds === "function")
        return (await extActor.getHeroImageIds()) ?? {};
      return {};
    },
    enabled,
  });

  const [local, setLocal] = useState<HeroImageIds | null>(null);
  const current = local ?? ids;
  const [uploading, setUploading] = useState<
    Partial<Record<keyof HeroImageIds, boolean>>
  >({});
  const fileRefs = useRef<
    Partial<Record<keyof HeroImageIds, HTMLInputElement | null>>
  >({});

  const saveMutation = useMutation({
    mutationFn: async (newIds: HeroImageIds) => {
      const extActor = actor as typeof actor & {
        adminSetHeroImageIds?: (ids: HeroImageIds) => Promise<void>;
      };
      if (typeof extActor.adminSetHeroImageIds === "function") {
        await extActor.adminSetHeroImageIds(newIds);
        return;
      }
      throw new Error(
        "adminSetHeroImageIds not yet available. Please update the backend.",
      );
    },
    onSuccess: () => {
      toast.success("Section images saved");
      qc.invalidateQueries({ queryKey: ["admin", "hero-image-ids"] });
      qc.invalidateQueries({ queryKey: ["heroImageIds"] });
      setLocal(null);
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to save images"),
  });

  /** Upload via object-storage extension */
  const handleFileChange = async (
    key: keyof HeroImageIds,
    file: File | null,
  ) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [key]: true }));
    try {
      const storageId = await uploadFile(file);
      setLocal((prev) => ({ ...(prev ?? current), [key]: storageId }));
      toast.success(`${key} uploaded — click Save to persist`);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="space-y-4">
      <p className="font-body text-xs text-muted-foreground">
        Upload an image directly or paste a storage ID. Images are stored via
        the platform’s object-storage extension and persist permanently.
      </p>
      {SECTION_IMAGE_FIELDS.map(({ key, label }) => {
        const storageId = current[key] ?? "";
        return (
          <div
            key={key}
            className="border border-border rounded-lg p-4 space-y-3"
            data-ocid={`admin.media.section_image.${key}`}
          >
            <div className="flex items-center justify-between">
              <p className="font-body text-sm font-semibold text-foreground">
                {label}
              </p>
              {storageId && (
                <button
                  type="button"
                  onClick={() =>
                    setLocal((prev) => ({
                      ...(prev ?? current),
                      [key]: undefined,
                    }))
                  }
                  className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
                  aria-label={`Remove ${label}`}
                >
                  <X size={12} /> Remove
                </button>
              )}
            </div>

            {/* Preview */}
            {storageId && (
              <img
                src={getFileUrlSync(storageId) ?? ""}
                alt={label}
                className="w-full max-h-32 object-contain rounded border border-border bg-muted/20"
              />
            )}

            {/* Storage ID input */}
            <input
              className={fieldClass()}
              placeholder="Paste storage ID"
              value={storageId}
              onChange={(e) =>
                setLocal((prev) => ({
                  ...(prev ?? current),
                  [key]: e.target.value || undefined,
                }))
              }
              data-ocid={`admin.media.section_image_input.${key}`}
            />

            {/* Upload button */}
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                ref={(el) => {
                  fileRefs.current[key] = el;
                }}
                onChange={(e) =>
                  handleFileChange(key, e.target.files?.[0] ?? null)
                }
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileRefs.current[key]?.click()}
                disabled={uploading[key]}
                data-ocid={`admin.media.section_image_upload.${key}`}
              >
                <Upload size={13} className="mr-1" />
                {uploading[key] ? "Uploading…" : "Upload Image"}
              </Button>
            </div>
          </div>
        );
      })}

      <Button
        onClick={() => saveMutation.mutate(current)}
        disabled={saveMutation.isPending}
        data-ocid="admin.media.section_images_save_button"
      >
        <Save size={14} className="mr-1" />
        {saveMutation.isPending ? "Saving…" : "Save Section Images"}
      </Button>
    </div>
  );
}

// ─── Gallery Image Manager ────────────────────────────────────────────────────

function ImageManager() {
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  const enabled = !!actor && !isFetching;
  const [storageId, setStorageId] = useState("");
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: images = [] } = useQuery<GalleryImage[]>({
    queryKey: ["admin", "gallery-images-media"],
    queryFn: () => actor!.adminGetGalleryImages(),
    enabled,
  });

  const addMutation = useMutation({
    mutationFn: async ({ sid, cap }: { sid: string; cap: string }) => {
      const res = await actor!.adminAddGalleryImage(sid.trim(), cap.trim());
      if (res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      toast.success("Image added to gallery");
      qc.invalidateQueries({ queryKey: ["admin", "gallery-images-media"] });
      qc.invalidateQueries({ queryKey: ["admin", "gallery-images"] });
      qc.invalidateQueries({ queryKey: ["galleryImages"] });
      setStorageId("");
      setCaption("");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to add image"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: bigint) => actor!.adminDeleteGalleryImage(id),
    onSuccess: () => {
      toast.success("Image removed");
      qc.invalidateQueries({ queryKey: ["admin", "gallery-images-media"] });
      qc.invalidateQueries({ queryKey: ["admin", "gallery-images"] });
      qc.invalidateQueries({ queryKey: ["galleryImages"] });
    },
    onError: () => toast.error("Failed to remove image"),
  });

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const sid = await uploadFile(file);
      addMutation.mutate({ sid, cap: caption });
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Upload via file picker */}
      <div className="border border-dashed border-border rounded-xl p-5 space-y-3 text-center">
        <ImageIcon size={28} className="mx-auto text-muted-foreground" />
        <p className="font-body text-sm text-muted-foreground">
          Upload a new image directly
        </p>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="sr-only"
          onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || addMutation.isPending}
          data-ocid="admin.media.upload_image_button"
        >
          <Upload size={14} className="mr-1" />
          {isUploading ? "Uploading…" : "Choose & Upload Image"}
        </Button>
      </div>

      {/* Or paste storage ID */}
      <div className="space-y-3">
        <p className="font-body text-xs text-muted-foreground font-semibold uppercase tracking-widest">
          Or add by Storage ID
        </p>
        <input
          className={fieldClass()}
          placeholder="Paste object-storage storage ID"
          value={storageId}
          onChange={(e) => setStorageId(e.target.value)}
          data-ocid="admin.media.image_storage_input"
        />
        <input
          className={fieldClass()}
          placeholder="Caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          data-ocid="admin.media.image_caption_input"
        />
        <Button
          onClick={() => addMutation.mutate({ sid: storageId, cap: caption })}
          disabled={!storageId.trim() || addMutation.isPending}
          data-ocid="admin.media.add_image_button"
        >
          <Upload size={14} className="mr-1" />
          {addMutation.isPending ? "Adding…" : "Add Image"}
        </Button>
      </div>

      {/* Gallery list */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-display font-semibold text-base text-foreground mb-3 pb-3 border-b border-border flex items-center gap-2">
          <Images size={16} className="text-primary" /> Gallery Images (
          {images.length})
        </h3>
        {images.length === 0 ? (
          <p
            className="font-body text-sm text-muted-foreground text-center py-6"
            data-ocid="admin.media.images_empty_state"
          >
            No images yet. Add one above.
          </p>
        ) : (
          <div className="space-y-2">
            {images.map((img, i) => (
              <div
                key={String(img.id)}
                className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0"
                data-ocid={`admin.media.image.item.${i + 1}`}
              >
                <div className="min-w-0">
                  <p className="font-body text-xs font-semibold text-foreground truncate">
                    {img.storageId}
                  </p>
                  {img.caption && (
                    <p className="font-body text-xs text-muted-foreground truncate">
                      {img.caption}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(img.id)}
                  disabled={deleteMutation.isPending}
                  className="text-muted-foreground hover:text-destructive shrink-0 transition-colors disabled:opacity-50"
                  aria-label="Delete image"
                  data-ocid={`admin.media.delete_image.${i + 1}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Video Manager ─────────────────────────────────────────────────────────────

interface VideoFormState {
  title: string;
  description: string;
  url: string;
  isVisible: boolean;
  isFeatured: boolean;
}

const EMPTY_VIDEO: VideoFormState = {
  title: "",
  description: "",
  url: "",
  isVisible: true,
  isFeatured: false,
};

function VideoManager() {
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  const enabled = !!actor && !isFetching;

  const [form, setForm] = useState<VideoFormState>(EMPTY_VIDEO);
  const [editingId, setEditingId] = useState<bigint | null>(null);

  const { data: videos = [] } = useQuery<GalleryVideo[]>({
    queryKey: ["admin", "gallery-videos-media"],
    queryFn: () => actor!.adminGetGalleryVideos(),
    enabled,
  });

  const addMutation = useMutation({
    mutationFn: (input: GalleryVideoInput) =>
      actor!.adminAddGalleryVideo(input),
    onSuccess: () => {
      toast.success("Video added");
      qc.invalidateQueries({ queryKey: ["admin", "gallery-videos-media"] });
      qc.invalidateQueries({ queryKey: ["galleryVideos"] });
      setForm(EMPTY_VIDEO);
    },
    onError: () => toast.error("Failed to add video"),
  });

  const editMutation = useMutation({
    mutationFn: ({ id, input }: { id: bigint; input: GalleryVideoInput }) =>
      actor!.adminEditGalleryVideo(id, input),
    onSuccess: () => {
      toast.success("Video updated");
      qc.invalidateQueries({ queryKey: ["admin", "gallery-videos-media"] });
      qc.invalidateQueries({ queryKey: ["galleryVideos"] });
      setForm(EMPTY_VIDEO);
      setEditingId(null);
    },
    onError: () => toast.error("Failed to update video"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: bigint) => actor!.adminDeleteGalleryVideo(id),
    onSuccess: () => {
      toast.success("Video removed");
      qc.invalidateQueries({ queryKey: ["admin", "gallery-videos-media"] });
      qc.invalidateQueries({ queryKey: ["galleryVideos"] });
    },
    onError: () => toast.error("Failed to remove video"),
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: (id: bigint) => actor!.adminToggleGalleryVideoVisibility(id),
    onSuccess: (res) => {
      const visible =
        typeof res === "object" &&
        res !== null &&
        "ok" in res &&
        typeof (res as { ok: GalleryVideo }).ok?.isVisible === "boolean"
          ? (res as { ok: GalleryVideo }).ok.isVisible
          : null;
      if (visible !== null) {
        toast.success(visible ? "Video is now visible" : "Video hidden");
      } else {
        toast.success("Video visibility updated");
      }
      qc.invalidateQueries({ queryKey: ["admin", "gallery-videos-media"] });
      qc.invalidateQueries({ queryKey: ["galleryVideos"] });
    },
    onError: () => toast.error("Failed to toggle visibility"),
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: (id: bigint) => actor!.adminToggleGalleryVideoFeatured(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "gallery-videos-media"] });
    },
    onError: () => toast.error("Failed to toggle featured"),
  });

  const startEdit = (vid: GalleryVideo) => {
    setEditingId(vid.id);
    setForm({
      title: vid.title,
      description: vid.description,
      url: vid.url,
      isVisible: vid.isVisible,
      isFeatured: vid.isFeatured,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_VIDEO);
  };

  const handleSubmit = () => {
    const input: GalleryVideoInput = {
      title: form.title.trim(),
      description: form.description.trim(),
      url: form.url.trim(),
      isVisible: form.isVisible,
      isFeatured: form.isFeatured,
    };
    if (editingId !== null) {
      editMutation.mutate({ id: editingId, input });
    } else {
      addMutation.mutate(input);
    }
  };

  const isBusy = addMutation.isPending || editMutation.isPending;

  return (
    <div className="space-y-5">
      {/* Add / Edit form */}
      <div className="border border-border rounded-xl p-5 space-y-3">
        <p className="font-body text-xs text-primary font-semibold uppercase tracking-widest">
          {editingId !== null ? "Edit Video" : "Add Video"}
        </p>
        <p className="font-body text-xs text-muted-foreground">
          Paste a YouTube, Instagram, TikTok, Facebook, or any external video
          URL. Videos open in a new tab when clicked.
        </p>
        <input
          className={fieldClass()}
          placeholder="Video title *"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          data-ocid="admin.media.video_title_input"
        />
        <input
          className={fieldClass()}
          placeholder="Video URL (YouTube, TikTok, Instagram, Facebook, any link) *"
          value={form.url}
          onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
          data-ocid="admin.media.video_url_input"
        />
        <textarea
          className={`${fieldClass()} min-h-[70px] resize-y`}
          placeholder="Short description (optional)"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          data-ocid="admin.media.video_desc_input"
        />
        {/* Toggles */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.isVisible}
              onChange={(e) =>
                setForm((f) => ({ ...f, isVisible: e.target.checked }))
              }
              className="accent-primary w-3.5 h-3.5"
            />
            <span className="font-body text-xs text-foreground">
              Visible on frontend
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) =>
                setForm((f) => ({ ...f, isFeatured: e.target.checked }))
              }
              className="accent-primary w-3.5 h-3.5"
            />
            <span className="font-body text-xs text-foreground">
              Featured video
            </span>
          </label>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={!form.title.trim() || !form.url.trim() || isBusy}
            data-ocid="admin.media.add_video_button"
          >
            <Upload size={14} className="mr-1" />
            {isBusy
              ? editingId !== null
                ? "Saving…"
                : "Adding…"
              : editingId !== null
                ? "Save Changes"
                : "Add Video"}
          </Button>
          {editingId !== null && (
            <Button variant="outline" onClick={cancelEdit}>
              <X size={14} className="mr-1" /> Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Video list */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-display font-semibold text-base text-foreground mb-3 pb-3 border-b border-border flex items-center gap-2">
          <Video size={16} className="text-primary" /> Videos ({videos.length})
        </h3>
        {videos.length === 0 ? (
          <p
            className="font-body text-sm text-muted-foreground text-center py-6"
            data-ocid="admin.media.videos_empty_state"
          >
            No videos yet. Add one above.
          </p>
        ) : (
          <div className="space-y-3">
            {videos.map((vid, i) => (
              <div
                key={String(vid.id)}
                className="flex items-start gap-3 py-3 border-b border-border last:border-0"
                data-ocid={`admin.media.video.item.${i + 1}`}
              >
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-body text-sm font-semibold text-foreground truncate">
                      {vid.title}
                    </p>
                    {vid.isFeatured && (
                      <span
                        className="text-[10px] font-body font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          background: "rgba(184,150,12,0.15)",
                          color: "#B8960C",
                          border: "1px solid rgba(184,150,12,0.3)",
                        }}
                      >
                        Featured
                      </span>
                    )}
                    {!vid.isVisible && (
                      <span className="text-[10px] font-body font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        Hidden
                      </span>
                    )}
                  </div>
                  <a
                    href={vid.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-xs text-primary/70 hover:text-primary truncate block max-w-[260px] transition-colors"
                  >
                    {vid.url}
                  </a>
                  {vid.description && (
                    <p className="font-body text-xs text-muted-foreground line-clamp-1">
                      {vid.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => startEdit(vid)}
                    className="p-1.5 rounded text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Edit video"
                    data-ocid={`admin.media.edit_video.${i + 1}`}
                  >
                    <Pencil size={14} />
                  </button>
                  {/* Toggle visibility */}
                  <button
                    type="button"
                    onClick={() => toggleVisibilityMutation.mutate(vid.id)}
                    disabled={toggleVisibilityMutation.isPending}
                    className="p-1.5 rounded transition-colors"
                    style={{
                      color: vid.isVisible
                        ? "#B8960C"
                        : "rgba(150,150,150,0.7)",
                    }}
                    aria-label={vid.isVisible ? "Hide video" : "Show video"}
                    title={vid.isVisible ? "Visible" : "Hidden"}
                    data-ocid={`admin.media.toggle_video.${i + 1}`}
                  >
                    {vid.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  {/* Toggle featured */}
                  <button
                    type="button"
                    onClick={() => toggleFeaturedMutation.mutate(vid.id)}
                    disabled={toggleFeaturedMutation.isPending}
                    className="p-1.5 rounded transition-colors"
                    style={{
                      color: vid.isFeatured
                        ? "#B8960C"
                        : "rgba(150,150,150,0.5)",
                    }}
                    aria-label={
                      vid.isFeatured ? "Unfeature" : "Set as featured"
                    }
                    title={vid.isFeatured ? "Featured" : "Not featured"}
                    data-ocid={`admin.media.feature_video.${i + 1}`}
                  >
                    <Star size={14} />
                  </button>
                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(vid.id)}
                    disabled={deleteMutation.isPending}
                    className="p-1.5 rounded text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Delete video"
                    data-ocid={`admin.media.delete_video.${i + 1}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────

type MediaTab = "section-images" | "gallery-images" | "videos";

export function AdminMediaManager() {
  const [tab, setTab] = useState<MediaTab>("section-images");
  return (
    <div data-ocid="admin.media.section">
      <SectionHeader
        title="Media Manager"
        subtitle="Manage section images, gallery, and videos"
      />
      <div className="flex gap-2 mb-6 flex-wrap">
        {(
          [
            {
              id: "section-images" as MediaTab,
              icon: <ImageIcon size={14} />,
              label: "Section Images",
            },
            {
              id: "gallery-images" as MediaTab,
              icon: <Images size={14} />,
              label: "Gallery Images",
            },
            {
              id: "videos" as MediaTab,
              icon: <Video size={14} />,
              label: "Videos",
            },
          ] as const
        ).map(({ id, icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            data-ocid={`admin.media.${id}_tab`}
            className={`px-4 py-2 rounded-lg text-sm font-body font-medium transition-colors ${
              tab === id
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <span className="flex items-center gap-1.5">
              {icon}
              {label}
            </span>
          </button>
        ))}
      </div>
      {tab === "section-images" && <SectionImagesPanel />}
      {tab === "gallery-images" && <ImageManager />}
      {tab === "videos" && <VideoManager />}
    </div>
  );
}
