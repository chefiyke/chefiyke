import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  CreditCard,
  FileEdit,
  Home,
  Image,
  LayoutDashboard,
  LogOut,
  Monitor,
  ShieldCheck,
  Video,
} from "lucide-react";
import { Component, useState } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Layout } from "../components/Layout";
import { AdminContactManager } from "../components/admin/AdminContactManager";
import { AdminContentEditor } from "../components/admin/AdminContentEditor";
import { AdminMediaManager } from "../components/admin/AdminMediaManager";
import { AdminOverview } from "../components/admin/AdminOverview";
import { AdminPaymentConfig } from "../components/admin/AdminPaymentConfig";
import { AdminPricing } from "../components/admin/AdminPricing";
import { AdminSettings } from "../components/admin/AdminSettings";
import { AdminSystemsManager } from "../components/admin/AdminSystemsManager";
import { AdminVideoManager } from "../components/admin/AdminVideoManager";
import { useRole } from "../hooks/useRole";

// ── Error Boundary ──────────────────────────────────────────────────────────────────

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class AdminErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Errors captured silently — no logging to console in production.
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 gap-4">
          <ShieldCheck size={48} className="text-primary/40" />
          <h2 className="font-display text-xl font-bold text-foreground">
            Something went wrong
          </h2>
          <p className="text-muted-foreground text-sm text-center max-w-md">
            An unexpected error occurred. Please refresh the page or try again.
          </p>
          <Button
            variant="outline"
            onClick={() => this.setState({ hasError: false, message: "" })}
            data-ocid="admin.error_state.retry_button"
          >
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── 7 Module Tabs ──────────────────────────────────────────────────────────────────────

type AdminTab =
  | "dashboard"
  | "content"
  | "systems"
  | "contacts"
  | "pricing"
  | "media"
  | "settings";

type MediaSubTab = "images" | "videos";

interface NavItem {
  id: AdminTab;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    id: "content",
    label: "Content Editor",
    icon: <FileEdit size={18} />,
  },
  {
    id: "systems",
    label: "Systems Portfolio",
    icon: <Monitor size={18} />,
  },
  {
    id: "contacts",
    label: "Contact Manager",
    icon: <ShieldCheck size={18} />,
  },
  {
    id: "pricing",
    label: "Pricing / Finance",
    icon: <CreditCard size={18} />,
  },
  {
    id: "media",
    label: "Media / Video",
    icon: <Image size={18} />,
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Home size={18} />,
  },
];

// ── AuthGate ─────────────────────────────────────────────────────────────────────────────

