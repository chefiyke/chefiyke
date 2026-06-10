import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActor } from "@caffeineai/core-infrastructure";
import { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, Plus, Trash2, UserCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type {
  ActivityLog,
  Permission,
  StaffUser,
  UserRole,
} from "../../backend";
import { SectionHeader, fieldClass, formatDate } from "./AdminShared";

const ALL_PERMISSIONS: { id: Permission; label: string }[] = [
  { id: "CanViewDashboard" as Permission, label: "Dashboard View" },
  { id: "CanEditContent" as Permission, label: "Content Edit" },
  { id: "CanManageMedia" as Permission, label: "Media Manage" },
  { id: "CanViewReports" as Permission, label: "Finance View" },
  { id: "CanManageTraining" as Permission, label: "Training Manage" },
  { id: "CanManageLeads" as Permission, label: "Leads Manage" },
  { id: "CanManageSales" as Permission, label: "Sales Manage" },
  { id: "CanManageAffiliates" as Permission, label: "Affiliates Manage" },
  { id: "CanManageStaff" as Permission, label: "Staff Manage" },
  { id: "CanManageSecurity" as Permission, label: "Security Manage" },
];

function statusBadge(status: string) {
  if (status === "active")
    return (
      <Badge className="bg-green-400/15 text-green-400 border-green-400/30 text-[10px]">
        Active
      </Badge>
    );
  if (status === "inactive")
    return (
      <Badge className="bg-muted text-muted-foreground text-[10px]">
        Inactive
      </Badge>
    );
  return (
    <Badge className="bg-yellow-400/15 text-yellow-400 border-yellow-400/30 text-[10px]">
      Pending
    </Badge>
  );
}

function AddStaffModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (email: string, role: string, permissions: Permission[]) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Staff");
  const [perms, setPerms] = useState<Permission[]>([]);

  function toggle(p: Permission) {
    setPerms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }

  function handleSave() {
    if (!email.trim()) return;
    onSave(email.trim(), role, perms);
    setEmail("");
    setRole("Staff");
    setPerms([]);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="bg-card border-border max-w-md"
        data-ocid="admin.staff.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">
            Add Staff Member
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label
              htmlFor="staff-email"
              className="font-body text-xs text-muted-foreground mb-1.5 block"
            >
              Email Address
            </label>
            <input
              id="staff-email"
              className={fieldClass()}
              placeholder="staff@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-ocid="admin.staff.email_input"
            />
          </div>
          <div>
            <p className="font-body text-xs text-muted-foreground mb-1.5">
              Role
            </p>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger
                className="bg-background border-input"
                data-ocid="admin.staff.role_select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="font-body text-xs text-muted-foreground mb-2">
              Permissions
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ALL_PERMISSIONS.map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`perm-${p.id}`}
                    checked={perms.includes(p.id)}
                    onCheckedChange={() => toggle(p.id)}
                    className="border-border"
                  />
                  <label
                    htmlFor={`perm-${p.id}`}
                    className="font-body text-xs text-foreground cursor-pointer"
                  >
                    {p.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1"
              data-ocid="admin.staff.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="admin.staff.submit_button"
            >
              Add Staff
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AdminStaff() {
  const { actor, isFetching } = useActor(createActor);
  const enabled = !!actor && !isFetching;
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("members");

  const { data: staff = [] } = useQuery<StaffUser[]>({
    queryKey: ["admin", "allStaff"],
    queryFn: async () => {
      const [admins, staffMembers] = await Promise.all([
        actor!.listUsersByRole("Admin" as unknown as UserRole),
        actor!.listUsersByRole("Staff" as unknown as UserRole),
      ]);
      return [...admins, ...staffMembers];
    },
    enabled,
  });

  const { data: activityLogs = [] } = useQuery<ActivityLog[]>({
    queryKey: ["admin", "activityLogStaff"],
    queryFn: () => actor!.getActivityLog(BigInt(50)),
    enabled,
  });

  const assignMutation = useMutation({
    mutationFn: async ({
      email,
      role,
      permissions,
    }: {
      email: string;
      role: string;
      permissions: Permission[];
    }) => {
      // Use a placeholder principal for invite flow
      const target = Principal.fromText("2vxsx-fae");
      return actor!.assignUserRole(
        target,
        role as unknown as UserRole,
        email,
        permissions,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "allStaff"] });
      setModalOpen(false);
      toast.success("Staff member invited successfully");
    },
    onError: () => toast.error("Failed to invite staff member"),
  });

  const revokeMutation = useMutation({
    mutationFn: (principal: Principal) => actor!.revokeUserRole(principal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "allStaff"] });
      toast.success("Staff member deactivated");
    },
    onError: () => toast.error("Failed to deactivate staff member"),
  });

  return (
    <div data-ocid="admin.staff.section">
      <div className="flex items-center justify-between mb-6">
        <SectionHeader
          title="Staff Management"
          subtitle="Manage team members, roles, and permissions"
        />
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shrink-0"
          data-ocid="admin.staff.add_button"
        >
          <Plus size={14} /> Add Staff
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card border border-border mb-6">
          <TabsTrigger
            value="members"
            className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary text-xs"
            data-ocid="admin.staff.members_tab"
          >
            <UserCheck size={13} className="mr-1.5" /> Members
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary text-xs"
            data-ocid="admin.staff.activity_tab"
          >
            <Activity size={13} className="mr-1.5" /> Activity Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          {staff.length === 0 ? (
            <div
              className="bg-card border border-border rounded-xl p-10 text-center"
              data-ocid="admin.staff.empty_state"
            >
              <UserCheck
                size={32}
                className="text-muted-foreground mx-auto mb-3"
              />
              <p className="font-body text-sm text-muted-foreground">
                No staff members yet. Add your first team member.
              </p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-ocid="admin.staff.table">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-3 font-body text-xs text-muted-foreground uppercase tracking-wider">
                        Email
                      </th>
                      <th className="text-left px-4 py-3 font-body text-xs text-muted-foreground uppercase tracking-wider">
                        Role
                      </th>
                      <th className="text-left px-4 py-3 font-body text-xs text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 font-body text-xs text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                        Last Login
                      </th>
                      <th className="text-left px-4 py-3 font-body text-xs text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                        Permissions
                      </th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((member, i) => (
                      <tr
                        key={member.id.toString()}
                        className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                        data-ocid={`admin.staff.item.${i + 1}`}
                      >
                        <td className="px-4 py-3 font-body text-xs text-foreground truncate max-w-[160px]">
                          {member.email}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-body text-xs text-[#B8960C] font-semibold">
                            {member.role as unknown as string}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {statusBadge(member.status as unknown as string)}
                        </td>
                        <td className="px-4 py-3 font-body text-xs text-muted-foreground hidden md:table-cell">
                          {member.lastLoginAt
                            ? formatDate(member.lastLoginAt)
                            : "Never"}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {member.permissions.slice(0, 3).map((p) => (
                              <span
                                key={p as unknown as string}
                                className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded"
                              >
                                {(p as unknown as string).replace("Can", "")}
                              </span>
                            ))}
                            {member.permissions.length > 3 && (
                              <span className="text-[10px] text-muted-foreground">
                                +{member.permissions.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => revokeMutation.mutate(member.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2"
                            data-ocid={`admin.staff.delete_button.${i + 1}`}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {activityLogs.length === 0 ? (
              <div
                className="p-10 text-center"
                data-ocid="admin.staff.activity.empty_state"
              >
                <p className="font-body text-sm text-muted-foreground">
                  No activity logged yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {activityLogs.map((log, i) => (
                  <div
                    key={log.id}
                    className="px-4 py-3"
                    data-ocid={`admin.staff.activity.item.${i + 1}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-body text-xs text-foreground">
                          {log.action}
                        </p>
                        <p className="font-body text-[11px] text-muted-foreground mt-0.5">
                          {log.actorRole as unknown as string} · {log.target}
                        </p>
                      </div>
                      <span className="font-body text-[11px] text-muted-foreground shrink-0">
                        {new Date(
                          Number(log.timestamp) / 1_000_000,
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <AddStaffModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(email, role, permissions) =>
          assignMutation.mutate({ email, role, permissions })
        }
      />
    </div>
  );
}
