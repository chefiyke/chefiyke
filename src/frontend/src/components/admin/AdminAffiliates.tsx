import { Button } from "@/components/ui/button";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Settings,
  Sliders,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type {
  AffiliateProfile,
  AffiliateStats,
  CommissionSettings,
} from "../../backend";
import { AffiliateStatus } from "../../backend";
import { SectionHeader, fieldClass, formatDate } from "./AdminShared";

// ─── Helpers ──────────────────────────────────────────────────────────────────

type AdminTab = "applications" | "active" | "commission";

function TabBtn({
  label,
  active,
  count,
  onClick,
  ocid,
}: {
  label: string;
  active: boolean;
  count?: number;
  onClick: () => void;
  ocid: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={ocid}
      className={[
        "relative flex items-center gap-2 px-4 py-2.5 rounded-lg font-body text-sm font-medium transition-colors duration-200 border",
        active
          ? "bg-primary/15 text-primary border-primary/30"
          : "bg-card text-muted-foreground border-border hover:text-foreground",
      ].join(" ")}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground font-mono text-[10px] font-bold">
          {count}
        </span>
      )}
    </button>
  );
}

function StatusBadge({ status }: { status: AffiliateStatus }) {
  const map: Record<AffiliateStatus, { label: string; cls: string }> = {
    [AffiliateStatus.pending]: {
      label: "Pending",
      cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    },
    [AffiliateStatus.approved]: {
      label: "Approved",
      cls: "bg-primary/10 text-primary border-primary/25",
    },
    [AffiliateStatus.rejected]: {
      label: "Rejected",
      cls: "bg-red-500/10 text-red-400 border-red-500/20",
    },
    [AffiliateStatus.disabled]: {
      label: "Disabled",
      cls: "bg-muted text-muted-foreground border-border",
    },
  };
  const { label, cls } = map[status] ?? map[AffiliateStatus.pending];
  return (
    <span
      className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${cls}`}
    >
      {label}
    </span>
  );
}

// ─── Reject Modal ─────────────────────────────────────────────────────────────

function RejectModal({
  affiliate,
  onConfirm,
  onClose,
  isPending,
}: {
  affiliate: AffiliateProfile;
  onConfirm: (reason: string) => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState("");
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      data-ocid="admin.affiliates.reject_dialog"
    >
      <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-elevated">
        <h3 className="font-display font-semibold text-base text-foreground mb-1">
          Reject Application
        </h3>
        <p className="font-body text-sm text-muted-foreground mb-4">
          Provide a rejection reason for{" "}
          <span className="text-foreground font-medium">{affiliate.name}</span>.
        </p>
        <textarea
          className={`${fieldClass()} min-h-[80px] resize-none`}
          placeholder="Reason for rejection…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          data-ocid="admin.affiliates.reject_reason_input"
        />
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-border"
            data-ocid="admin.affiliates.reject_cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim() || isPending}
            className="flex-1 bg-red-500/90 hover:bg-red-500 text-white border-0"
            data-ocid="admin.affiliates.reject_confirm_button"
          >
            {isPending ? "Rejecting…" : "Confirm Reject"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Adjust Commission Modal ──────────────────────────────────────────────────

function AdjustCommissionModal({
  affiliate,
  onConfirm,
  onClose,
  isPending,
}: {
  affiliate: AffiliateProfile;
  onConfirm: (amount: number, reason: string) => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      data-ocid="admin.affiliates.adjust_commission_dialog"
    >
      <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-elevated">
        <h3 className="font-display font-semibold text-base text-foreground mb-1">
          Adjust Commission
        </h3>
        <p className="font-body text-sm text-muted-foreground mb-4">
          Manually adjust commission for{" "}
          <span className="text-foreground font-medium">{affiliate.name}</span>.
          Use positive to add, negative to deduct.
        </p>
        <div className="space-y-3">
          <input
            type="number"
            step="0.01"
            className={fieldClass()}
            placeholder="Amount (e.g. 5.00 or -2.50)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            data-ocid="admin.affiliates.adjust_amount_input"
          />
          <input
            type="text"
            className={fieldClass()}
            placeholder="Reason for adjustment"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            data-ocid="admin.affiliates.adjust_reason_input"
          />
        </div>
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-border"
            data-ocid="admin.affiliates.adjust_cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(Number.parseFloat(amount), reason)}
            disabled={!amount || !reason.trim() || isPending}
            className="flex-1"
            data-ocid="admin.affiliates.adjust_confirm_button"
          >
            {isPending ? "Saving…" : "Apply Adjustment"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Applications Tab ─────────────────────────────────────────────────────────

function ApplicationsTab({
  affiliates,
  onApprove,
  onReject,
}: {
  affiliates: AffiliateProfile[];
  onApprove: (aff: AffiliateProfile) => void;
  onReject: (aff: AffiliateProfile) => void;
}) {
  const pending = affiliates.filter(
    (a) => a.status === AffiliateStatus.pending,
  );

  if (pending.length === 0) {
    return (
      <div
        className="text-center py-16 bg-card border border-border rounded-xl"
        data-ocid="admin.affiliates.applications.empty_state"
      >
        <CheckCircle2 size={32} className="mx-auto text-primary mb-3" />
        <p className="font-display font-semibold text-foreground mb-1">
          No Pending Applications
        </p>
        <p className="font-body text-sm text-muted-foreground">
          All affiliate applications have been reviewed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-ocid="admin.affiliates.applications_list">
      {pending.map((aff, i) => (
        <div
          key={aff.inviteCode}
          className="bg-card border border-border rounded-xl p-5"
          data-ocid={`admin.affiliates.application.item.${i + 1}`}
        >
          <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
            <div>
              <p className="font-display font-semibold text-foreground">
                {aff.name}
              </p>
              <p className="font-body text-xs text-muted-foreground mt-0.5">
                {aff.email}
              </p>
              <p className="font-body text-xs text-muted-foreground mt-0.5">
                Applied {formatDate(aff.joinedAt)}
              </p>
            </div>
            <StatusBadge status={aff.status} />
          </div>
          {aff.rejectionReason && (
            <p className="font-body text-xs text-muted-foreground mb-3 italic">
              {aff.rejectionReason}
            </p>
          )}
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              onClick={() => onApprove(aff)}
              className="gap-1.5 font-body font-semibold"
              data-ocid={`admin.affiliates.approve_button.${i + 1}`}
            >
              <CheckCircle2 size={14} />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReject(aff)}
              className="gap-1.5 font-body border-red-500/30 text-red-400 hover:bg-red-500/10"
              data-ocid={`admin.affiliates.reject_button.${i + 1}`}
            >
              <XCircle size={14} />
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Active Affiliate Row ─────────────────────────────────────────────────────

function ActiveAffiliateRow({
  aff,
  index,
  stats,
  onDisable,
  onAdjust,
}: {
  aff: AffiliateProfile;
  index: number;
  stats: AffiliateStats | undefined;
  onDisable: (aff: AffiliateProfile) => void;
  onAdjust: (aff: AffiliateProfile) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="bg-card border border-border rounded-xl overflow-hidden"
      data-ocid={`admin.affiliates.active.item.${index + 1}`}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 p-4 hover:bg-muted/20 transition-colors duration-200"
        data-ocid={`admin.affiliates.active.expand.${index + 1}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <span className="font-display font-bold text-xs text-primary">
              {aff.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 text-left">
            <p className="font-display font-semibold text-sm text-foreground truncate">
              {aff.name}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              #{aff.inviteCode}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge status={aff.status} />
          <ChevronDown
            size={14}
            className={`text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border p-4 space-y-4">
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: "Clicks",
                value: stats ? Number(stats.totalClicks) : "—",
              },
              { label: "Leads", value: stats ? Number(stats.totalLeads) : "—" },
              {
                label: "Conversions",
                value: stats ? Number(stats.totalConversions) : "—",
              },
              {
                label: "Commission",
                value: stats
                  ? `$${stats.totalCommissionEarned.toFixed(2)}`
                  : "—",
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-background rounded-lg p-3 border border-border"
              >
                <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  {label}
                </p>
                <p className="font-display font-bold text-lg text-foreground">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {stats && (
            <div className="flex items-center justify-between bg-background border border-border rounded-lg px-4 py-2">
              <span className="font-body text-xs text-muted-foreground">
                Pending Payout
              </span>
              <span className="font-display font-semibold text-sm text-primary">
                ${stats.pendingPayout.toFixed(2)}
              </span>
            </div>
          )}

          <p className="font-body text-xs text-muted-foreground">
            Email: <span className="text-foreground">{aff.email}</span> · Joined{" "}
            {formatDate(aff.joinedAt)}
          </p>

          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAdjust(aff)}
              className="gap-1.5 font-body border-primary/30 text-primary hover:bg-primary/10"
              data-ocid={`admin.affiliates.adjust_button.${index + 1}`}
            >
              <Sliders size={13} />
              Adjust Commission
            </Button>
            {aff.status !== AffiliateStatus.disabled && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDisable(aff)}
                className="gap-1.5 font-body border-red-500/30 text-red-400 hover:bg-red-500/10"
                data-ocid={`admin.affiliates.disable_button.${index + 1}`}
              >
                <AlertCircle size={13} />
                Disable
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Active Tab ───────────────────────────────────────────────────────────────

function ActiveTab({
  affiliates,
  onDisable,
  onAdjust,
}: {
  affiliates: AffiliateProfile[];
  onDisable: (aff: AffiliateProfile) => void;
  onAdjust: (aff: AffiliateProfile) => void;
}) {
  const { actor, isFetching } = useActor(createActor);
  const active = affiliates.filter(
    (a) =>
      a.status === AffiliateStatus.approved ||
      a.status === AffiliateStatus.disabled,
  );

  const { data: statsMap } = useQuery<Record<string, AffiliateStats>>({
    queryKey: [
      "admin",
      "affiliateStats",
      active.map((a) => a.inviteCode).join(","),
    ],
    queryFn: async () => {
      if (!actor) return {};
      const results = await Promise.all(
        active.map(async (a) => {
          try {
            const stats = await actor.adminGetAffiliateStats(a.inviteCode);
            return [a.inviteCode, stats] as [string, AffiliateStats];
          } catch {
            return null;
          }
        }),
      );
      return Object.fromEntries(
        results.filter(Boolean) as [string, AffiliateStats][],
      );
    },
    enabled: !!actor && !isFetching && active.length > 0,
    staleTime: 2 * 60 * 1000,
  });

  if (active.length === 0) {
    return (
      <div
        className="text-center py-16 bg-card border border-border rounded-xl"
        data-ocid="admin.affiliates.active.empty_state"
      >
        <Users size={32} className="mx-auto text-muted-foreground mb-3" />
        <p className="font-display font-semibold text-foreground mb-1">
          No Active Affiliates
        </p>
        <p className="font-body text-sm text-muted-foreground">
          Approve applications to see affiliates here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-ocid="admin.affiliates.active_list">
      {active.map((aff, i) => (
        <ActiveAffiliateRow
          key={aff.inviteCode}
          aff={aff}
          index={i}
          stats={statsMap?.[aff.inviteCode]}
          onDisable={onDisable}
          onAdjust={onAdjust}
        />
      ))}
    </div>
  );
}

// ─── Commission Settings Tab ──────────────────────────────────────────────────

function CommissionTab() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  const [rate, setRate] = useState("");
  const [saved, setSaved] = useState(false);

  const { mutate: saveCommission, isPending } = useMutation({
    mutationFn: async () => {
      if (!actor) return;
      const settings: CommissionSettings = {
        defaultRate: Number.parseFloat(rate) / 100,
        overrideRates: [],
      };
      const result = await actor.adminSetCommission(settings);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "affiliates"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      toast.success("Commission rate updated");
    },
    onError: () => toast.error("Failed to update commission rate"),
  });

  return (
    <div
      className="bg-card border border-border rounded-xl p-6"
      data-ocid="admin.affiliates.commission_settings"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
          <Settings size={16} className="text-primary" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-base text-foreground">
            Global Commission Rate
          </h3>
          <p className="font-body text-xs text-muted-foreground">
            Default rate applied to all affiliates
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="commission_rate_input"
            className="font-body text-xs text-muted-foreground mb-1.5 block"
          >
            Commission Percentage (%)
          </label>
          <div className="flex items-center gap-2">
            <input
              id="commission_rate_input"
              type="number"
              min="0"
              max="100"
              step="0.1"
              className={`${fieldClass()} max-w-[140px]`}
              placeholder="e.g. 10"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              data-ocid="admin.affiliates.commission_rate_input"
            />
            <span className="font-body text-sm text-muted-foreground">%</span>
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg px-4 py-3">
          <p className="font-body text-xs text-muted-foreground leading-relaxed">
            <span className="text-primary font-medium">Note:</span> This sets
            the global default rate. Individual affiliate rates can be adjusted
            using the "Adjust Commission" button in the Active Affiliates tab.
            Per-affiliate overrides take priority over this default.
          </p>
        </div>

        <Button
          onClick={() => saveCommission()}
          disabled={!rate || isPending}
          className="w-full sm:w-auto gap-2 font-body font-semibold"
          data-ocid="admin.affiliates.commission_save_button"
        >
          {saved ? (
            <>
              <CheckCircle2 size={15} /> Saved
            </>
          ) : isPending ? (
            "Saving…"
          ) : (
            "Save Commission Rate"
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminAffiliates() {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const enabled = !!actor && !isFetching;
  const [activeTab, setActiveTab] = useState<AdminTab>("applications");
  const [rejectTarget, setRejectTarget] = useState<AffiliateProfile | null>(
    null,
  );
  const [adjustTarget, setAdjustTarget] = useState<AffiliateProfile | null>(
    null,
  );

  const { data: affiliates = [], isLoading } = useQuery<AffiliateProfile[]>({
    queryKey: ["admin", "affiliates"],
    queryFn: () => actor!.adminGetAffiliates(),
    enabled,
  });

  const pendingCount = affiliates.filter(
    (a) => a.status === AffiliateStatus.pending,
  ).length;

  // ─── Approve ───────────────────────────────────────────────────────────────

  const { mutate: approve } = useMutation({
    mutationFn: async (aff: AffiliateProfile) => {
      if (!actor) return;
      const result = await actor.adminApproveAffiliate(aff.principal);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "affiliates"] });
      toast.success("Affiliate approved");
    },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  });

  // ─── Reject ────────────────────────────────────────────────────────────────

  const { mutate: reject, isPending: rejecting } = useMutation({
    mutationFn: async ({
      aff,
      reason,
    }: { aff: AffiliateProfile; reason: string }) => {
      if (!actor) return;
      const result = await actor.adminRejectAffiliate(aff.principal, reason);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "affiliates"] });
      setRejectTarget(null);
      toast.success("Affiliate rejected");
    },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  });

  // ─── Disable ───────────────────────────────────────────────────────────────

  const { mutate: disable } = useMutation({
    mutationFn: async (aff: AffiliateProfile) => {
      if (!actor) return;
      const result = await actor.adminDisableAffiliate(aff.principal);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "affiliates"] });
      toast.success("Affiliate disabled");
    },
    onError: () => toast.error("Failed to disable affiliate"),
  });

  // ─── Adjust Commission ─────────────────────────────────────────────────────

  const { mutate: adjustCommission, isPending: adjusting } = useMutation({
    mutationFn: async ({
      aff,
      amount,
      reason,
    }: {
      aff: AffiliateProfile;
      amount: number;
      reason: string;
    }) => {
      if (!actor) return;
      const result = await actor.adminAdjustCommission(
        aff.inviteCode,
        amount,
        reason,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "affiliateStats"] });
      setAdjustTarget(null);
      toast.success("Commission adjusted");
    },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  });

  return (
    <div data-ocid="admin.affiliates.section">
      <SectionHeader
        title="Affiliates"
        subtitle="Manage affiliate applications, active partners, and commission settings"
      />

      {/* Tab switcher */}
      <div className="flex gap-2 flex-wrap mb-6">
        <TabBtn
          label="Applications"
          active={activeTab === "applications"}
          count={pendingCount}
          onClick={() => setActiveTab("applications")}
          ocid="admin.affiliates.tab.applications"
        />
        <TabBtn
          label="Active Affiliates"
          active={activeTab === "active"}
          onClick={() => setActiveTab("active")}
          ocid="admin.affiliates.tab.active"
        />
        <TabBtn
          label="Commission Settings"
          active={activeTab === "commission"}
          onClick={() => setActiveTab("commission")}
          ocid="admin.affiliates.tab.commission"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="admin.affiliates.loading_state">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-card border border-border rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          {activeTab === "applications" && (
            <ApplicationsTab
              affiliates={affiliates}
              onApprove={approve}
              onReject={(aff) => setRejectTarget(aff)}
            />
          )}
          {activeTab === "active" && (
            <ActiveTab
              affiliates={affiliates}
              onDisable={disable}
              onAdjust={(aff) => setAdjustTarget(aff)}
            />
          )}
          {activeTab === "commission" && <CommissionTab />}
        </>
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <RejectModal
          affiliate={rejectTarget}
          isPending={rejecting}
          onClose={() => setRejectTarget(null)}
          onConfirm={(reason) => reject({ aff: rejectTarget, reason })}
        />
      )}

      {/* Adjust commission modal */}
      {adjustTarget && (
        <AdjustCommissionModal
          affiliate={adjustTarget}
          isPending={adjusting}
          onClose={() => setAdjustTarget(null)}
          onConfirm={(amount, reason) =>
            adjustCommission({ aff: adjustTarget, amount, reason })
          }
        />
      )}
    </div>
  );
}
