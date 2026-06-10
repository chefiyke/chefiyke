import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  DollarSign,
  FileEdit,
  GraduationCap,
  Image,
  Lock,
  LogOut,
  ShieldAlert,
  Users,
} from "lucide-react";
import { Suspense, lazy, useState } from "react";
import { createActor } from "../backend";
import type { Permission, StaffUser, UserRole } from "../backend";
import { Layout } from "../components/Layout";
import { useRole } from "../hooks/useRole";

const AdminContentEditor = lazy(() =>
  import("../components/admin/AdminContentEditor").then((m) => ({
    default: m.AdminContentEditor,
  })),
);
const AdminMediaManager = lazy(() =>
  import("../components/admin/AdminMediaManager").then((m) => ({
    default: m.AdminMediaManager,
  })),
);
const AdminFinance = lazy(() =>
  import("../components/admin/AdminFinance").then((m) => ({
    default: m.AdminFinance,
  })),
);
const AdminTraining = lazy(() =>
  import("../components/admin/AdminTraining").then((m) => ({
    default: m.AdminTraining,
  })),
);
const AdminLeads = lazy(() =>
  import("../components/admin/AdminLeads").then((m) => ({
    default: m.AdminLeads,
  })),
);
const AdminSales = lazy(() =>
  import("../components/admin/AdminSales").then((m) => ({
    default: m.AdminSales,
  })),
);

interface ModuleCard {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  permission: Permission;
  component: React.ReactNode;
}

const ALL_MODULES: ModuleCard[] = [
  {
    id: "content",
    label: "Content Editor",
    description: "Edit page content, hero slides, and sections",
    icon: <FileEdit size={22} className="text-primary" />,
    permission: "CanEditContent" as Permission,
    component: <AdminContentEditor />,
  },
  {
    id: "media",
    label: "Media Manager",
    description: "Upload and manage images and videos",
    icon: <Image size={22} className="text-primary" />,
    permission: "CanManageMedia" as Permission,
    component: <AdminMediaManager />,
  },
  {
    id: "finance",
    label: "Finance",
    description: "View revenue, expenses, and financial reports",
    icon: <DollarSign size={22} className="text-primary" />,
    permission: "CanViewReports" as Permission,
    component: <AdminFinance />,
  },
  {
    id: "training",
    label: "Training",
    description: "Manage training modules and materials",
    icon: <GraduationCap size={22} className="text-primary" />,
    permission: "CanManageTraining" as Permission,
    component: <AdminTraining />,
  },
  {
    id: "leads",
    label: "Leads",
    description: "View and manage incoming leads and inquiries",
    icon: <Users size={22} className="text-primary" />,
    permission: "CanManageLeads" as Permission,
    component: <AdminLeads />,
  },
  {
    id: "sales",
    label: "Sales",
    description: "Track orders and payment history",
    icon: <BarChart3 size={22} className="text-primary" />,
    permission: "CanManageSales" as Permission,
    component: <AdminSales />,
  },
];

