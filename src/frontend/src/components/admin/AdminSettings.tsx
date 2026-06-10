import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { Info, Monitor } from "lucide-react";
import { createActor } from "../../backend";
import { AdminLegalPages } from "./AdminLegalPages";
import { SectionHeader } from "./AdminShared";

// Safely fetch version info — returns null if backend method is missing
async function safeGetVersionInfo(
  actor: Record<string, unknown>,
): Promise<Record<string, string> | null> {
  const fn = actor.getVersionInfo;
  if (typeof fn !== "function") return null;
  try {
    const result = await (fn as () => Promise<unknown>).call(actor);
    if (result && typeof result === "object") {
      return result as Record<string, string>;
    }
  } catch {
    // method not yet available
  }
  return null;
}

function SystemInfo() {
  const { actor, isFetching } = useActor(createActor);
  const enabled = !!actor && !isFetching;

  const { data: versionInfo, isLoading } = useQuery({
    queryKey: ["admin", "versionInfo"],
    queryFn: async () => {
      if (!actor) return null;
      return safeGetVersionInfo(actor as unknown as Record<string, unknown>);
    },
    enabled,
    staleTime: 60_000,
  });

  const rows: { label: string; key: string }[] = [
    { label: "System Version", key: "systemVersion" },
    { label: "Build Version", key: "buildVersion" },
    { label: "Last Deployed", key: "lastDeployedAt" },
    { label: "Environment", key: "environment" },
  ];

  return (
    <div
      className="bg-card border border-border rounded-xl p-5"
      data-ocid="admin.settings.system_info"
    >
      <div className="flex items-center gap-2 mb-4">
        <Monitor size={16} className="text-primary" />
        <h3 className="font-display font-semibold text-base text-foreground">
          About this System
        </h3>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-8 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map(({ label, key }) => {
            const val = versionInfo?.[key];
            return (
              <div
                key={key}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <span className="font-body text-xs text-muted-foreground">
                  {label}
                </span>
                <span className="font-mono text-xs text-foreground font-semibold">
                  {val ?? "Version unavailable"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && !versionInfo && (
        <div className="flex items-start gap-2 mt-3 p-3 bg-muted/30 rounded-lg">
          <Info size={13} className="text-muted-foreground mt-0.5 shrink-0" />
          <p className="font-body text-xs text-muted-foreground">
            Version information is not available. Redeploy with version endpoint
            support to enable this.
          </p>
        </div>
      )}
    </div>
  );
}

export function AdminSettings() {
  return (
    <div data-ocid="admin.settings.section">
      <SectionHeader
        title="Settings"
        subtitle="Manage legal pages and view system information."
      />

      {/* System Info */}
      <div className="mb-8">
        <SystemInfo />
      </div>

      {/* Divider */}
      <div className="border-t border-border mb-8" />

      {/* Legal Pages */}
      <AdminLegalPages />
    </div>
  );
}
