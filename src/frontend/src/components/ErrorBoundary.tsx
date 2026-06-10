import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
}

interface GlobalErrorBoundaryProps {
  children: ReactNode;
}

/**
 * Global error boundary — catches any unhandled React render errors.
 * Shows a safe, friendly message with no stack traces or internal details.
 */
export class GlobalErrorBoundary extends Component<
  GlobalErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Errors captured silently — no logging to console in production.
    // Full details are available in the canister error logs if needed.
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen bg-background flex flex-col items-center justify-center p-8 gap-6"
          data-ocid="app.error_state"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <span className="text-2xl" aria-hidden="true">
              ⚠
            </span>
          </div>
          <div className="text-center space-y-2 max-w-md">
            <h2 className="font-display text-xl font-bold text-foreground">
              Something went wrong
            </h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              An unexpected error occurred. Please refresh the page to continue.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-ocid="app.error_state.reload_button"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