function DashboardLoadingSkeleton() {
  return (
    <div
      className="max-w-4xl mx-auto px-4 py-12 space-y-6"
      data-ocid="staff.loading_state"
    >
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function StaffDashboardContent() {
  const { isAuthenticated, isInitializing, login, clear } =
    useInternetIdentity();
  const { actor, isFetching } = useActor(createActor);
  const { role, permissions, isStaff, isLoading: roleLoading } = useRole();

  const enabled = !!actor && !isFetching && isAuthenticated;

  const { data: staffList = [], isLoading: staffLoading } = useQuery<
    StaffUser[]
  >({
    queryKey: ["staffSelf"],
    queryFn: () => actor!.listUsersByRole("Staff" as unknown as UserRole),
    enabled: enabled && !!role,
  });

  const isLoading = isInitializing || roleLoading || staffLoading;
  const [activeModule, setActiveModule] = useState<string | null>(null);

  if (isLoading) return <DashboardLoadingSkeleton />;

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-[70vh] flex items-center justify-center px-4"
        data-ocid="staff.auth_gate"
      >
        <div className="bg-card border border-border rounded-2xl p-10 max-w-sm w-full text-center">
          <Lock className="text-primary mx-auto mb-4" size={36} />
          <h1 className="font-display font-bold text-xl text-foreground mb-2">
            Staff Access
          </h1>
          <p className="font-body text-sm text-muted-foreground mb-6">
            Sign in with Internet Identity to access your dashboard.
          </p>
          <Button
            onClick={login}
            className="w-full"
            data-ocid="staff.login_button"
          >
            Sign In with Internet Identity
          </Button>
        </div>
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div
        className="min-h-[70vh] flex items-center justify-center px-4"
        data-ocid="staff.access_denied"
      >
        <div className="bg-card border border-border rounded-2xl p-10 max-w-sm w-full text-center">
          <ShieldAlert className="text-destructive mx-auto mb-4" size={36} />
          <h1 className="font-display font-bold text-xl text-foreground mb-2">
            Access Denied
          </h1>
          <p className="font-body text-sm text-muted-foreground">
            You do not have staff access to this dashboard.
          </p>
        </div>
      </div>
    );
  }

  const roleStr = role as unknown as string;
  const isOwnerOrAdmin = roleStr === "PlatformOwner" || roleStr === "Admin";

  // Staff with explicit permissions from their profile, or full access for owner/admin
  const myProfile = staffList[0];
  const myPermissions: Permission[] = isOwnerOrAdmin
    ? ALL_MODULES.map((m) => m.permission)
    : (myProfile?.permissions ?? permissions);

  const allowedModules = ALL_MODULES.filter(
    (m) => isOwnerOrAdmin || myPermissions.includes(m.permission),
  );

  const activeModuleData = allowedModules.find((m) => m.id === activeModule);

  return (
    <div className="min-h-screen bg-background" data-ocid="staff.dashboard">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary font-body font-semibold">
              Staff
            </p>
            <h1 className="font-display font-bold text-lg text-foreground">
              Welcome back
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-body font-semibold text-[#B8960C] bg-[#B8960C]/10 px-3 py-1 rounded-full">
              {roleStr}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              className="gap-1.5 text-muted-foreground hover:text-foreground text-xs"
              data-ocid="staff.logout_button"
            >
              <LogOut size={14} /> Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {activeModule && (
          <button
            type="button"
            onClick={() => setActiveModule(null)}
            className="mb-6 text-xs font-body text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
            data-ocid="staff.back_button"
          >
            ← Back to Dashboard
          </button>
        )}

        {!activeModule && (
          <>
            <div className="mb-8">
              <h2 className="font-display font-bold text-2xl text-foreground mb-1">
                Your Modules
              </h2>
              <p className="font-body text-sm text-muted-foreground">
                Select a module to get started.
              </p>
              <div className="mt-3 w-10 h-0.5 bg-primary rounded-full" />
            </div>

            {allowedModules.length === 0 ? (
              <div
                className="bg-card border border-border rounded-xl p-10 text-center"
                data-ocid="staff.modules.empty_state"
              >
                <ShieldAlert
                  size={32}
                  className="text-muted-foreground mx-auto mb-3"
                />
                <p className="font-body text-sm text-muted-foreground">
                  No modules assigned yet. Contact your administrator.
                </p>
              </div>
            ) : (
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                data-ocid="staff.modules.list"
              >
                {allowedModules.map((mod, i) => (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => setActiveModule(mod.id)}
                    className="bg-card border border-border rounded-xl p-6 text-left hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 group"
                    data-ocid={`staff.modules.item.${i + 1}`}
                  >
                    <div className="mb-4 p-2.5 bg-primary/10 rounded-lg w-fit group-hover:bg-primary/15 transition-colors">
                      {mod.icon}
                    </div>
                    <h3 className="font-display font-semibold text-base text-foreground mb-1">
                      {mod.label}
                    </h3>
                    <p className="font-body text-xs text-muted-foreground leading-relaxed">
                      {mod.description}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {activeModule && activeModuleData && (
          <Suspense fallback={<DashboardLoadingSkeleton />}>
            {activeModuleData.component}
          </Suspense>
        )}
      </div>
    </div>
  );
}

export function StaffDashboardPage() {
  return (
    <Layout noFooter>
      <StaffDashboardContent />
    </Layout>
  );
}
