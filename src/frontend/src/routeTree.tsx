import { Skeleton } from "@/components/ui/skeleton";
import { Outlet, createRootRoute, createRoute } from "@tanstack/react-router";
import { Component, Suspense, lazy } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { UserRole } from "./backend.d";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Pages — eagerly loaded
import { HomePage } from "./pages/HomePage";

// Pages — lazy loaded
const ConsultingPage = lazy(() =>
  import("./pages/ConsultingPage").then((m) => ({
    default: m.ConsultingPage,
  })),
);
const AdminPage = lazy(() =>
  import("./pages/AdminPage").then((m) => ({ default: m.AdminPage })),
);
const GalleryPage = lazy(() =>
  import("./pages/GalleryPage").then((m) => ({ default: m.GalleryPage })),
);
const VideosPage = lazy(() =>
  import("./pages/VideosPage").then((m) => ({ default: m.VideosPage })),
);
const AffiliatePage = lazy(() =>
  import("./pages/AffiliatePage").then((m) => ({
    default: m.AffiliatePage,
  })),
);
const AffiliateSignupPage = lazy(() =>
  import("./pages/AffiliateSignupPage").then((m) => ({
    default: m.AffiliateSignupPage,
  })),
);
const AccessDeniedPage = lazy(() =>
  import("./pages/AccessDeniedPage").then((m) => ({
    default: m.AccessDeniedPage,
  })),
);
const StaffDashboardPage = lazy(() =>
  import("./pages/StaffDashboardPage").then((m) => ({
    default: m.StaffDashboardPage,
  })),
);
const BuildersDashboardPage = lazy(() =>
  import("./pages/BuildersDashboardPage").then((m) => ({
    default: m.BuildersDashboardPage,
  })),
);
const SystemsPage = lazy(() =>
  import("./pages/SystemsPage").then((m) => ({ default: m.SystemsPage })),
);
const TermsPage = lazy(() =>
  import("./pages/TermsPage").then((m) => ({ default: m.TermsPage })),
);
const PrivacyPage = lazy(() =>
  import("./pages/PrivacyPage").then((m) => ({ default: m.PrivacyPage })),
);
const DisclaimerPage = lazy(() =>
  import("./pages/DisclaimerPage").then((m) => ({ default: m.DisclaimerPage })),
);
const RefundPage = lazy(() =>
  import("./pages/RefundPage").then((m) => ({ default: m.RefundPage })),
);

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex flex-col gap-4 p-8">
      <Skeleton className="h-16 w-full max-w-2xl" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-24 w-full max-w-lg" />
    </div>
  );
}

// Route-level error boundary — prevents blank pages on lazy-load or render errors
class RouteErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Errors are captured in state via getDerivedStateFromError; no logging in production
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 gap-4 text-center">
          <h2 className="font-display text-xl font-bold text-foreground">
            Something went wrong loading this page
          </h2>
          <p className="text-muted-foreground text-sm max-w-md">
            {this.state.message ||
              "An unexpected error occurred. Please refresh the page."}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-md border border-border text-sm text-foreground hover:bg-muted transition-colors"
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <RouteErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </RouteErrorBoundary>
  ),
});

// Public routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const consultingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/consulting",
  component: ConsultingPage,
});

const galleryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/gallery",
  component: GalleryPage,
});

const videosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/videos",
  component: VideosPage,
});

const accessDeniedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/access-denied",
  component: AccessDeniedPage,
});

// Public affiliate signup (no auth required)
const affiliateSignupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/affiliate/signup",
  component: AffiliateSignupPage,
});

// /admin — protected: owner/admin only (isOwnerEmail bypass in ProtectedRoute handles Chefiyke@gmail.com)
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => (
    <ProtectedRoute requiredRoles={[UserRole.PlatformOwner, UserRole.Admin]}>
      <AdminPage />
    </ProtectedRoute>
  ),
});

// /virtual-office — primary admin route alias (same as /admin)
const virtualOfficeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/virtual-office",
  component: () => (
    <ProtectedRoute requiredRoles={[UserRole.PlatformOwner, UserRole.Admin]}>
      <AdminPage />
    </ProtectedRoute>
  ),
});

// /affiliate/dashboard — canonical protected affiliate route
const affiliateDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/affiliate/dashboard",
  component: () => (
    <ProtectedRoute
      requiredRoles={[
        UserRole.Affiliate,
        UserRole.PlatformOwner,
        UserRole.Admin,
      ]}
    >
      <AffiliatePage />
    </ProtectedRoute>
  ),
});

// /affiliate — legacy support
const affiliateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/affiliate",
  component: () => (
    <ProtectedRoute
      requiredRoles={[
        UserRole.Affiliate,
        UserRole.PlatformOwner,
        UserRole.Admin,
      ]}
    >
      <AffiliatePage />
    </ProtectedRoute>
  ),
});

const staffRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/staff",
  component: () => (
    <ProtectedRoute
      requiredRoles={[UserRole.Staff, UserRole.Admin, UserRole.PlatformOwner]}
    >
      <StaffDashboardPage />
    </ProtectedRoute>
  ),
});

// /builder-dashboard — any authenticated user sees their own project
const buildersDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/builder-dashboard",
  component: BuildersDashboardPage,
});

// /systems — public systems portfolio page
const systemsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/systems",
  component: SystemsPage,
});

// Legal pages — public
const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  component: TermsPage,
});

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy",
  component: PrivacyPage,
});

const disclaimerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/disclaimer",
  component: DisclaimerPage,
});

const refundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/refund",
  component: RefundPage,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  consultingRoute,
  galleryRoute,
  videosRoute,
  accessDeniedRoute,
  affiliateSignupRoute,
  adminRoute,
  virtualOfficeRoute,
  affiliateDashboardRoute,
  affiliateRoute,
  staffRoute,
  buildersDashboardRoute,
  systemsRoute,
  termsRoute,
  privacyRoute,
  disclaimerRoute,
  refundRoute,
]);
