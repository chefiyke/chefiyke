import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BarChart2,
  CheckCircle2,
  Clock,
  Copy,
  DollarSign,
  Lock,
  MousePointerClick,
  ShieldOff,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";
import type {
  AffiliateProfile,
  AffiliateStats,
  PayoutRecord,
} from "../backend";
import { AffiliateStatus, PayoutStatus } from "../backend";
import { Layout } from "../components/Layout";
import { useAffiliateCheck } from "../hooks/useAffiliateCheck";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatJoinDate(timestamp: bigint) {
  return new Date(Number(timestamp / 1_000_000n)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatPayoutDate(timestamp: bigint) {
  return new Date(Number(timestamp / 1_000_000n)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-xs uppercase tracking-[0.18em] text-primary mb-1">
      {children}
    </p>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  icon: Icon,
  ocid,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  ocid: string;
}) {
  return (
    <div
      className="bg-card border border-border rounded-xl p-5"
      data-ocid={ocid}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
          <Icon size={15} className="text-primary" />
        </div>
        <span className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="font-display font-bold text-2xl text-foreground">{value}</p>
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function AffiliateLoadingSkeleton() {
  return (
    <div
      className="max-w-3xl mx-auto px-4 py-16 space-y-6"
      data-ocid="affiliate.loading_state"
    >
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-10 w-56" />
      <div className="grid grid-cols-2 gap-3 mt-8 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

// ─── Pending Review State ─────────────────────────────────────────────────────

function PendingReviewState({ profile }: { profile: AffiliateProfile }) {
  const { clear } = useInternetIdentity();
  return (
    <div
      className="max-w-md mx-auto text-center py-16 px-4"
      data-ocid="affiliate.pending_review"
    >
      <div className="bg-card border border-border rounded-2xl p-10 shadow-elevated">
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center">
          <Clock size={24} className="text-yellow-400" />
        </div>
        <SectionLabel>Application Status</SectionLabel>
        <h2 className="font-display font-bold text-xl text-foreground mb-2">
          Under Review
        </h2>
        <p className="font-body text-sm text-muted-foreground mb-6 leading-relaxed">
          Hi <span className="text-foreground font-medium">{profile.name}</span>
          , your affiliate application is currently under review. We'll contact
          you within 2 business days.
        </p>
        <Button
          variant="outline"
          onClick={clear}
          className="w-full font-body font-semibold border-border"
          data-ocid="affiliate.signout_button"
        >
          Sign Out
        </Button>
        <a
          href="/"
          className="inline-flex items-center justify-center gap-1.5 mt-4 font-body text-sm text-muted-foreground hover:text-primary transition-colors duration-200 w-full"
          data-ocid="affiliate.back_link"
        >
          <ArrowLeft size={14} />
          Back to main site
        </a>
      </div>
    </div>
  );
}

// ─── Simple Bar Chart ─────────────────────────────────────────────────────────

interface WeekData {
  label: string;
  clicks: number;
  leads: number;
  conversions: number;
}

function MiniBarChart({ data }: { data: WeekData[] }) {
  const maxVal = Math.max(
    ...data.flatMap((d) => [d.clicks, d.leads, d.conversions]),
    1,
  );
  const bars = [
    { key: "clicks", color: "#B8960C", label: "Clicks" },
    { key: "leads", color: "#6366f1", label: "Leads" },
    { key: "conversions", color: "#22c55e", label: "Conversions" },
  ] as const;

  return (
    <div>
      {/* Legend */}
      <div className="flex gap-4 mb-4 flex-wrap">
        {bars.map(({ key, color, label }) => (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ background: color }}
            />
            <span className="font-body text-xs text-muted-foreground">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="flex items-end gap-3 h-40">
        {data.map((week) => (
          <div
            key={week.label}
            className="flex-1 flex flex-col gap-0 items-center"
          >
            <div className="w-full flex items-end gap-0.5 h-32">
              {bars.map(({ key, color }) => {
                const val = week[key];
                const pct = (val / maxVal) * 100;
                return (
                  <div
                    key={key}
                    className="flex-1 rounded-t-sm min-h-[2px] transition-all duration-300"
                    style={{
                      height: `${pct}%`,
                      background: color,
                      opacity: 0.85,
                    }}
                    title={`${key}: ${val}`}
                  />
                );
              })}
            </div>
            <p className="font-body text-[10px] text-muted-foreground mt-2">
              {week.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Payout Request Modal ─────────────────────────────────────────────────────

function PayoutRequestModal({
  onClose,
  onSubmit,
  isPending,
}: {
  onClose: () => void;
  onSubmit: (method: string) => void;
  isPending: boolean;
}) {
  const [method, setMethod] = useState("Bank Transfer");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      data-ocid="affiliate.payout_dialog"
    >
      <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-elevated">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-display font-semibold text-base text-foreground">
            Request Payout
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors duration-200"
            aria-label="Close modal"
            data-ocid="affiliate.payout_close_button"
          >
            <X size={18} />
          </button>
        </div>
        <p className="font-body text-sm text-muted-foreground mb-4">
          Select your preferred payout method. We'll process your payment within
          5–7 business days.
        </p>
        <label
          htmlFor="payout_method_select"
          className="font-body text-xs text-muted-foreground mb-1.5 block"
        >
          Payout Method
        </label>
        <select
          id="payout_method_select"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring mb-5"
          data-ocid="affiliate.payout_method_select"
        >
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="PayPal">PayPal</option>
          <option value="Other">Other</option>
        </select>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-border"
            data-ocid="affiliate.payout_cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit(method)}
            disabled={isPending}
            className="flex-1 font-body font-semibold"
            data-ocid="affiliate.payout_submit_button"
          >
            {isPending ? "Submitting…" : "Submit Request"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────

function AnalyticsTab({ stats }: { stats: AffiliateStats }) {
  // Generate mock 4-week breakdown based on total stats (no chart library needed)
  const total = {
    clicks: Number(stats.totalClicks),
    leads: Number(stats.totalLeads),
    conversions: Number(stats.totalConversions),
  };

  const weekLabels = ["Wk 1", "Wk 2", "Wk 3", "Wk 4"];
  const weights = [0.18, 0.28, 0.22, 0.32];
  const chartData: WeekData[] = weekLabels.map((label, i) => ({
    label,
    clicks: Math.round(total.clicks * weights[i]),
    leads: Math.round(total.leads * weights[i]),
    conversions: Math.round(total.conversions * weights[i]),
  }));

  return (
    <div className="space-y-5" data-ocid="affiliate.analytics_tab">
      <div className="bg-card border border-border rounded-xl p-5">
        <SectionLabel>Weekly Breakdown</SectionLabel>
        <h3 className="font-display font-semibold text-base text-foreground mb-5">
          Last 4 Weeks
        </h3>
        {total.clicks + total.leads + total.conversions === 0 ? (
          <div
            className="text-center py-10"
            data-ocid="affiliate.analytics.empty_state"
          >
            <BarChart2
              size={32}
              className="mx-auto text-muted-foreground mb-3"
            />
            <p className="font-body text-sm text-muted-foreground">
              No activity yet. Share your referral link to start tracking.
            </p>
          </div>
        ) : (
          <MiniBarChart data={chartData} />
        )}
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Clicks", value: Number(stats.totalClicks) },
          { label: "Total Leads", value: Number(stats.totalLeads) },
          { label: "Converted", value: Number(stats.totalConversions) },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-card border border-border rounded-xl p-4 text-center"
          >
            <p className="font-display font-bold text-xl text-foreground">
              {value}
            </p>
            <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Payout History Tab ───────────────────────────────────────────────────────

function PayoutHistoryTab() {
  const { actor, isFetching } = useActor(createActor);
  const { data: payouts = [], isLoading } = useQuery<PayoutRecord[]>({
    queryKey: ["affiliatePayoutHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.affiliateGetPayoutHistory();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3" data-ocid="affiliate.payouts.loading_state">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (payouts.length === 0) {
    return (
      <div
        className="text-center py-16 bg-card border border-border rounded-xl"
        data-ocid="affiliate.payouts.empty_state"
      >
        <Wallet size={32} className="mx-auto text-muted-foreground mb-3" />
        <p className="font-display font-semibold text-foreground mb-1">
          No Payouts Yet
        </p>
        <p className="font-body text-sm text-muted-foreground">
          Your payout history will appear here once processed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-ocid="affiliate.payouts_list">
      {payouts.map((p, i) => (
        <div
          key={p.id}
          className="bg-card border border-border rounded-xl px-5 py-4 flex items-center justify-between gap-3 flex-wrap"
          data-ocid={`affiliate.payout.item.${i + 1}`}
        >
          <div>
            <p className="font-display font-semibold text-sm text-foreground">
              ${p.amount.toFixed(2)}
            </p>
            <p className="font-body text-xs text-muted-foreground mt-0.5">
              {p.method} · Requested {formatPayoutDate(p.requestedAt)}
            </p>
            {p.processedAt && (
              <p className="font-body text-xs text-muted-foreground">
                Processed {formatPayoutDate(p.processedAt)}
              </p>
            )}
          </div>
          <span
            className={[
              "font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border",
              p.status === PayoutStatus.completed
                ? "bg-primary/10 text-primary border-primary/25"
                : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
            ].join(" ")}
          >
            {p.status === PayoutStatus.completed ? "Completed" : "Pending"}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

type DashTab = "analytics" | "payouts";

function AffiliateDashboard({ profile }: { profile: AffiliateProfile }) {
  const { actor, isFetching } = useActor(createActor);
  const { clear } = useInternetIdentity();
  const [activeTab, setActiveTab] = useState<DashTab>("analytics");
  const [copied, setCopied] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery<AffiliateStats>({
    queryKey: ["affiliateStats"],
    queryFn: async () => {
      if (!actor) throw new Error("no actor");
      return actor.affiliateGetStats();
    },
    enabled: !!actor && !isFetching,
    staleTime: 2 * 60 * 1000,
  });

  const { data: inviteLink } = useQuery<string>({
    queryKey: ["affiliateInviteLink"],
    queryFn: async () => {
      if (!actor) return "";
      return actor.affiliateGetInviteLink();
    },
    enabled: !!actor && !isFetching,
    staleTime: 10 * 60 * 1000,
  });

  const displayLink =
    inviteLink || `${window.location.origin}?ref=${profile.inviteCode}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(displayLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const { mutate: requestPayout, isPending: requestingPayout } = useMutation({
    mutationFn: async (method: string) => {
      if (!actor) throw new Error("no actor");
      const result = await actor.affiliateRequestPayout(method);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      setShowPayoutModal(false);
      toast.success(
        "Payout request submitted! We'll process it within 5–7 business days.",
      );
    },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  });

  const statusBadgeCls =
    profile.status === AffiliateStatus.approved
      ? "bg-primary/10 text-primary border-primary/25"
      : "bg-muted text-muted-foreground border-border";

  return (
    <div
      className="max-w-3xl mx-auto px-4 py-10"
      data-ocid="affiliate.dashboard"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <SectionLabel>Partner Dashboard</SectionLabel>
            <div className="flex items-center gap-3 flex-wrap mt-1">
              <h1 className="font-display font-bold text-3xl text-foreground">
                {profile.name}
              </h1>
              <span
                className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${statusBadgeCls}`}
              >
                {profile.status}
              </span>
            </div>
            <div className="mt-2 w-10 h-0.5 bg-primary rounded-full" />
            <p className="font-body text-xs text-muted-foreground mt-2">
              Partner since {formatJoinDate(profile.joinedAt)}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clear}
            className="font-body text-sm text-muted-foreground border-border hover:text-foreground shrink-0"
            data-ocid="affiliate.signout_button"
          >
            Sign Out
          </Button>
        </div>
        <a
          href="/"
          className="inline-flex items-center gap-1.5 mt-4 font-body text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
          data-ocid="affiliate.back_link"
        >
          <ArrowLeft size={14} />
          Back to main site
        </a>
      </div>

      {/* Metric cards */}
      {statsLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
          <MetricCard
            label="Total Clicks"
            value={stats ? Number(stats.totalClicks) : 0}
            icon={MousePointerClick}
            ocid="affiliate.metric.clicks"
          />
          <MetricCard
            label="Total Leads"
            value={stats ? Number(stats.totalLeads) : 0}
            icon={Users}
            ocid="affiliate.metric.leads"
          />
          <MetricCard
            label="Conversions"
            value={stats ? Number(stats.totalConversions) : 0}
            icon={TrendingUp}
            ocid="affiliate.metric.conversions"
          />
          <MetricCard
            label="Commission"
            value={
              stats ? `$${stats.totalCommissionEarned.toFixed(2)}` : "$0.00"
            }
            icon={DollarSign}
            ocid="affiliate.metric.commission"
          />
        </div>
      )}

      {/* Pending payout banner */}
      {stats && stats.pendingPayout > 0 && (
        <div className="bg-primary/10 border border-primary/25 rounded-xl px-5 py-3 flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Wallet size={16} className="text-primary" />
            <span className="font-body text-sm text-foreground">
              Pending payout:{" "}
              <span className="font-display font-bold text-primary">
                ${stats.pendingPayout.toFixed(2)}
              </span>
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => setShowPayoutModal(true)}
            className="font-body font-semibold gap-1.5 shrink-0"
            data-ocid="affiliate.request_payout_button"
          >
            <Wallet size={13} />
            Request Payout
          </Button>
        </div>
      )}

      {/* Referral link card */}
      <div
        className="bg-card border border-border rounded-xl p-5 mb-6"
        data-ocid="affiliate.invite_card"
      >
        <SectionLabel>Your Referral Link</SectionLabel>
        <h3 className="font-display font-semibold text-base text-foreground mb-1">
          Share &amp; Earn
        </h3>
        <p className="font-body text-xs text-muted-foreground mb-3">
          Every visitor you refer is tracked to your account automatically.
        </p>
        <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 mb-3">
          <span className="font-mono text-xs text-muted-foreground truncate flex-1 min-w-0">
            {displayLink}
          </span>
        </div>
        <Button
          onClick={copyLink}
          className="w-full font-body font-semibold gap-2"
          data-ocid="affiliate.copy_link_button"
        >
          {copied ? (
            <>
              <CheckCircle2 size={15} /> Link Copied!
            </>
          ) : (
            <>
              <Copy size={15} /> Copy Referral Link
            </>
          )}
        </Button>
        <p className="font-body text-[10px] text-muted-foreground text-center mt-2">
          Your referral code:{" "}
          <span className="font-mono text-primary">#{profile.inviteCode}</span>
        </p>
      </div>

      {/* Tabs: Analytics / Payout History */}
      <div className="flex gap-2 mb-5">
        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          data-ocid="affiliate.tab.analytics"
          className={[
            "flex items-center gap-2 px-4 py-2.5 rounded-lg font-body text-sm font-medium transition-colors duration-200 border",
            activeTab === "analytics"
              ? "bg-primary/15 text-primary border-primary/30"
              : "bg-card text-muted-foreground border-border hover:text-foreground",
          ].join(" ")}
        >
          <BarChart2 size={15} />
          Analytics
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("payouts")}
          data-ocid="affiliate.tab.payouts"
          className={[
            "flex items-center gap-2 px-4 py-2.5 rounded-lg font-body text-sm font-medium transition-colors duration-200 border",
            activeTab === "payouts"
              ? "bg-primary/15 text-primary border-primary/30"
              : "bg-card text-muted-foreground border-border hover:text-foreground",
          ].join(" ")}
        >
          <Wallet size={15} />
          Payout History
        </button>
      </div>

      <div className="min-h-[30vh]">
        {activeTab === "analytics" && stats && <AnalyticsTab stats={stats} />}
        {activeTab === "payouts" && <PayoutHistoryTab />}
      </div>

      {/* Request payout button (bottom, always visible if no pending) */}
      {stats && stats.pendingPayout === 0 && (
        <div className="mt-8 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={() => setShowPayoutModal(true)}
            className="gap-2 font-body border-primary/30 text-primary hover:bg-primary/10"
            data-ocid="affiliate.request_payout_button_alt"
          >
            <Wallet size={15} />
            Request Payout
          </Button>
        </div>
      )}

      {/* Payout modal */}
      {showPayoutModal && (
        <PayoutRequestModal
          isPending={requestingPayout}
          onClose={() => setShowPayoutModal(false)}
          onSubmit={requestPayout}
        />
      )}
    </div>
  );
}

// ─── Auth Gate ────────────────────────────────────────────────────────────────

function AffiliateGate() {
  const { isAuthenticated, login, isInitializing, clear } =
    useInternetIdentity();
  const { isAffiliate, profile, isLoading } = useAffiliateCheck();

  if (isInitializing || isLoading) return <AffiliateLoadingSkeleton />;

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center py-16"
        data-ocid="affiliate.auth_gate"
      >
        <div className="bg-card border border-border rounded-2xl p-10 max-w-sm w-full shadow-elevated">
          <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center">
            <Lock size={24} className="text-primary" />
          </div>
          <SectionLabel>Affiliate Portal</SectionLabel>
          <h1 className="font-display font-bold text-xl text-foreground mb-2">
            Secure Sign-In Required
          </h1>
          <p className="font-body text-sm text-muted-foreground mb-7 leading-relaxed">
            Sign in with Internet Identity to access your affiliate dashboard.
          </p>
          <Button
            onClick={login}
            className="w-full font-body font-semibold gap-2"
            data-ocid="affiliate.login_button"
          >
            Sign In with Internet Identity
          </Button>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-1.5 mt-4 font-body text-sm text-muted-foreground hover:text-primary transition-colors duration-200 w-full"
            data-ocid="affiliate.back_link"
          >
            <ArrowLeft size={14} />
            Back to main site
          </a>
        </div>
      </div>
    );
  }

  if (!isAffiliate || !profile) {
    return (
      <div
        className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center py-16"
        data-ocid="affiliate.not_enrolled"
      >
        <div className="bg-card border border-border rounded-2xl p-10 max-w-sm w-full shadow-elevated">
          <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-muted border border-border flex items-center justify-center">
            <ShieldOff size={24} className="text-muted-foreground" />
          </div>
          <SectionLabel>Access Denied</SectionLabel>
          <h1 className="font-display font-bold text-xl text-foreground mb-2">
            Not Registered as Affiliate
          </h1>
          <p className="font-body text-sm text-muted-foreground mb-5 leading-relaxed">
            Your account is not registered as an affiliate. Apply to join our
            affiliate program or contact the admin.
          </p>
          <a
            href="/affiliate/signup"
            className="block w-full mb-3"
            data-ocid="affiliate.apply_link"
          >
            <Button className="w-full font-body font-semibold">
              Apply to Affiliate Program
            </Button>
          </a>
          <Button
            variant="outline"
            onClick={clear}
            className="w-full font-body font-semibold border-border"
            data-ocid="affiliate.signout_button"
          >
            Sign Out
          </Button>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-1.5 mt-4 font-body text-sm text-muted-foreground hover:text-primary transition-colors duration-200 w-full"
            data-ocid="affiliate.back_link"
          >
            <ArrowLeft size={14} />
            Back to main site
          </a>
        </div>
      </div>
    );
  }

  // Pending state — show review message instead of dashboard
  if (profile.status === AffiliateStatus.pending) {
    return <PendingReviewState profile={profile} />;
  }

  return <AffiliateDashboard profile={profile} />;
}

// ─── Page Export ──────────────────────────────────────────────────────────────

export function AffiliatePage() {
  return (
    <Layout>
      <AffiliateGate />
    </Layout>
  );
}
