import { Button } from "@/components/ui/button";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Shield, ShieldOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type { AuditLog, BlockEntry, SecurityPolicy } from "../../backend.d";
import { useRole } from "../../hooks/useRole";
import { FormCard, SectionHeader, fieldClass } from "./AdminShared";

function formatTs(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleString();
}

// ─── Audit Log Section ────────────────────────────────────────────────────────

function AuditLogSection() {
  const { actor, isFetching } = useActor(createActor);
  const enabled = !!actor && !isFetching;

  const { data: logs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ["admin", "audit-logs"],
    queryFn: () => actor!.adminListAuditLogs(BigInt(50)),
    enabled,
    staleTime: 30_000,
  });

  const ACTION_STYLES: Record<string, string> = {
    Login: "bg-blue-400/15 text-blue-400",
    Logout: "bg-muted text-muted-foreground",
    Create: "bg-green-400/15 text-green-400",
    Update: "bg-yellow-400/15 text-yellow-400",
    Delete: "bg-destructive/15 text-destructive",
    Approve: "bg-green-400/15 text-green-400",
    Reject: "bg-destructive/15 text-destructive",
    AccessDenied: "bg-destructive/20 text-destructive font-semibold",
  };

  return (
    <div className="mt-8" data-ocid="admin.security.audit_section">
      <h3 className="font-display font-semibold text-base text-foreground mb-1">
        Audit Log
      </h3>
      <p className="font-body text-xs text-muted-foreground mb-4">
        Last 50 admin actions across the platform
      </p>

      {isLoading ? (
        <p
          className="font-body text-sm text-muted-foreground"
          data-ocid="admin.security.audit.loading_state"
        >
          Loading audit log…
        </p>
      ) : logs.length === 0 ? (
        <div
          className="bg-card border border-border rounded-xl p-8 text-center"
          data-ocid="admin.security.audit.empty_state"
        >
          <Shield size={24} className="mx-auto text-muted-foreground mb-2" />
          <p className="font-body text-sm text-muted-foreground">
            No audit entries yet.
          </p>
        </div>
      ) : (
        <div
          className="bg-card border border-border rounded-xl overflow-hidden"
          data-ocid="admin.security.audit.table"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Time", "User", "Action", "Resource", "Details"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 font-body text-xs text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr
                    key={String(log.logId)}
                    className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                    data-ocid={`admin.security.audit.item.${i + 1}`}
                  >
                    <td className="px-4 py-2.5 font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatTs(log.timestamp)}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[10px] text-muted-foreground truncate max-w-[100px]">
                      {String(log.userId).slice(0, 12)}…
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-body font-medium ${
                          ACTION_STYLES[log.action as unknown as string] ??
                          "bg-muted text-muted-foreground"
                        }`}
                      >
                        {log.action as unknown as string}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-body text-xs text-foreground truncate max-w-[120px]">
                      {log.resource}
                    </td>
                    <td className="px-4 py-2.5 font-body text-xs text-muted-foreground truncate max-w-[180px]">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Security Policy Section ──────────────────────────────────────────────────

function SecurityPolicySection() {
  const { actor, isFetching } = useActor(createActor);
  const enabled = !!actor && !isFetching;
  const qc = useQueryClient();

  const { data: policy } = useQuery<SecurityPolicy>({
    queryKey: ["admin", "security-policy"],
    queryFn: () => actor!.adminGetSecurityPolicy(),
    enabled,
  });

  const [form, setForm] = useState({
    maxLoginAttempts: "5",
    lockoutDurationMins: "15",
    sessionTimeoutMins: "60",
    rateLimitPerMin: "30",
    rateLimitPublicPerMin: "10",
  });

  useEffect(() => {
    if (policy) {
      setForm({
        maxLoginAttempts: String(policy.maxLoginAttempts),
        lockoutDurationMins: String(policy.lockoutDurationMins),
        sessionTimeoutMins: String(policy.sessionTimeoutMins),
        rateLimitPerMin: String(policy.rateLimitPerMin),
        rateLimitPublicPerMin: String(policy.rateLimitPublicPerMin),
      });
    }
  }, [policy]);

  const { mutate: savePolicy, isPending } = useMutation({
    mutationFn: async () => {
      if (!actor) return;
      const payload: SecurityPolicy = {
        maxLoginAttempts: BigInt(Number(form.maxLoginAttempts)),
        lockoutDurationMins: BigInt(Number(form.lockoutDurationMins)),
        sessionTimeoutMins: BigInt(Number(form.sessionTimeoutMins)),
        rateLimitPerMin: BigInt(Number(form.rateLimitPerMin)),
        rateLimitPublicPerMin: BigInt(Number(form.rateLimitPublicPerMin)),
      };
      const res = await actor.adminSetSecurityPolicy(payload);
      if (res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "security-policy"] });
      toast.success("Security policy saved");
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Failed to save policy"),
  });

  const FIELDS: { key: keyof typeof form; label: string; hint: string }[] = [
    {
      key: "maxLoginAttempts",
      label: "Max Login Attempts",
      hint: "Before lockout",
    },
    {
      key: "lockoutDurationMins",
      label: "Lockout Duration (mins)",
      hint: "Time locked after max attempts",
    },
    {
      key: "sessionTimeoutMins",
      label: "Session Timeout (mins)",
      hint: "Inactive session expiry",
    },
    {
      key: "rateLimitPerMin",
      label: "Rate Limit / Min (admin)",
      hint: "Requests per minute for authenticated users",
    },
    {
      key: "rateLimitPublicPerMin",
      label: "Rate Limit / Min (public)",
      hint: "Requests per minute for unauthenticated users",
    },
  ];

  return (
    <div className="mt-8" data-ocid="admin.security.policy_section">
      <FormCard title="Security Policy">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FIELDS.map(({ key, label, hint }) => (
            <div key={key}>
              <label
                htmlFor={`policy-${key}`}
                className="font-body text-xs text-muted-foreground block mb-1"
              >
                {label}
                {hint && (
                  <span className="ml-1 text-muted-foreground/60">
                    ({hint})
                  </span>
                )}
              </label>
              <input
                id={`policy-${key}`}
                type="number"
                min="1"
                className={fieldClass()}
                value={form[key]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.value }))
                }
                data-ocid={`admin.security.policy.${key}_input`}
              />
            </div>
          ))}
        </div>
        <Button
          type="button"
          disabled={isPending}
          onClick={() => savePolicy()}
          className="mt-5 w-full"
          data-ocid="admin.security.policy.save_button"
        >
          {isPending ? "Saving…" : "Save Policy"}
        </Button>
      </FormCard>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminSecurity() {
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  const enabled = !!actor && !isFetching;
  const { isOwner } = useRole();

  const { data: blockedKeys = [], isLoading } = useQuery<BlockEntry[]>({
    queryKey: ["admin", "blocked-keys"],
    queryFn: () => actor!.adminGetBlockedKeys(),
    enabled,
  });

  const [form, setForm] = useState({ key: "", reason: "" });

  const { mutate: blockKey, isPending } = useMutation({
    mutationFn: async () => {
      if (!actor) return;
      await actor.adminBlockKey(form.key, form.reason);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "blocked-keys"] });
      setForm({ key: "", reason: "" });
      toast.success("Key blocked");
    },
    onError: () => toast.error("Failed to block key"),
  });

  const { mutate: unblockKey } = useMutation({
    mutationFn: (key: string) => actor!.adminUnblockKey(key),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "blocked-keys"] });
      toast.success("Key unblocked");
    },
    onError: () => toast.error("Failed to unblock"),
  });

  return (
    <div data-ocid="admin.security.section">
      <SectionHeader
        title="Security"
        subtitle="Firewall, audit trail, and security policy"
      />

      {/* ── Firewall ── */}
      <FormCard title="Block a Key">
        <div className="space-y-3">
          <div>
            <label
              htmlFor="sec-key"
              className="font-body text-xs text-muted-foreground block mb-1"
            >
              Key (IP, principal, or fingerprint)
            </label>
            <input
              id="sec-key"
              type="text"
              className={fieldClass()}
              placeholder="e.g. 192.168.1.1"
              value={form.key}
              onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
              data-ocid="admin.security.key_input"
            />
          </div>
          <div>
            <label
              htmlFor="sec-reason"
              className="font-body text-xs text-muted-foreground block mb-1"
            >
              Reason
            </label>
            <input
              id="sec-reason"
              type="text"
              className={fieldClass()}
              placeholder="Why are you blocking this?"
              value={form.reason}
              onChange={(e) =>
                setForm((f) => ({ ...f, reason: e.target.value }))
              }
              data-ocid="admin.security.reason_input"
            />
          </div>
          <Button
            type="button"
            disabled={isPending || !form.key || !form.reason}
            onClick={() => blockKey()}
            className="w-full gap-2"
            data-ocid="admin.security.block_button"
          >
            <Plus size={15} /> {isPending ? "Blocking…" : "Block Key"}
          </Button>
        </div>
      </FormCard>

      <div className="space-y-2 mb-6">
        {isLoading ? (
          <p className="font-body text-sm text-muted-foreground">Loading…</p>
        ) : blockedKeys.length === 0 ? (
          <div
            className="bg-card border border-border rounded-xl p-8 text-center"
            data-ocid="admin.security.empty_state"
          >
            <Shield size={28} className="mx-auto text-muted-foreground mb-2" />
            <p className="font-body text-sm text-muted-foreground">
              No blocked keys. Good — no threats detected.
            </p>
          </div>
        ) : (
          blockedKeys.map((entry, i) => (
            <div
              key={entry.key}
              className="bg-card border border-border rounded-xl p-4 flex items-start justify-between gap-3"
              data-ocid={`admin.security.item.${i + 1}`}
            >
              <div className="min-w-0">
                <p className="font-mono text-xs text-destructive truncate">
                  {entry.key}
                </p>
                <p className="font-body text-xs text-muted-foreground mt-0.5">
                  {entry.reason}
                </p>
                <p className="font-body text-xs text-muted-foreground mt-0.5">
                  Blocked:{" "}
                  {new Date(
                    Number(entry.blockedAt) / 1_000_000,
                  ).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => unblockKey(entry.key)}
                className="shrink-0 flex items-center gap-1 font-body text-xs text-muted-foreground hover:text-primary transition-colors"
                data-ocid={`admin.security.unblock.${i + 1}`}
              >
                <ShieldOff size={13} />
                Unblock
              </button>
            </div>
          ))
        )}
      </div>

      {/* ── Owner-only sections ── */}
      {isOwner && (
        <>
          <AuditLogSection />
          <SecurityPolicySection />
        </>
      )}
    </div>
  );
}
