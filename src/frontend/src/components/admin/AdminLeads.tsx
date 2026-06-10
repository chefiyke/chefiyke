import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Filter, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type {
  Lead,
  LeadFilter,
  LeadSource,
  LeadStats,
  LeadStatus,
} from "../../backend";
import { SectionHeader, fieldClass, formatDate } from "./AdminShared";

const STATUS_OPTIONS = [
  "all",
  "new_",
  "contacted",
  "qualified",
  "rejected",
  "converted",
] as const;
const SOURCE_OPTIONS = [
  "all",
  "contact_form",
  "affiliate_signup",
  "training_enrollment",
  "other",
] as const;

const STATUS_COLORS: Record<string, string> = {
  new_: "bg-blue-400/15 text-blue-400 border-blue-400/30",
  contacted: "bg-yellow-400/15 text-yellow-400 border-yellow-400/30",
  qualified: "bg-green-400/15 text-green-400 border-green-400/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
  converted: "bg-[#B8960C]/20 text-[#B8960C] border-[#B8960C]/30",
};

const STATUS_LABELS: Record<string, string> = {
  new_: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  rejected: "Rejected",
  converted: "Converted",
};

const SOURCE_LABELS: Record<string, string> = {
  contact_form: "Contact Form",
  affiliate_signup: "Affiliate",
  training_enrollment: "Training",
  other: "Other",
};

function LeadStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      className={`text-[10px] ${STATUS_COLORS[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

function SourceBadge({ source }: { source: string }) {
  return (
    <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
      {SOURCE_LABELS[source] ?? source}
    </Badge>
  );
}

function exportLeadsCSV(leads: Lead[]) {
  const headers = [
    "Date",
    "Name",
    "Email",
    "Phone",
    "Source",
    "Status",
    "Message",
    "Notes",
  ];
  const rows = leads.map((l) => [
    formatDate(l.createdAt),
    l.name,
    l.email,
    l.phone ?? "",
    l.source as unknown as string,
    l.status as unknown as string,
    `"${l.message.replace(/"/g, '""')}"`,
    `"${l.notes.replace(/"/g, '""')}"`,
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "leads-export.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function LeadDetailPanel({
  lead,
  open,
  onClose,
}: {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
}) {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");

  const updateMutation = useMutation({
    mutationFn: (status: LeadStatus) => {
      if (!lead || !actor) throw new Error("No lead");
      return actor.adminUpdateLead(
        lead.id,
        lead.name,
        lead.email,
        lead.phone ?? null,
        lead.message,
        lead.source,
        status,
        lead.notes,
        lead.assignedStaff ?? null,
        lead.affiliateRef ?? null,
        lead.createdAt,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "leads"] });
      toast.success("Status updated");
    },
  });

  const noteMutation = useMutation({
    mutationFn: () => {
      if (!lead || !actor) throw new Error("No lead");
      const newNotes = lead.notes ? `${lead.notes}\n${note}` : note;
      return actor.adminUpdateLead(
        lead.id,
        lead.name,
        lead.email,
        lead.phone ?? null,
        lead.message,
        lead.source,
        lead.status,
        newNotes,
        lead.assignedStaff ?? null,
        lead.affiliateRef ?? null,
        lead.createdAt,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "leads"] });
      setNote("");
      toast.success("Note added");
    },
  });

  if (!lead) return null;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        className="bg-card border-border w-full sm:max-w-lg overflow-y-auto"
        data-ocid="admin.leads.detail_sheet"
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="font-display text-foreground">
            {lead.name}
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                Email
              </p>
              <p className="font-body text-xs text-foreground">{lead.email}</p>
            </div>
            <div>
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                Phone
              </p>
              <p className="font-body text-xs text-foreground">
                {lead.phone ?? "—"}
              </p>
            </div>
            <div>
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                Source
              </p>
              <SourceBadge source={lead.source as unknown as string} />
            </div>
            <div>
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                Date
              </p>
              <p className="font-body text-xs text-foreground">
                {formatDate(lead.createdAt)}
              </p>
            </div>
          </div>

          <div>
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
              Status
            </p>
            <Select
              value={lead.status as unknown as string}
              onValueChange={(v) =>
                updateMutation.mutate(v as unknown as LeadStatus)
              }
            >
              <SelectTrigger
                className="bg-background border-input text-sm"
                data-ocid="admin.leads.detail_status_select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {STATUS_OPTIONS.filter((s) => s !== "all").map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
              Message
            </p>
            <div className="bg-background border border-border rounded-lg p-3">
              <p className="font-body text-sm text-foreground">
                {lead.message}
              </p>
            </div>
          </div>

          {lead.notes && (
            <div>
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                Existing Notes
              </p>
              <div className="bg-background border border-border rounded-lg p-3">
                <p className="font-body text-xs text-foreground whitespace-pre-wrap">
                  {lead.notes}
                </p>
              </div>
            </div>
          )}

          <div>
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
              Add Note
            </p>
            <Textarea
              className="bg-background border-input text-sm min-h-[80px] resize-none"
              placeholder="Add a note about this lead..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              data-ocid="admin.leads.note_textarea"
            />
            <Button
              size="sm"
              onClick={() => noteMutation.mutate()}
              disabled={!note.trim()}
              className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
              data-ocid="admin.leads.save_note_button"
            >
              Save Note
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full mt-2"
            data-ocid="admin.leads.close_button"
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function AdminLeads() {
  const { actor, isFetching } = useActor(createActor);
  const enabled = !!actor && !isFetching;

  const [filter, setFilter] = useState({
    status: "all",
    source: "all",
    fromDate: "",
    toDate: "",
  });
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const buildFilter = (): LeadFilter => {
    const f: LeadFilter = {};
    if (filter.status !== "all")
      f.status = filter.status as unknown as LeadStatus;
    if (filter.source !== "all")
      f.source = filter.source as unknown as LeadSource;
    if (filter.fromDate)
      f.fromDate =
        BigInt(new Date(filter.fromDate).getTime()) * BigInt(1_000_000);
    if (filter.toDate)
      f.toDate = BigInt(new Date(filter.toDate).getTime()) * BigInt(1_000_000);
    return f;
  };

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["admin", "leads", filter],
    queryFn: () => actor!.adminGetLeads(buildFilter()),
    enabled,
  });

  const { data: stats } = useQuery<LeadStats>({
    queryKey: ["admin", "leadStats"],
    queryFn: () => actor!.adminGetLeadStats(),
    enabled,
  });

  return (
    <div data-ocid="admin.leads.section">
      <div className="flex items-center justify-between mb-6">
        <SectionHeader
          title="Leads"
          subtitle="All form submissions and contact inquiries"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportLeadsCSV(leads)}
          className="gap-1.5 text-xs border-border shrink-0"
          data-ocid="admin.leads.export_button"
        >
          <Download size={13} /> Export CSV
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Total Leads", value: Number(stats.totalLeads) },
            { label: "New", value: Number(stats.newLeads) },
            { label: "Qualified", value: Number(stats.qualifiedLeads) },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-card border border-border rounded-xl px-4 py-3"
            >
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">
                {s.label}
              </p>
              <p className="font-display font-bold text-lg text-[#B8960C] mt-0.5">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div
        className="bg-card border border-border rounded-xl p-4 mb-5 flex flex-wrap gap-3 items-end"
        data-ocid="admin.leads.filter_bar"
      >
        <Filter size={14} className="text-muted-foreground self-center" />
        <div className="flex-1 min-w-[130px]">
          <Label className="font-body text-[10px] text-muted-foreground mb-1 block uppercase tracking-wider">
            Status
          </Label>
          <Select
            value={filter.status}
            onValueChange={(v) => setFilter((p) => ({ ...p, status: v }))}
          >
            <SelectTrigger
              className="h-8 text-xs bg-background border-input"
              data-ocid="admin.leads.status_filter"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "all" ? "All Statuses" : STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[130px]">
          <Label className="font-body text-[10px] text-muted-foreground mb-1 block uppercase tracking-wider">
            Source
          </Label>
          <Select
            value={filter.source}
            onValueChange={(v) => setFilter((p) => ({ ...p, source: v }))}
          >
            <SelectTrigger
              className="h-8 text-xs bg-background border-input"
              data-ocid="admin.leads.source_filter"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {SOURCE_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "all" ? "All Sources" : SOURCE_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="font-body text-[10px] text-muted-foreground mb-1 block uppercase tracking-wider">
            From
          </Label>
          <input
            type="date"
            className={`${fieldClass()} h-8 text-xs`}
            value={filter.fromDate}
            onChange={(e) =>
              setFilter((p) => ({ ...p, fromDate: e.target.value }))
            }
            data-ocid="admin.leads.from_date_input"
          />
        </div>
        <div>
          <Label className="font-body text-[10px] text-muted-foreground mb-1 block uppercase tracking-wider">
            To
          </Label>
          <input
            type="date"
            className={`${fieldClass()} h-8 text-xs`}
            value={filter.toDate}
            onChange={(e) =>
              setFilter((p) => ({ ...p, toDate: e.target.value }))
            }
            data-ocid="admin.leads.to_date_input"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div
          className="bg-card border border-border rounded-xl p-8 text-center"
          data-ocid="admin.leads.loading_state"
        >
          <p className="font-body text-sm text-muted-foreground">
            Loading leads...
          </p>
        </div>
      ) : leads.length === 0 ? (
        <div
          className="bg-card border border-border rounded-xl p-10 text-center"
          data-ocid="admin.leads.empty_state"
        >
          <MessageSquare
            size={32}
            className="text-muted-foreground mx-auto mb-3"
          />
          <p className="font-body text-sm text-muted-foreground">
            No leads found for the selected filters.
          </p>
        </div>
      ) : (
        <div
          className="bg-card border border-border rounded-xl overflow-hidden"
          data-ocid="admin.leads.table"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {[
                    "Date",
                    "Name",
                    "Email",
                    "Source",
                    "Status",
                    "Notes Preview",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 font-body text-xs text-muted-foreground uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => (
                  <tr
                    key={lead.id}
                    className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => setSelectedLead(lead)}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      setSelectedLead(lead)
                    }
                    tabIndex={0}
                    data-ocid={`admin.leads.item.${i + 1}`}
                  >
                    <td className="px-4 py-3 font-body text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-foreground font-medium">
                      {lead.name}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-muted-foreground truncate max-w-[160px]">
                      {lead.email}
                    </td>
                    <td className="px-4 py-3">
                      <SourceBadge source={lead.source as unknown as string} />
                    </td>
                    <td className="px-4 py-3">
                      <LeadStatusBadge
                        status={lead.status as unknown as string}
                      />
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-muted-foreground truncate max-w-[200px]">
                      {lead.notes ||
                        lead.message.slice(0, 60) +
                          (lead.message.length > 60 ? "…" : "")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <LeadDetailPanel
        lead={selectedLead}
        open={!!selectedLead}
        onClose={() => setSelectedLead(null)}
      />
    </div>
  );
}
