import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Crown,
  ExternalLink,
  Loader2,
  LogIn,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
import { createActor } from "../backend";
import { ConsultingTier } from "../backend.d";
import type { ClientProject } from "../backend.d";
import { Layout } from "../components/Layout";
import { DeliverablesSection } from "../components/client-portal/DeliverablesSection";
import { NextStepsSection } from "../components/client-portal/NextStepsSection";
import {
  ProjectStatusCard,
  getStatusConfig,
} from "../components/client-portal/ProjectStatusCard";
import { ProjectUpdates } from "../components/client-portal/ProjectUpdates";

// ── Tier label ────────────────────────────────────────────────────────────────
function getTierLabel(tier: ConsultingTier): string {
  switch (tier) {
    case ConsultingTier.BusinessDevelopment:
      return "Business Development";
    case ConsultingTier.Advisory:
      return "Advisory / Mentorship";
    case ConsultingTier.BakerySetup:
      return "Bakery Setup";
    case ConsultingTier.BakerySetupAndRecipes:
      return "Bakery Setup + Recipes";
    default:
      return "Consulting";
  }
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div
      className="max-w-3xl mx-auto px-4 py-10 space-y-6"
      data-ocid="client.loading_state"
    >
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-5 w-1/3" />
      <div className="grid grid-cols-1 gap-4">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    </div>
  );
}

// ── Login prompt ──────────────────────────────────────────────────────────────
function LoginPrompt() {
  const { login } = useInternetIdentity();
  return (
    <div
      className="min-h-[70vh] flex items-center justify-center px-4"
      data-ocid="client.login_prompt"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center space-y-7 bg-card border border-border rounded-2xl p-10"
      >
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Shield className="w-7 h-7 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Builder's Dashboard
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed font-body">
            This is your private client portal. Sign in with Internet Identity
            to access your project status, updates, and deliverables.
          </p>
        </div>
        <Button
          onClick={() => login()}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
          data-ocid="client.login_button"
        >
          <LogIn size={16} />
          Sign In with Internet Identity
        </Button>
        <p className="text-xs text-muted-foreground font-body">
          Your identity is secure and private.
        </p>
      </motion.div>
    </div>
  );
}

// ── No project found ──────────────────────────────────────────────────────────
function NoProjectFound() {
  return (
    <div
      className="min-h-[60vh] flex items-center justify-center px-4"
      data-ocid="client.no_project_state"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center space-y-6 bg-card border border-border rounded-2xl p-10"
      >
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Crown className="w-6 h-6 text-primary" />
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="font-display text-xl font-bold text-foreground">
            Your project hasn't been set up yet.
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed font-body">
            Chefiyke will connect with you soon to get your project configured.
            If you've already been in contact, reach out via WhatsApp.
          </p>
        </div>
        <Button
          asChild
          className="w-full bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 font-semibold gap-2"
          data-ocid="client.whatsapp_button"
        >
          <a
            href="https://wa.me/2348000000000"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={15} />
            Message Chefiyke on WhatsApp
          </a>
        </Button>
      </motion.div>
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────
function ErrorState({ message }: { message: string }) {
  return (
    <div
      className="min-h-[50vh] flex items-center justify-center px-4"
      data-ocid="client.error_state"
    >
      <div className="max-w-md w-full text-center space-y-4 bg-card border border-border rounded-2xl p-8">
        <AlertCircle size={36} className="text-destructive/60 mx-auto" />
        <h2 className="font-display text-lg font-bold text-foreground">
          Could not load your project
        </h2>
        <p className="text-muted-foreground text-sm font-body">{message}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          data-ocid="client.error_retry_button"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}

// ── Client portal content ─────────────────────────────────────────────────────
function ClientPortalContent({ project }: { project: ClientProject }) {
  const statusConfig = getStatusConfig(project.status);
  const tierLabel = getTierLabel(project.tier);

  return (
    <div
      className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8"
      data-ocid="client.portal"
    >
      {/* Project header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-3"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-primary/20 text-primary border border-primary/30 text-xs font-semibold px-3 py-1 font-body uppercase tracking-wider">
            {tierLabel}
          </Badge>
          <Badge
            className={`border text-xs font-semibold px-3 py-1 font-body ${statusConfig.badgeClass}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${statusConfig.dotClass}`}
            />
            {statusConfig.label}
          </Badge>
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight">
          {project.projectTitle}
        </h1>

        {project.projectDescription && (
          <p className="text-muted-foreground font-body text-sm leading-relaxed max-w-2xl">
            {project.projectDescription}
          </p>
        )}

        <div className="flex items-center gap-2 pt-1">
          <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Crown size={11} className="text-primary" />
          </div>
          <span className="text-xs text-muted-foreground font-body">
            Welcome,{" "}
            <span className="text-foreground font-semibold">
              {project.clientName}
            </span>
          </span>
        </div>
      </motion.div>

      {/* Status card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <ProjectStatusCard project={project} />
      </motion.div>

      {/* Updates */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18 }}
      >
        <ProjectUpdates updates={project.updates} />
      </motion.div>

      {/* Deliverables */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.24 }}
      >
        <DeliverablesSection deliverables={project.deliverables} />
      </motion.div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <NextStepsSection nextSteps={project.nextSteps} />
      </motion.div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function BuildersDashboardContent() {
  const { isAuthenticated, isInitializing } = useInternetIdentity();
  const { actor, isFetching } = useActor(createActor);

  const {
    data: projectResult,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["clientProject", isAuthenticated],
    queryFn: async () => {
      if (!actor) return null;
      return actor.clientGetMyProject();
    },
    enabled: isAuthenticated && !isFetching && !isInitializing,
    staleTime: 60 * 1000,
    retry: 1,
  });

  if (isInitializing) {
    return <DashboardSkeleton />;
  }

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  if (isLoading || isFetching) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        message={
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while loading your project."
        }
      />
    );
  }

  if (!projectResult || projectResult.__kind__ === "err") {
    return <NoProjectFound />;
  }

  return <ClientPortalContent project={projectResult.ok} />;
}

export function BuildersDashboardPage() {
  const { isInitializing } = useInternetIdentity();

  return (
    <Layout>
      {isInitializing ? (
        <div
          className="min-h-[60vh] flex items-center justify-center"
          data-ocid="client.initializing_state"
        >
          <Loader2 size={24} className="text-primary animate-spin" />
        </div>
      ) : (
        <BuildersDashboardContent />
      )}
    </Layout>
  );
}
