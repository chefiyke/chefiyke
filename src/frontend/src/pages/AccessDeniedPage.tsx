import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ShieldX } from "lucide-react";

export function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center px-4"
      data-ocid="access_denied.page"
    >
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ShieldX className="w-12 h-12 text-primary" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <p className="text-primary text-sm font-mono font-semibold tracking-widest uppercase">
            403 — Forbidden
          </p>
          <h1 className="font-display text-4xl font-bold text-foreground leading-tight">
            Access Restricted
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-sm mx-auto">
            You don't have the necessary permissions to view this page. If you
            believe this is an error, please contact the platform owner.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-border max-w-xs mx-auto" />

        {/* CTA */}
        <Button
          onClick={() => navigate({ to: "/" })}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8"
          data-ocid="access_denied.go_home_button"
        >
          Go Back Home
        </Button>
      </div>
    </div>
  );
}
