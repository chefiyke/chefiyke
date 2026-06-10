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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Folder,
  Plus,
  RefreshCw,
  Search,
  Send,
  Upload,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import { ClientProjectStatus, ConsultingTier } from "../../backend.d";
import type {
  ClientProject,
  CreateProjectRequest,
  Deliverable,
} from "../../backend.d";
import { getStatusConfig } from "../client-portal/ProjectStatusCard";

// ── Tier options ──────────────────────────────────────────────────────────────
const TIER_OPTIONS = [
  { value: ConsultingTier.BusinessDevelopment, label: "Business Development" },
  { value: ConsultingTier.Advisory, label: "Advisory / Mentorship" },
  { value: ConsultingTier.BakerySetup, label: "Bakery Setup" },
  {
    value: ConsultingTier.BakerySetupAndRecipes,
    label: "Bakery Setup + Recipes",
  },
];

const STATUS_OPTIONS = [
  { value: ClientProjectStatus.Pending, label: "Pending" },
  { value: ClientProjectStatus.InProgress, label: "In Progress" },
  { value: ClientProjectStatus.UnderReview, label: "Under Review" },
  { value: ClientProjectStatus.Completed, label: "Completed" },
  { value: ClientProjectStatus.OnHold, label: "On Hold" },
];

function getTierLabel(tier: ConsultingTier): string {
  return TIER_OPTIONS.find((t) => t.value === tier)?.label ?? "Consulting";
}

function tsNow(): bigint {
  return BigInt(Date.now()) * 1_000_000n;
}

function dateStringToTs(dateStr: string): bigint {
  return BigInt(new Date(dateStr).getTime()) * 1_000_000n;
}

