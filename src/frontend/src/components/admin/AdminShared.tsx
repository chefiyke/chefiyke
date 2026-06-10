// Shared utilities for admin components
export function SectionHeader({
  title,
  subtitle,
}: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <p className="text-[10px] uppercase tracking-widest text-primary font-body font-semibold mb-1">
        Admin
      </p>
      <h2 className="font-display font-bold text-2xl text-foreground">
        {title}
      </h2>
      {subtitle && (
        <p className="font-body text-sm text-muted-foreground mt-1">
          {subtitle}
        </p>
      )}
      <div className="mt-3 w-10 h-0.5 bg-primary rounded-full" />
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  ocid,
  highlight,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  ocid: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`border rounded-xl p-5 ${highlight ? "bg-primary/5 border-primary/30" : "bg-card border-border"}`}
      data-ocid={ocid}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-primary">{icon}</span>
        <span className="font-body text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="font-display font-bold text-2xl text-foreground">{value}</p>
    </div>
  );
}

export function FormCard({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 mb-5">
      <h3 className="font-display font-semibold text-base text-foreground mb-4 pb-3 border-b border-border">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function fieldClass() {
  return "w-full bg-background border border-input rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors";
}

export function formatCurrency(amount: bigint) {
  return `₦${Number(amount).toLocaleString()}`;
}

export function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString();
}
