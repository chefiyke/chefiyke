import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Download, MessageSquare, Users } from "lucide-react";
import { useState } from "react";
import { SiWhatsapp } from "react-icons/si";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type { BuyerLead, BuyerLeadStatus, FormSource } from "../../backend.d";
import { SectionHeader, formatDate } from "./AdminShared";

const STATUS_OPTIONS = [
  "all",
  "New",
  "Contacted",
  "Converted",
  "Rejected",
] as const;
const SOURCE_OPTIONS = ["all", "Hero", "MidPage", "Footer"] as const;

const STATUS_STYLES: Record<string, string> = {
  New: "bg-[#B8960C]/20 text-[#B8960C] border-[#B8960C]/40",
  Contacted: "bg-blue-400/15 text-blue-400 border-blue-400/30",
  Converted: "bg-green-400/15 text-green-400 border-green-400/30",
  Rejected: "bg-destructive/15 text-destructive border-destructive/30",
};

const SOURCE_LABELS: Record<string, string> = {
  Hero: "Hero",
  MidPage: "Mid-Page",
  Footer: "Footer",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      className={`text-[10px] border ${STATUS_STYLES[status] ?? "bg-muted text-muted-foreground border-transparent"}`}
    >
      {status}
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

function exportBuyerLeadsCSV(leads: BuyerLead[]) {
  const headers = [
    "Date",
    "Name",
    "Email",
    "Phone",
    "Business",
    "Type",
    "Timeline",
    "Budget",
    "Source",
    "Status",
    "Project",
  ];
  const rows = leads.map((l) => [
    formatDate(l.createdAt),
    l.name,
    l.email,
    l.phone,
    l.businessName,
    l.businessType,
    l.timeline,
    l.budgetRange,
    l.formSource as unknown as string,
    l.status as unknown as string,
    `"${l.projectDescription.replace(/"/g, '""')}"`,
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "buyer-leads-export.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function BuyerLeadDetailSheet({
  lead,
  open,
  onClose,
}: {
  lead: BuyerLead | null;
  open: boolean;
  onClose: () => void;
}) {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  const [note, setNote] = useState("");

  const updateMutation = useMutation({
    mutationFn: ({
      status,
      notes,
    }: { status: BuyerLeadStatus; notes: string | null }) => {
      if (!lead || !actor) throw new Error("No lead");
      return actor.adminUpdateBuyerLeadStatus(lead.id, status, notes);
    },
    onSuccess: (res) => {
      if (res.__kind__ === "err") {
        toast.error(res.err);
        return;
      }
      qc.invalidateQueries({ queryKey: ["admin", "buyer-leads"] });
      toast.success("Status updated");
    },
    onError: () => toast.error("Failed to update"),
  });

  if (!lead) return null;

  const waMessage = encodeURIComponent(
    `Hi ${lead.name}, I saw your interest in getting a landing page built. I'd love to discuss your project: ${lead.projectDescription.slice(0, 100)}...`,
  );
  const waUrl = `https://wa.me/${lead.phone.replace(/\D/g, "")}?text=${waMessage}`;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        className="bg-card border-border w-full sm:max-w-lg overflow-y-auto"
        data-ocid="admin.buyer_leads.detail_sheet"
      >
        <SheetHeader className="mb-5">
          <SheetTitle className="font-display text-foreground">
            {lead.name}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          {/* Quick actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              className="gap-1.5 bg-[#25D366] hover:bg-[#25D366]/90 text-white text-xs flex-1"
              onClick={() =>
                window.open(waUrl, "_blank", "noopener,noreferrer")
              }
              data-ocid="admin.buyer_leads.whatsapp_button"
            >
              <SiWhatsapp size={13} /> WhatsApp
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs border-border"
              onClick={onClose}
              data-ocid="admin.buyer_leads.close_button"
            >
              Close
            </Button>
          </div>

          {/* Grid info */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Email", value: lead.email },
              { label: "Phone", value: lead.phone },
              { label: "Business", value: lead.businessName },
              { label: "Type", value: lead.businessType },
              { label: "Timeline", value: lead.timeline },
              { label: "Budget Range", value: lead.budgetRange },
              { label: "Date", value: formatDate(lead.createdAt) },
              {
                label: "Source",
                value:
                  SOURCE_LABELS[lead.formSource as unknown as string] ??
                  (lead.formSource as unknown as string),
              },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  {label}
                </p>
                <p className="font-body text-xs text-foreground break-words">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Project description */}
          <div>
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
              Project Description
            </p>
            <div className="bg-background border border-border rounded-lg p-3">
              <p className="font-body text-sm text-foreground whitespace-pre-wrap">
                {lead.projectDescription}
              </p>
            </div>
          </div>

          {/* Notes */}
          {lead.notes && (
            <div>
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                Notes
              </p>
              <div className="bg-background border border-border rounded-lg p-3">
                <p className="font-body text-xs text-foreground whitespace-pre-wrap">
                  {lead.notes}
                </p>
              </div>
            </div>
          )}

          {/* Status update */}
          <div>
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
              Update Status
            </p>
            <Select
              value={lead.status as unknown as string}
              onValueChange={(v) =>
                updateMutation.mutate({
                  status: v as unknown as BuyerLeadStatus,
                  notes: note.trim() || null,
                })
              }
            >
              <SelectTrigger
                className="bg-background border-input text-sm"
                data-ocid="admin.buyer_leads.status_select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {STATUS_OPTIONS.filter((s) => s !== "all").map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add note */}
          <div>
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
              Add Note (optional, saved with next status update)
            </p>
            <Textarea
              className="bg-background border-input text-sm min-h-[72px] resize-none"
              placeholder="Add a follow-up note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              data-ocid="admin.buyer_leads.note_textarea"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function AdminBuyerLeads() {
  const { actor, isFetching } = useActor(createActor);
  const enabled = !!actor && !isFetching;

  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selected, setSelected] = useState<BuyerLead | null>(null);

  const { data: leads = [], isLoading } = useQuery<BuyerLead[]>({
    queryKey: ["admin", "buyer-leads", statusFilter, sourceFilter],
    queryFn: () =>
      actor!.adminListBuyerLeads(
        statusFilter !== "all"
          ? (statusFilter as unknown as BuyerLeadStatus)
          : null,
        sourceFilter !== "all" ? (sourceFilter as unknown as FormSource) : null,
      ),
    enabled,
  });

  // Stats derived from full list
  const stats = {
    total: leads.length,
    newCount: leads.filter((l) => (l.status as unknown as string) === "New")
      .length,
    converted: leads.filter(
      (l) => (l.status as unknown as string) === "Converted",
    ).length,
  };

  return (
    <div data-ocid="admin.buyer_leads.section">
      <div className="flex items-center justify-between mb-6">
        <SectionHeader
          title="Buyer Leads"
          subtitle="Interest submissions from landing page visitors"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportBuyerLeadsCSV(leads)}
          className="gap-1.5 text-xs border-border shrink-0"
          data-ocid="admin.buyer_leads.export_button"
        >
          <Download size={13} /> Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Total", value: stats.total },
          { label: "New", value: stats.newCount },
          { label: "Converted", value: stats.converted },
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

      {/* Filters */}
      <div
        className="bg-card border border-border rounded-xl p-4 mb-5 flex flex-wrap gap-3 items-end"
        data-ocid="admin.buyer_leads.filter_bar"
      >
        <div className="flex-1 min-w-[130px]">
          <Label className="font-body text-[10px] text-muted-foreground mb-1 block uppercase tracking-wider">
            Status
          </Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger
              className="h-8 text-xs bg-background border-input"
              data-ocid="admin.buyer_leads.status_filter"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "all" ? "All Statuses" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[130px]">
          <Label className="font-body text-[10px] text-muted-foreground mb-1 block uppercase tracking-wider">
            Source
          </Label>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger
              className="h-8 text-xs bg-background border-input"
              data-ocid="admin.buyer_leads.source_filter"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {SOURCE_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "all" ? "All Sources" : (SOURCE_LABELS[s] ?? s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div
          className="bg-card border border-border rounded-xl p-8 text-center"
          data-ocid="admin.buyer_leads.loading_state"
        >
          <p className="font-body text-sm text-muted-foreground">
            Loading buyer leads…
          </p>
        </div>
      ) : leads.length === 0 ? (
        <div
          className="bg-card border border-border rounded-xl p-10 text-center"
          data-ocid="admin.buyer_leads.empty_state"
        >
          <Users size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="font-body text-sm text-muted-foreground">
            No buyer leads yet.
          </p>
          <p className="font-body text-xs text-muted-foreground mt-1">
            Leads appear here when visitors submit the "Get This Landing Page"
            form.
          </p>
        </div>
      ) : (
        <div
          className="bg-card border border-border rounded-xl overflow-hidden"
          data-ocid="admin.buyer_leads.table"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {[
                    "Date",
                    "Name",
                    "Email",
                    "Business Type",
                    "Timeline",
                    "Source",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 font-body text-xs text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => (
                  <tr
                    key={String(lead.id)}
                    className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => setSelected(lead)}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") && setSelected(lead)
                    }
                    tabIndex={0}
                    data-ocid={`admin.buyer_leads.item.${i + 1}`}
                  >
                    <td className="px-4 py-3 font-body text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-foreground font-medium">
                      {lead.name}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-muted-foreground truncate max-w-[150px]">
                      {lead.email}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-muted-foreground">
                      {lead.businessType}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-muted-foreground whitespace-nowrap">
                      {lead.timeline}
                    </td>
                    <td className="px-4 py-3">
                      <SourceBadge
                        source={lead.formSource as unknown as string}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lead.status as unknown as string} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WhatsApp quick-action on mobile row */}
      {leads.length > 0 && (
        <p className="font-body text-xs text-muted-foreground mt-3 text-center">
          Click any row to view full details and send a WhatsApp message
        </p>
      )}

      <BuyerLeadDetailSheet
        lead={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
