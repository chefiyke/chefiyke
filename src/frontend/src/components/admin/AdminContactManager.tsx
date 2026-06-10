import { Button } from "@/components/ui/button";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Globe,
  Link,
  Mail,
  MessageCircle,
  Phone,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type { ContactPlatform } from "../../backend.d";
import { SectionHeader, fieldClass } from "./AdminShared";

// ── Platform definitions ─────────────────────────────────────────────────────

interface PlatformDef {
  key: string;
  name: string;
  icon: React.ReactNode;
  placeholder: string;
}

const PLATFORM_DEFS: PlatformDef[] = [
  {
    key: "whatsapp",
    name: "WhatsApp",
    icon: <MessageCircle size={16} />,
    placeholder: "https://wa.me/2348035614528",
  },
  {
    key: "phone",
    name: "Phone",
    icon: <Phone size={16} />,
    placeholder: "+2348035614528",
  },
  {
    key: "email",
    name: "Email",
    icon: <Mail size={16} />,
    placeholder: "Chefiyke@gmail.com",
  },
  {
    key: "facebook",
    name: "Facebook",
    icon: <span className="text-sm font-bold">f</span>,
    placeholder: "https://www.facebook.com/chefiyke",
  },
  {
    key: "instagram",
    name: "Instagram",
    icon: <span className="text-sm font-bold">ig</span>,
    placeholder: "https://www.instagram.com/iamchefiyke",
  },
  {
    key: "tiktok",
    name: "TikTok",
    icon: <span className="text-sm font-bold">tt</span>,
    placeholder: "https://www.tiktok.com/@chefiyke",
  },
  {
    key: "linkedin",
    name: "LinkedIn",
    icon: <span className="text-sm font-bold">in</span>,
    placeholder: "https://linkedin.com/in/yourprofile",
  },
  {
    key: "x",
    name: "X / Twitter",
    icon: <span className="text-sm font-bold">𝕏</span>,
    placeholder: "https://x.com/chefiyke",
  },
  {
    key: "youtube",
    name: "YouTube",
    icon: <span className="text-sm font-bold">▶</span>,
    placeholder: "https://www.youtube.com/@chefiyke",
  },
  {
    key: "telegram",
    name: "Telegram",
    icon: <span className="text-sm font-bold">tg</span>,
    placeholder: "https://t.me/chefiyke",
  },
  {
    key: "snapchat",
    name: "Snapchat",
    icon: <span className="text-sm font-bold">sc</span>,
    placeholder: "https://snapchat.com/add/chefiyke",
  },
  {
    key: "threads",
    name: "Threads",
    icon: <span className="text-sm font-bold">@</span>,
    placeholder: "https://threads.net/@chefiyke",
  },
  {
    key: "twitch",
    name: "Twitch",
    icon: <span className="text-sm font-bold">tw</span>,
    placeholder: "https://twitch.tv/chefiyke",
  },
  {
    key: "reddit",
    name: "Reddit",
    icon: <span className="text-sm font-bold">r/</span>,
    placeholder: "https://reddit.com/user/chefiyke",
  },
  {
    key: "pinterest",
    name: "Pinterest",
    icon: <span className="text-sm font-bold">P</span>,
    placeholder: "https://pinterest.com/chefiyke",
  },
  {
    key: "website",
    name: "Website",
    icon: <Globe size={16} />,
    placeholder: "https://www.chefiyke.com",
  },
  {
    key: "custom",
    name: "Custom Link",
    icon: <Link size={16} />,
    placeholder: "https://custom-link.com",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function getPlatformDef(key: string): PlatformDef {
  return (
    PLATFORM_DEFS.find((p) => p.key === key) ?? {
      key,
      name: key,
      icon: <Link size={16} />,
      placeholder: "https://...",
    }
  );
}

/** No longer used for initial load — backend returns all platforms already.
 * Kept only for the discard action to fall back to remote data cleanly. */
function sortByOrder(remote: ContactPlatform[]): ContactPlatform[] {
  return [...remote].sort((a, b) => Number(a.order) - Number(b.order));
}

// ── Row component ─────────────────────────────────────────────────────────────

interface PlatformRowProps {
  platform: ContactPlatform;
  index: number;
  total: number;
  onChange: (updated: ContactPlatform) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggle: () => void;
  toggling: boolean;
}

function PlatformRow({
  platform,
  index,
  total,
  onChange,
  onMoveUp,
  onMoveDown,
  onToggle,
  toggling,
}: PlatformRowProps) {
  const def = getPlatformDef(platform.platformKey);

  return (
    <div
      className={`bg-card border rounded-xl p-4 transition-colors ${platform.isVisible ? "border-primary/20" : "border-border"}`}
      data-ocid={`admin.contact_manager.item.${index + 1}`}
    >
      <div className="flex items-start gap-3">
        {/* Platform icon + name */}
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {def.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-body font-semibold text-sm text-foreground">
              {def.name}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${platform.isVisible ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}
            >
              {platform.isVisible ? "Visible" : "Hidden"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">
                URL / Handle
              </span>
              <input
                className={fieldClass()}
                type="text"
                placeholder={def.placeholder}
                value={platform.url}
                onChange={(e) => onChange({ ...platform, url: e.target.value })}
                data-ocid={`admin.contact_manager.url_input.${index + 1}`}
              />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">
                Display Label (optional)
              </span>
              <input
                className={fieldClass()}
                type="text"
                placeholder={`e.g. Chat on ${def.name}`}
                value={platform.displayLabel ?? ""}
                onChange={(e) =>
                  onChange({
                    ...platform,
                    displayLabel: e.target.value || undefined,
                  })
                }
                data-ocid={`admin.contact_manager.label_input.${index + 1}`}
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-shrink-0 flex flex-col gap-1.5 items-center">
          <button
            type="button"
            onClick={onToggle}
            disabled={toggling}
            title={platform.isVisible ? "Hide from site" : "Show on site"}
            data-ocid={`admin.contact_manager.toggle.${index + 1}`}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              platform.isVisible
                ? "bg-primary/15 border-primary/40 text-primary hover:bg-primary/25"
                : "bg-muted border-border text-muted-foreground hover:bg-primary/10 hover:text-primary"
            }`}
          >
            {platform.isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
            {platform.isVisible ? "ON" : "OFF"}
          </button>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={index === 0}
              aria-label="Move up"
              data-ocid={`admin.contact_manager.move_up.${index + 1}`}
              className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              <ArrowUp size={12} />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={index === total - 1}
              aria-label="Move down"
              data-ocid={`admin.contact_manager.move_down.${index + 1}`}
              className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              <ArrowDown size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Export ──────────────────────────────────────────────────────────────

export function AdminContactManager() {
  const { actor, isFetching } = useActor(createActor);
  const enabled = !!actor && !isFetching;
  const queryClient = useQueryClient();
  const [platforms, setPlatforms] = useState<ContactPlatform[]>([]);
  const [dirty, setDirty] = useState(false);

  const { data: remote, isLoading } = useQuery<ContactPlatform[]>({
    queryKey: ["admin", "contactPlatforms"],
    queryFn: () => actor!.adminGetAllContactPlatforms(),
    enabled,
  });

  useEffect(() => {
    if (remote !== undefined) {
      // Trust backend data completely — do NOT rebuild blank defaults.
      // Backend already stores all 17 platforms with their saved state.
      // If backend returns an empty array it means no platforms are configured yet.
      setPlatforms(sortByOrder(remote));
      setDirty(false);
    }
  }, [remote]);

  const saveMut = useMutation({
    mutationFn: () =>
      actor!.adminSetContactPlatforms(
        platforms.map((p, i) => ({ ...p, order: BigInt(i) })),
      ),
    onSuccess: (result) => {
      if (result.__kind__ === "ok") {
        toast.success("Contact platforms saved successfully");
        queryClient.invalidateQueries({
          queryKey: ["admin", "contactPlatforms"],
        });
        queryClient.invalidateQueries({ queryKey: ["contactPlatforms"] });
        setDirty(false);
      } else {
        toast.error(`Save failed: ${result.err}`);
      }
    },
    onError: () => toast.error("Failed to save contact platforms"),
  });

  const toggleMut = useMutation({
    mutationFn: (id: string) =>
      actor!
        .adminTogglePlatformVisibility(id)
        .then((result) => ({ result, id })),
    onSuccess: ({ result, id }) => {
      if (result.__kind__ === "ok") {
        setPlatforms((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isVisible: result.ok } : p)),
        );
        queryClient.invalidateQueries({ queryKey: ["contactPlatforms"] });
      } else {
        toast.error("Toggle failed");
      }
    },
    onError: () => toast.error("Toggle failed"),
  });

  function updatePlatform(index: number, updated: ContactPlatform) {
    setPlatforms((prev) => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
    setDirty(true);
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setPlatforms((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
    setDirty(true);
  }

  function moveDown(index: number) {
    if (index === platforms.length - 1) return;
    setPlatforms((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
    setDirty(true);
  }

  const visibleCount = platforms.filter((p) => p.isVisible).length;

  return (
    <div data-ocid="admin.contact_manager.section">
      <div className="flex items-start justify-between gap-4 mb-6">
        <SectionHeader
          title="Contact Manager"
          subtitle="Control which contact channels appear on your site — toggle, reorder, and update URLs"
        />
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <Button
            onClick={() => saveMut.mutate()}
            disabled={saveMut.isPending || !dirty}
            className="gap-2 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            data-ocid="admin.contact_manager.save_button"
          >
            <Save size={13} />
            {saveMut.isPending
              ? "Saving…"
              : dirty
                ? "Save Changes"
                : "All Saved"}
          </Button>
          <span className="text-[10px] text-muted-foreground">
            {visibleCount} of {platforms.length} visible
          </span>
        </div>
      </div>

      {isLoading ? (
        <div
          className="space-y-3"
          data-ocid="admin.contact_manager.loading_state"
        >
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Quick filters */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-muted-foreground font-body">
              Filter:
            </span>
            <button
              type="button"
              className="text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/30 font-semibold"
              data-ocid="admin.contact_manager.filter.all"
            >
              All ({platforms.length})
            </button>
            <button
              type="button"
              className="text-xs px-2.5 py-1 rounded-lg bg-card text-muted-foreground border border-border hover:border-primary/30 hover:text-foreground transition-colors"
              data-ocid="admin.contact_manager.filter.visible"
            >
              Visible ({visibleCount})
            </button>
          </div>

          <div className="space-y-2.5">
            {platforms.map((platform, i) => (
              <PlatformRow
                key={platform.platformKey}
                platform={platform}
                index={i}
                total={platforms.length}
                onChange={(updated) => updatePlatform(i, updated)}
                onMoveUp={() => moveUp(i)}
                onMoveDown={() => moveDown(i)}
                onToggle={() => toggleMut.mutate(platform.id)}
                toggling={toggleMut.isPending}
              />
            ))}
          </div>

          {/* Bottom save bar */}
          {dirty && (
            <div
              className="sticky bottom-4 mt-6 bg-card border border-primary/30 rounded-xl px-4 py-3 flex items-center justify-between shadow-lg"
              data-ocid="admin.contact_manager.save_bar"
            >
              <span className="text-sm font-body text-foreground">
                You have unsaved changes
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (remote) {
                      setPlatforms(sortByOrder(remote));
                      setDirty(false);
                    }
                  }}
                  data-ocid="admin.contact_manager.discard_button"
                  className="text-xs"
                >
                  Discard
                </Button>
                <Button
                  size="sm"
                  onClick={() => saveMut.mutate()}
                  disabled={saveMut.isPending}
                  className="gap-1.5 text-xs bg-primary text-primary-foreground"
                  data-ocid="admin.contact_manager.save_button_bottom"
                >
                  <Save size={12} />
                  {saveMut.isPending ? "Saving…" : "Save All"}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