function formatDate(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ── Create Project Form ───────────────────────────────────────────────────────
function CreateProjectForm({ onCreated }: { onCreated: () => void }) {
  const { actor } = useActor(createActor);
  const [form, setForm] = useState({
    clientPrincipal: "",
    clientName: "",
    clientEmail: "",
    tier: ConsultingTier.BusinessDevelopment,
    projectTitle: "",
    projectDescription: "",
    startDate: new Date().toISOString().split("T")[0],
    expectedEndDate: "",
  });
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const { Principal } = await import("@icp-sdk/core/principal");
      const req: CreateProjectRequest = {
        clientPrincipal: Principal.fromText(form.clientPrincipal),
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        tier: form.tier,
        projectTitle: form.projectTitle,
        projectDescription: form.projectDescription,
        startDate: dateStringToTs(form.startDate),
        expectedEndDate: form.expectedEndDate
          ? dateStringToTs(form.expectedEndDate)
          : undefined,
      };
      const result = await actor.adminCreateProject(req);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      toast.success("Project created successfully");
      onCreated();
      setOpen(false);
      setForm({
        clientPrincipal: "",
        clientName: "",
        clientEmail: "",
        tier: ConsultingTier.BusinessDevelopment,
        projectTitle: "",
        projectDescription: "",
        startDate: new Date().toISOString().split("T")[0],
        expectedEndDate: "",
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div
      className="bg-card border border-border rounded-2xl overflow-hidden"
      data-ocid="admin.client_portal.create_project_card"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition-colors"
        data-ocid="admin.client_portal.create_project_toggle"
      >
        <div className="flex items-center gap-2">
          <Plus size={16} className="text-primary" />
          <span className="font-display font-semibold text-foreground text-sm">
            Create New Project
          </span>
        </div>
        {open ? (
          <ChevronDown size={16} className="text-muted-foreground" />
        ) : (
          <ChevronRight size={16} className="text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-border space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-body">
                    Client Internet Identity Principal
                  </Label>
                  <Input
                    placeholder="aaaaa-bbbbb-ccccc-..."
                    value={form.clientPrincipal}
                    onChange={(e) =>
                      setForm({ ...form, clientPrincipal: e.target.value })
                    }
                    className="text-sm font-mono"
                    data-ocid="admin.client_portal.principal_input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-body">
                    Client Name
                  </Label>
                  <Input
                    placeholder="Full name"
                    value={form.clientName}
                    onChange={(e) =>
                      setForm({ ...form, clientName: e.target.value })
                    }
                    className="text-sm"
                    data-ocid="admin.client_portal.client_name_input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-body">
                    Client Email
                  </Label>
                  <Input
                    type="email"
                    placeholder="client@email.com"
                    value={form.clientEmail}
                    onChange={(e) =>
                      setForm({ ...form, clientEmail: e.target.value })
                    }
                    className="text-sm"
                    data-ocid="admin.client_portal.client_email_input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-body">
                    Consulting Tier
                  </Label>
                  <Select
                    value={form.tier}
                    onValueChange={(v) =>
                      setForm({ ...form, tier: v as ConsultingTier })
                    }
                  >
                    <SelectTrigger
                      className="text-sm"
                      data-ocid="admin.client_portal.tier_select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIER_OPTIONS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-body">
                    Project Title
                  </Label>
                  <Input
                    placeholder="e.g. Lagos Bakery Business Launch"
                    value={form.projectTitle}
                    onChange={(e) =>
                      setForm({ ...form, projectTitle: e.target.value })
                    }
                    className="text-sm"
                    data-ocid="admin.client_portal.project_title_input"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-body">
                    Project Description
                  </Label>
                  <Textarea
                    placeholder="Brief description of scope and objectives..."
                    rows={3}
                    value={form.projectDescription}
                    onChange={(e) =>
                      setForm({ ...form, projectDescription: e.target.value })
                    }
                    className="text-sm resize-none"
                    data-ocid="admin.client_portal.project_description_textarea"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-body">
                    Start Date
                  </Label>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                    className="text-sm"
                    data-ocid="admin.client_portal.start_date_input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-body">
                    Expected End Date{" "}
                    <span className="text-muted-foreground/50">(optional)</span>
                  </Label>
                  <Input
                    type="date"
                    value={form.expectedEndDate}
                    onChange={(e) =>
                      setForm({ ...form, expectedEndDate: e.target.value })
                    }
                    className="text-sm"
                    data-ocid="admin.client_portal.end_date_input"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => mutation.mutate()}
                  disabled={
                    mutation.isPending ||
                    !form.clientPrincipal ||
                    !form.clientName ||
                    !form.projectTitle
                  }
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
                  data-ocid="admin.client_portal.create_project_submit_button"
                >
                  {mutation.isPending ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Creating…
                    </>
                  ) : (
                    <>
                      <Plus size={14} /> Create Project
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Project detail panel ──────────────────────────────────────────────────────
function ProjectDetailPanel({
  project,
  onRefresh,
}: { project: ClientProject; onRefresh: () => void }) {
  const { actor } = useActor(createActor);
  const [updateForm, setUpdateForm] = useState({ title: "", content: "" });
  const [delivForm, setDelivForm] = useState({
    title: "",
    description: "",
    url: "",
    fileType: "",
    isAvailable: false,
  });
  const [stepDesc, setStepDesc] = useState("");
  const [status, setStatus] = useState<ClientProjectStatus>(project.status);

  const addUpdateMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const r = await actor.adminAddUpdate(
        project.id,
        updateForm.title,
        updateForm.content,
      );
      if (r.__kind__ === "err") throw new Error(r.err);
    },
    onSuccess: () => {
      toast.success("Update published to client");
      setUpdateForm({ title: "", content: "" });
      onRefresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addDeliverableMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const deliverable: Deliverable = {
        id: `d_${Date.now()}`,
        title: delivForm.title,
        description: delivForm.description,
        url: delivForm.url || undefined,
        fileType: delivForm.fileType || undefined,
        isAvailable: delivForm.isAvailable,
        uploadedAt: tsNow(),
      };
      const r = await actor.adminAddDeliverable(project.id, deliverable);
      if (r.__kind__ === "err") throw new Error(r.err);
    },
    onSuccess: () => {
      toast.success("Deliverable added");
      setDelivForm({
        title: "",
        description: "",
        url: "",
        fileType: "",
        isAvailable: false,
      });
      onRefresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addStepMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const r = await actor.adminAddNextStep(project.id, stepDesc);
      if (r.__kind__ === "err") throw new Error(r.err);
    },
    onSuccess: () => {
      toast.success("Next step added");
      setStepDesc("");
      onRefresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleStepMutation = useMutation({
    mutationFn: async ({
      stepId,
      current,
    }: { stepId: string; current: boolean }) => {
      if (!actor) throw new Error("Actor not available");
      const r = await actor.adminUpdateNextStep(project.id, stepId, !current);
      if (r.__kind__ === "err") throw new Error(r.err);
    },
    onSuccess: () => {
      onRefresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: ClientProjectStatus) => {
      if (!actor) throw new Error("Actor not available");
      const r = await actor.adminUpdateProject(project.id, {
        status: newStatus,
      });
      if (r.__kind__ === "err") throw new Error(r.err);
    },
    onSuccess: () => {
      toast.success("Project status updated");
      onRefresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const sortedSteps = [...project.nextSteps].sort((a, b) =>
    Number(a.order - b.order),
  );
  const publishedUpdates = [...project.updates]
    .filter((u) => u.isPublished)
    .sort((a, b) => Number(b.createdAt - a.createdAt));

  return (
    <div className="space-y-6 pt-2">
      {/* Status update */}
      <div className="bg-background/50 rounded-xl border border-border p-4 space-y-3">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-body font-semibold">
          Update Status
        </p>
        <div className="flex items-center gap-3">
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as ClientProjectStatus)}
          >
            <SelectTrigger
              className="text-sm flex-1"
              data-ocid="admin.client_portal.status_select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={() => updateStatusMutation.mutate(status)}
            disabled={
              updateStatusMutation.isPending || status === project.status
            }
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-1.5"
            data-ocid="admin.client_portal.update_status_button"
          >
            {updateStatusMutation.isPending ? (
              <RefreshCw size={12} className="animate-spin" />
            ) : (
              <Send size={12} />
            )}{" "}
            Save
          </Button>
        </div>
      </div>

      {/* Add update */}
      <div className="bg-background/50 rounded-xl border border-border p-4 space-y-3">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-body font-semibold">
          Post an Update
        </p>
        <Input
          placeholder="Update title (e.g. Phase 1 Complete)"
          value={updateForm.title}
          onChange={(e) =>
            setUpdateForm({ ...updateForm, title: e.target.value })
          }
          className="text-sm"
          data-ocid="admin.client_portal.update_title_input"
        />
        <Textarea
          placeholder="Describe the progress or what was accomplished..."
          rows={3}
          value={updateForm.content}
          onChange={(e) =>
            setUpdateForm({ ...updateForm, content: e.target.value })
          }
          className="text-sm resize-none"
          data-ocid="admin.client_portal.update_content_textarea"
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => addUpdateMutation.mutate()}
            disabled={
              addUpdateMutation.isPending ||
              !updateForm.title ||
              !updateForm.content
            }
            className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 font-semibold gap-1.5"
            data-ocid="admin.client_portal.post_update_button"
          >
            {addUpdateMutation.isPending ? (
              <RefreshCw size={12} className="animate-spin" />
            ) : (
              <Send size={12} />
            )}{" "}
            Publish Update
          </Button>
        </div>

        {publishedUpdates.length > 0 && (
          <div className="pt-2 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body">
              Published Updates ({publishedUpdates.length})
            </p>
            {publishedUpdates.map((u) => (
              <div
                key={u.id}
                className="bg-card rounded-lg border border-border px-3 py-2.5"
              >
                <p className="text-xs font-semibold text-foreground font-body">
                  {u.title}
                </p>
                <p className="text-xs text-muted-foreground font-body truncate">
                  {u.content}
                </p>
                <p className="text-[10px] text-muted-foreground/50 font-body mt-1">
                  {formatDate(u.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add deliverable */}
      <div className="bg-background/50 rounded-xl border border-border p-4 space-y-3">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-body font-semibold">
          Add Deliverable
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            placeholder="Deliverable title"
            value={delivForm.title}
            onChange={(e) =>
              setDelivForm({ ...delivForm, title: e.target.value })
            }
            className="text-sm"
            data-ocid="admin.client_portal.deliverable_title_input"
          />
          <Input
            placeholder="File type (pdf, link, zip…)"
            value={delivForm.fileType}
            onChange={(e) =>
              setDelivForm({ ...delivForm, fileType: e.target.value })
            }
            className="text-sm"
            data-ocid="admin.client_portal.deliverable_filetype_input"
          />
          <div className="sm:col-span-2">
            <Input
              placeholder="Description"
              value={delivForm.description}
              onChange={(e) =>
                setDelivForm({ ...delivForm, description: e.target.value })
              }
              className="text-sm"
              data-ocid="admin.client_portal.deliverable_description_input"
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              placeholder="URL (optional — link or download URL)"
              value={delivForm.url}
              onChange={(e) =>
                setDelivForm({ ...delivForm, url: e.target.value })
              }
              className="text-sm"
              data-ocid="admin.client_portal.deliverable_url_input"
            />
          </div>
          <div className="sm:col-span-2 flex items-center justify-between bg-card rounded-lg border border-border px-3 py-2.5">
            <Label className="text-xs text-muted-foreground font-body">
              Available to client now
            </Label>
            <Switch
              checked={delivForm.isAvailable}
              onCheckedChange={(v) =>
                setDelivForm({ ...delivForm, isAvailable: v })
              }
              data-ocid="admin.client_portal.deliverable_available_switch"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => addDeliverableMutation.mutate()}
            disabled={addDeliverableMutation.isPending || !delivForm.title}
            className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 font-semibold gap-1.5"
            data-ocid="admin.client_portal.add_deliverable_button"
          >
            {addDeliverableMutation.isPending ? (
              <RefreshCw size={12} className="animate-spin" />
            ) : (
              <Upload size={12} />
            )}{" "}
            Add Deliverable
          </Button>
        </div>
      </div>

      {/* Next steps */}
      <div className="bg-background/50 rounded-xl border border-border p-4 space-y-3">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-body font-semibold">
          Manage Next Steps
        </p>

        {sortedSteps.length > 0 && (
          <div className="space-y-2">
            {sortedSteps.map((step, i) => (
              <div
                key={step.id}
                className="flex items-center gap-3 bg-card rounded-lg border border-border px-3 py-2.5"
                data-ocid={`admin.client_portal.step.item.${i + 1}`}
              >
                <button
                  type="button"
                  onClick={() =>
                    toggleStepMutation.mutate({
                      stepId: step.id,
                      current: step.isCompleted,
                    })
                  }
                  aria-label={
                    step.isCompleted ? "Mark incomplete" : "Mark complete"
                  }
                  className="flex-shrink-0 hover:opacity-70 transition-opacity"
                  data-ocid={`admin.client_portal.step.toggle.${i + 1}`}
                >
                  {step.isCompleted ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : (
                    <Circle size={16} className="text-muted-foreground/40" />
                  )}
                </button>
                <span
                  className={`text-xs font-body flex-1 ${
                    step.isCompleted
                      ? "line-through text-muted-foreground/60"
                      : "text-foreground"
                  }`}
                >
                  {step.description}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="Add a next step description..."
            value={stepDesc}
            onChange={(e) => setStepDesc(e.target.value)}
            className="text-sm flex-1"
            data-ocid="admin.client_portal.step_input"
            onKeyDown={(e) => {
              if (e.key === "Enter" && stepDesc.trim())
                addStepMutation.mutate();
            }}
          />
          <Button
            size="sm"
            onClick={() => addStepMutation.mutate()}
            disabled={addStepMutation.isPending || !stepDesc.trim()}
            className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 font-semibold gap-1"
            data-ocid="admin.client_portal.add_step_button"
          >
            {addStepMutation.isPending ? (
              <RefreshCw size={12} className="animate-spin" />
            ) : (
              <Plus size={12} />
            )}{" "}
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Project row ───────────────────────────────────────────────────────────────
function ProjectRow({
  project,
  index,
  onRefresh,
}: {
  project: ClientProject;
  index: number;
  onRefresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const statusConfig = getStatusConfig(project.status);

  return (
    <div
      className="bg-card border border-border rounded-2xl overflow-hidden"
      data-ocid={`admin.client_portal.project.item.${index + 1}`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start sm:items-center gap-3 px-5 py-4 hover:bg-muted/10 transition-colors text-left"
        data-ocid={`admin.client_portal.project.toggle.${index + 1}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-display font-semibold text-foreground text-sm truncate">
              {project.projectTitle}
            </span>
            <Badge
              className={`border text-[10px] px-2 py-0 font-body font-semibold flex-shrink-0 ${statusConfig.badgeClass}`}
            >
              {statusConfig.label}
            </Badge>
            <Badge className="bg-muted border border-border text-muted-foreground text-[10px] px-2 py-0 font-body flex-shrink-0">
              {getTierLabel(project.tier)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-body">
            {project.clientName} · {project.clientEmail}
          </p>
          <p className="text-[11px] text-muted-foreground/50 font-body mt-0.5">
            Started {formatDate(project.startDate)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex flex-col items-end gap-1 text-right">
            <span className="text-xs text-muted-foreground font-body">
              {project.updates.filter((u) => u.isPublished).length} updates
            </span>
            <span className="text-xs text-muted-foreground font-body">
              {project.deliverables.filter((d) => d.isAvailable).length}/
              {project.deliverables.length} deliverables
            </span>
          </div>
          {open ? (
            <ChevronDown size={16} className="text-muted-foreground" />
          ) : (
            <ChevronRight size={16} className="text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-border">
              <ProjectDetailPanel project={project} onRefresh={onRefresh} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function AdminClientPortal() {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ClientProjectStatus | "all">(
    "all",
  );
  const [filterTier, setFilterTier] = useState<ConsultingTier | "all">("all");

  const { data: projectsResult, isLoading } = useQuery({
    queryKey: ["adminAllProjects"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.adminGetAllProjects();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30 * 1000,
  });

  const projects: ClientProject[] =
    projectsResult?.__kind__ === "ok" ? projectsResult.ok : [];

  const filtered = projects.filter((p) => {
    const matchSearch =
      !search ||
      p.projectTitle.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase()) ||
      p.clientEmail.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const matchTier = filterTier === "all" || p.tier === filterTier;
    return matchSearch && matchStatus && matchTier;
  });

  const sorted = [...filtered].sort((a, b) =>
    Number(b.updatedAt - a.updatedAt),
  );

  function refetch() {
    queryClient.invalidateQueries({ queryKey: ["adminAllProjects"] });
  }

  return (
    <div className="space-y-6" data-ocid="admin.client_portal">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-foreground text-xl">
            Client Portal
          </h2>
          <p className="text-muted-foreground text-sm font-body mt-0.5">
            Manage client projects, updates, and deliverables.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/10 text-primary border border-primary/20 font-body font-semibold px-3 py-1">
            <Users size={12} className="mr-1.5 inline" />
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={refetch}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Refresh projects"
            data-ocid="admin.client_portal.refresh_button"
          >
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      {/* Create project */}
      <CreateProjectForm onCreated={refetch} />

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search by project, client name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
            data-ocid="admin.client_portal.search_input"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>
        <Select
          value={filterStatus}
          onValueChange={(v) =>
            setFilterStatus(v as ClientProjectStatus | "all")
          }
        >
          <SelectTrigger
            className="w-40 text-sm"
            data-ocid="admin.client_portal.filter_status"
          >
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterTier}
          onValueChange={(v) => setFilterTier(v as ConsultingTier | "all")}
        >
          <SelectTrigger
            className="w-44 text-sm"
            data-ocid="admin.client_portal.filter_tier"
          >
            <SelectValue placeholder="All tiers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            {TIER_OPTIONS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Projects list */}
      {isLoading ? (
        <div
          className="space-y-3"
          data-ocid="admin.client_portal.loading_state"
        >
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div
          className="bg-card border border-border rounded-2xl p-12 text-center"
          data-ocid="admin.client_portal.empty_state"
        >
          <Folder size={36} className="text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-body text-sm">
            {projects.length === 0
              ? "No client projects yet. Create the first one above."
              : "No projects match your search or filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((project, index) => (
            <ProjectRow
              key={project.id}
              project={project}
              index={index}
              onRefresh={refetch}
            />
          ))}
        </div>
      )}
    </div>
  );
}