function AuthGate({ children }: { children: React.ReactNode }) {
  const {
    isInitializing,
    isAuthenticated,
    isOwnerEmail,
    isAdmin,
    isLoading,
    isClaiming,
    error,
  } = useRole();

  if (isInitializing || isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col gap-4 p-8 items-center justify-center">
        <div className="flex flex-col gap-4 w-full max-w-md">
          <div className="h-16 w-full rounded-lg bg-muted animate-pulse" />
          <div className="h-48 w-full rounded-lg bg-muted animate-pulse" />
          <div className="h-12 w-full rounded-lg bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen bg-background flex flex-col items-center justify-center p-8 gap-4"
        data-ocid="admin.error_state"
      >
        <ShieldCheck size={48} className="text-primary/40" />
        <h2 className="font-display text-xl font-bold text-foreground">
          Failed to verify access
        </h2>
        <p className="text-muted-foreground text-sm text-center max-w-md">
          Could not confirm your role. Please refresh or try logging in again.
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen bg-background flex flex-col items-center justify-center p-8 gap-4"
        data-ocid="admin.auth_required_state"
      >
        <ShieldCheck size={48} className="text-primary/40" />
        <h2 className="font-display text-xl font-bold text-foreground">
          Sign in required
        </h2>
        <p className="text-muted-foreground text-sm text-center max-w-md">
          Please log in with your Internet Identity to access the Virtual
          Office.
        </p>
      </div>
    );
  }

  if (isClaiming) {
    return (
      <div
        className="min-h-screen bg-background flex flex-col items-center justify-center p-8 gap-4"
        data-ocid="admin.claiming_state"
      >
        <div className="flex flex-col gap-4 w-full max-w-md items-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck size={24} className="text-primary animate-pulse" />
          </div>
          <div className="h-3 w-48 rounded-full bg-muted animate-pulse" />
          <p className="font-display text-base font-semibold text-foreground text-center">
            Connecting to your Virtual Office…
          </p>
          <p className="text-muted-foreground text-sm text-center max-w-xs">
            Verifying owner credentials, please wait a moment.
          </p>
        </div>
      </div>
    );
  }

  if (!isOwnerEmail && !isAdmin) {
    return (
      <div
        className="min-h-screen bg-background flex flex-col items-center justify-center p-8 gap-4"
        data-ocid="admin.access_denied_state"
      >
        <ShieldCheck size={48} className="text-destructive/40" />
        <h2 className="font-display text-xl font-bold text-foreground">
          Access Denied
        </h2>
        <p className="text-muted-foreground text-sm text-center max-w-md">
          Your account does not have admin or owner privileges.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

// ── Pricing/Finance combined panel ─────────────────────────────────────────────────

function PricingFinancePanel() {
  const [showPayment, setShowPayment] = useState(false);

  return (
    <div data-ocid="admin.pricing_finance.section">
      <AdminPricing />

      {/* Payment Settings accordion */}
      <div className="mt-8 border-t border-border pt-6">
        <button
          type="button"
          onClick={() => setShowPayment((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-card border border-border rounded-xl hover:bg-primary/5 transition-colors"
          data-ocid="admin.pricing_finance.payment_toggle"
          aria-expanded={showPayment}
        >
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-primary" />
            <span className="font-display font-semibold text-sm text-foreground">
              Payment Settings
            </span>
            <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-body">
              Bank, Paystack, Flutterwave, Crypto
            </span>
          </div>
          {showPayment ? (
            <ChevronDown size={16} className="text-muted-foreground" />
          ) : (
            <ChevronRight size={16} className="text-muted-foreground" />
          )}
        </button>

        {showPayment && (
          <div className="mt-4">
            <AdminPaymentConfig />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Media/Video combined panel ─────────────────────────────────────────────────────

function MediaVideoPanel() {
  const [subTab, setSubTab] = useState<MediaSubTab>("images");
  return (
    <div data-ocid="admin.media_video.section">
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setSubTab("images")}
          data-ocid="admin.media_video.images_tab"
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-body font-medium transition-colors border ${
            subTab === "images"
              ? "bg-primary/15 border-primary/40 text-primary"
              : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Image size={14} /> Images
        </button>
        <button
          type="button"
          onClick={() => setSubTab("videos")}
          data-ocid="admin.media_video.videos_tab"
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-body font-medium transition-colors border ${
            subTab === "videos"
              ? "bg-primary/15 border-primary/40 text-primary"
              : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Video size={14} /> Videos
        </button>
      </div>
      {subTab === "images" ? <AdminMediaManager /> : <AdminVideoManager />}
    </div>
  );
}

// ── Tab content renderer ──────────────────────────────────────────────────────────────────

function TabContent({ tab }: { tab: AdminTab }) {
  switch (tab) {
    case "dashboard":
      return <AdminOverview />;
    case "content":
      return <AdminContentEditor />;
    case "systems":
      return <AdminSystemsManager />;
    case "contacts":
      return <AdminContactManager />;
    case "pricing":
      return <PricingFinancePanel />;
    case "media":
      return <MediaVideoPanel />;
    case "settings":
      return <AdminSettings />;
    default:
      return <AdminOverview />;
  }
}

// ── Dashboard ─────────────────────────────────────────────────────────────────────────────

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [debugOpen, setDebugOpen] = useState(false);
  const { clear } = useInternetIdentity();
  const { isOwnerEmail, ownerDebugInfo } = useRole();

  const activeLabel =
    NAV_ITEMS.find((n) => n.id === activeTab)?.label ?? "Dashboard";

  function selectTab(id: AdminTab) {
    setActiveTab(id);
  }

  return (
    <div
      className="flex min-h-screen bg-background"
      data-ocid="admin.dashboard"
    >
      {/* ── DESKTOP SIDEBAR ────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 bg-card border-r-2 border-primary/20 sticky top-0 h-screen overflow-y-auto">
        {/* Portal header */}
        <div className="px-5 py-5 border-b border-border bg-primary/5">
          <p className="text-[9px] uppercase tracking-widest text-primary font-body font-bold mb-1">
            ⬡ Control Center
          </p>
          <h2 className="font-display font-bold text-sm text-foreground leading-tight">
            Virtual Office
          </h2>
        </div>

        {/* Nav — exactly 7 modules */}
        <nav className="flex-1 px-2 pt-4 pb-2 overflow-y-auto space-y-0.5">
          {NAV_ITEMS.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => selectTab(id)}
              data-ocid={`admin.nav.${id}`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-medium transition-colors text-left border-l-2 ${
                activeTab === id
                  ? "bg-primary/20 text-primary font-semibold border-primary"
                  : "border-transparent text-muted-foreground hover:bg-primary/8 hover:text-foreground"
              }`}
            >
              <span
                className={`flex-shrink-0 ${
                  activeTab === id ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {icon}
              </span>
              <span className="truncate">{label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={clear}
            data-ocid="admin.logout_button"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground text-sm"
          >
            <LogOut size={15} /> Sign Out
          </Button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky utility bar — Back + Return to Homepage — visible on all modules */}
        <div
          className="flex items-center gap-2 px-4 py-2 bg-card/80 border-b border-primary/10 sticky top-0 z-40 backdrop-blur-sm"
          data-ocid="admin.utility_bar"
        >
          <button
            type="button"
            onClick={() => window.history.back()}
            data-ocid="admin.back_button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-medium border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={13} />
            Back
          </button>
          <a
            href="https://www.chefiyke.com"
            data-ocid="admin.return_home_button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-medium border border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-colors"
            style={{ color: "#B8960C" }}
            aria-label="Return to homepage"
          >
            <Home size={13} />
            Return to Homepage
          </a>
          <span className="flex-1" />
          <span className="hidden sm:block text-[10px] uppercase tracking-widest text-muted-foreground/50 font-body font-semibold">
            Virtual Office
          </span>
        </div>

        {/* Desktop top bar */}
        <header className="hidden lg:flex items-center px-6 py-4 bg-card border-b border-border sticky top-[41px] z-30">
          <span className="font-display font-semibold text-sm text-foreground">
            {activeLabel}
          </span>
        </header>

        {/* Mobile top bar */}
        <header
          className="lg:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border sticky top-[41px] z-30"
          data-ocid="admin.mobile_header"
        >
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {NAV_ITEMS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => selectTab(id)}
                data-ocid={`admin.mobile_tab.${id}`}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-body font-medium border transition-colors ${
                  activeTab === id
                    ? "bg-primary/20 border-primary text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            className="text-muted-foreground px-2 ml-2 flex-shrink-0"
            aria-label="Sign out"
            data-ocid="admin.mobile_signout_button"
          >
            <LogOut size={15} />
          </Button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 pb-8">
          {/* Owner debug panel */}
          {isOwnerEmail && (
            <div
              className="mb-4 border border-primary/30 rounded-lg overflow-hidden"
              data-ocid="admin.owner_debug_panel"
            >
              <button
                type="button"
                onClick={() => setDebugOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-primary/8 text-xs font-body font-semibold text-primary hover:bg-primary/12 transition-colors"
                data-ocid="admin.owner_debug_toggle"
                aria-expanded={debugOpen}
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck size={13} />
                  Owner Debug
                </span>
                {debugOpen ? (
                  <ChevronDown size={13} />
                ) : (
                  <ChevronRight size={13} />
                )}
              </button>
              {debugOpen && (
                <div className="px-4 py-3 bg-card/60 space-y-1.5 font-mono text-xs text-muted-foreground">
                  <div className="flex gap-2">
                    <span className="text-foreground/50 min-w-[140px]">
                      Owner email:
                    </span>
                    <span className="text-primary">
                      {ownerDebugInfo.ownerEmail}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-foreground/50 min-w-[140px]">
                      Caller is owner:
                    </span>
                    <span
                      className={
                        ownerDebugInfo.callerIsOwner
                          ? "text-green-500"
                          : "text-destructive"
                      }
                    >
                      {ownerDebugInfo.callerIsOwner ? "✓ YES" : "✗ NO"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-foreground/50 min-w-[140px]">
                      Caller email:
                    </span>
                    <span>{ownerDebugInfo.callerEmail}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-foreground/50 min-w-[140px]">
                      Caller role:
                    </span>
                    <span className="text-primary">
                      {ownerDebugInfo.callerRole}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <TabContent tab={activeTab} />
        </main>
      </div>
    </div>
  );
}

export function AdminPage() {
  return (
    <Layout noFooter>
      <AdminErrorBoundary>
        <AuthGate>
          <AdminDashboard />
        </AuthGate>
      </AdminErrorBoundary>
    </Layout>
  );
}
