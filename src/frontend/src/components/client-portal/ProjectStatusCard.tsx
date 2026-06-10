import { Badge } from "@/components/ui/badge";
import { ClientProjectStatus } from "../../backend.d";
import type { ClientProject } from "../../backend.d";

interface ProjectStatusCardProps {
  project: ClientProject;
}

export function getStatusConfig(status: ClientProjectStatus) {
  switch (status) {
    case ClientProjectStatus.Pending:
      return {
        label: "Pending",
        badgeClass: "bg-muted text-muted-foreground border-border",
        dotClass: "bg-muted-foreground",
        barClass: "bg-muted-foreground",
      };
    case ClientProjectStatus.InProgress:
      return {
        label: "In Progress",
        badgeClass: "bg-primary/20 text-primary border-primary/40",
        dotClass: "bg-primary",
        barClass: "bg-primary",
      };
    case ClientProjectStatus.UnderReview:
      return {
        label: "Under Review",
        badgeClass: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        dotClass: "bg-blue-400",
        barClass: "bg-blue-400",
      };
    case ClientProjectStatus.Completed:
      return {
        label: "Completed",
        badgeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        dotClass: "bg-emerald-400",
        barClass: "bg-emerald-400",
      };
    case ClientProjectStatus.OnHold:
      return {
        label: "On Hold",
        badgeClass: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        dotClass: "bg-orange-400",
        barClass: "bg-orange-400",
      };
    default:
      return {
        label: "Unknown",
        badgeClass: "bg-muted text-muted-foreground border-border",
        dotClass: "bg-muted-foreground",
        barClass: "bg-muted-foreground",
      };
  }
}

function formatDate(ts: bigint): string {
  const date = new Date(Number(ts) / 1_000_000);
  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ProjectStatusCard({ project }: ProjectStatusCardProps) {
  const statusConfig = getStatusConfig(project.status);

  const totalSteps = project.nextSteps.length;
  const completedSteps = project.nextSteps.filter((s) => s.isCompleted).length;
  const completionPct =
    totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);

  return (
    <div
      className="bg-card border border-border rounded-2xl p-6 space-y-5"
      data-ocid="client.status_card"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground text-sm uppercase tracking-widest">
          Project Status
        </h3>
        <Badge
          className={`border text-xs font-semibold px-3 py-1 ${statusConfig.badgeClass}`}
          data-ocid="client.status_badge"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full mr-2 inline-block ${statusConfig.dotClass}`}
          />
          {statusConfig.label}
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-body">
          <span className="text-muted-foreground">Overall Progress</span>
          <span className="text-foreground font-semibold">
            {completionPct}%
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${statusConfig.barClass}`}
            style={{ width: `${completionPct}%` }}
            data-ocid="client.progress_bar"
          />
        </div>
        <p className="text-xs text-muted-foreground font-body">
          {completedSteps} of {totalSteps} steps completed
        </p>
      </div>

      {/* Dates grid */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body mb-1">
            Start Date
          </p>
          <p className="text-sm text-foreground font-body font-medium">
            {formatDate(project.startDate)}
          </p>
        </div>
        {project.expectedEndDate ? (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body mb-1">
              Expected End
            </p>
            <p className="text-sm text-foreground font-body font-medium">
              {formatDate(project.expectedEndDate)}
            </p>
          </div>
        ) : null}
        {project.completedDate ? (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body mb-1">
              Completed
            </p>
            <p className="text-sm text-emerald-400 font-body font-medium">
              {formatDate(project.completedDate)}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
