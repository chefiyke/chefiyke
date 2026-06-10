import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Clock,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { createActor } from "../../backend";
import type {
  ActivityLog,
  AffiliateProfile,
  FinanceSummary,
  LeadStats,
  SalesStats,
  StaffUser,
  UserRole,
} from "../../backend";
import { SectionHeader, StatCard, formatCurrency } from "./AdminShared";

function ActivityItem({ log, index }: { log: ActivityLog; index: number }) {
  const roleColor: Record<string, string> = {
    PlatformOwner: "text-[#B8960C]",
    Admin: "text-primary",
    Staff: "text-blue-400",
    Affiliate: "text-purple-400",
    Customer: "text-muted-foreground",
  };
  const role = log.actorRole as unknown as string;
  return (
    <div
      className="flex items-start gap-3 py-3 border-b border-border last:border-0"
      data-ocid={`admin.activity.item.${index}`}
    >
      <div className="mt-0.5 w-2 h-2 rounded-full bg-primary/50 shrink-0 mt-1.5" />
      <div className="min-w-0 flex-1">
        <p className="font-body text-xs text-foreground line-clamp-1">
          {log.action}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className={`font-body text-[11px] font-semibold ${roleColor[role] ?? "text-muted-foreground"}`}
          >
            {role}
          </span>
          <span className="font-body text-[11px] text-muted-foreground">
            {new Date(Number(log.timestamp) / 1_000_000).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export function AdminOverview() {
  const { actor, isFetching } = useActor(createActor);
  const enabled = !!actor && !isFetching;

  const { data: salesStats } = useQuery<SalesStats>({
    queryKey: ["admin", "salesStats"],
    queryFn: () => actor!.adminGetSalesStats(),
    enabled,
  });

  const { data: leadStats } = useQuery<LeadStats>({
    queryKey: ["admin", "leadStats"],
    queryFn: () => actor!.adminGetLeadStats(),
    enabled,
  });

  const { data: summary } = useQuery<FinanceSummary>({
    queryKey: ["admin", "finance-summary"],
    queryFn: () => actor!.adminGetFinanceSummary(),
    enabled,
  });

  const { data: affiliates = [] } = useQuery<AffiliateProfile[]>({
    queryKey: ["admin", "affiliates"],
    queryFn: () => actor!.adminGetAffiliates(),
    enabled,
  });

  const { data: activityLogs = [] } = useQuery<ActivityLog[]>({
    queryKey: ["admin", "activityLog"],
    queryFn: () => actor!.getActivityLog(BigInt(10)),
    enabled,
  });

  const { data: staffList = [] } = useQuery<StaffUser[]>({
    queryKey: ["admin", "staffList"],
    queryFn: () => actor!.listUsersByRole("Staff" as unknown as UserRole),
    enabled,
  });

  const affiliateSignups = affiliates.filter(
    (a) => a.status === "pending" || a.status === "approved",
  ).length;

  return (
    <div data-ocid="admin.overview.section">
      <SectionHeader
        title="Overview"
        subtitle="At-a-glance metrics for your platform"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Total Leads"
          value={leadStats ? Number(leadStats.totalLeads) : "—"}
          icon={<Users size={18} />}
          ocid="admin.stat.total_leads"
          highlight
        />
        <StatCard
          label="Total Sales"
          value={salesStats ? Number(salesStats.totalOrders) : "—"}
          icon={<Activity size={18} />}
          ocid="admin.stat.total_sales"
        />
        <StatCard
          label="Total Revenue"
          value={
            salesStats ? `₦${salesStats.totalRevenue.toLocaleString()}` : "—"
          }
          icon={<DollarSign size={18} />}
          ocid="admin.stat.total_revenue"
          highlight
        />
        <StatCard
          label="Pending Payments"
          value={salesStats ? Number(salesStats.pendingPayments) : "—"}
          icon={<Clock size={18} />}
          ocid="admin.stat.pending_payments"
        />
        <StatCard
          label="Affiliate Signups"
          value={affiliateSignups}
          icon={<Users size={18} />}
          ocid="admin.stat.affiliate_signups"
        />
        <StatCard
          label="Net Balance"
          value={summary ? formatCurrency(summary.netBalance) : "—"}
          icon={<DollarSign size={18} />}
          ocid="admin.stat.balance"
          highlight
        />
        <StatCard
          label="New Leads"
          value={leadStats ? Number(leadStats.newLeads) : "—"}
          icon={<TrendingUp size={18} />}
          ocid="admin.stat.new_leads"
        />
        <StatCard
          label="Active Staff"
          value={staffList.filter((s) => s.status === "active").length}
          icon={<Users size={18} />}
          ocid="admin.stat.active_staff"
        />
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-green-400" />
              <span className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                Total Income
              </span>
            </div>
            <p className="font-display font-bold text-xl text-green-400">
              {formatCurrency(summary.totalIncome)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={16} className="text-destructive" />
              <span className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                Total Expenses
              </span>
            </div>
            <p className="font-display font-bold text-xl text-destructive">
              {formatCurrency(summary.totalExpenses)}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity Feed */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-display font-semibold text-sm text-foreground mb-1 flex items-center gap-2">
            <Activity size={14} className="text-primary" />
            Recent Activity
          </h3>
          <p className="font-body text-xs text-muted-foreground mb-4">
            Last 10 system actions
          </p>
          {activityLogs.length === 0 ? (
            <p
              className="font-body text-xs text-muted-foreground py-4 text-center"
              data-ocid="admin.activity.empty_state"
            >
              No activity recorded yet.
            </p>
          ) : (
            <div>
              {activityLogs.map((log, i) => (
                <ActivityItem key={log.id} log={log} index={i + 1} />
              ))}
            </div>
          )}
        </div>

        {/* Staff Snapshot */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-display font-semibold text-sm text-foreground mb-1 flex items-center gap-2">
            <Users size={14} className="text-primary" />
            Staff Snapshot
          </h3>
          <p className="font-body text-xs text-muted-foreground mb-4">
            Current staff members
          </p>
          {staffList.length === 0 ? (
            <p
              className="font-body text-xs text-muted-foreground py-4 text-center"
              data-ocid="admin.staff_snapshot.empty_state"
            >
              No staff assigned yet.
            </p>
          ) : (
            <div className="space-y-3">
              {staffList.slice(0, 5).map((staff, i) => (
                <div
                  key={staff.id.toString()}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  data-ocid={`admin.staff_snapshot.item.${i + 1}`}
                >
                  <div className="min-w-0">
                    <p className="font-body text-xs text-foreground truncate">
                      {staff.email}
                    </p>
                    <p className="font-body text-[11px] text-muted-foreground">
                      {staff.role as unknown as string}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-body font-semibold ${
                      staff.status === "active"
                        ? "bg-green-400/10 text-green-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {staff.status as unknown as string}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
