import { useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Menu } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface NavbarProps {
  onSidebarToggle: () => void;
  sidebarOpen: boolean;
}

export function Navbar({ onSidebarToggle, sidebarOpen }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleBrand = useCallback(() => {
    if (window.location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate({ to: "/" });
    }
  }, [navigate]);

  const handleVirtualOffice = useCallback(() => {
    navigate({ to: "/virtual-office" });
  }, [navigate]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-card/95 backdrop-blur-md border-b border-border shadow-card"
          : "bg-card/80 backdrop-blur-sm border-b border-border/50"
      }`}
      style={{ height: "64px" }}
    >
      <nav
        className="h-full flex items-center justify-between px-4 md:px-6"
        aria-label="Primary navigation"
      >
        {/* Left: sidebar toggle + brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSidebarToggle}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-expanded={sidebarOpen}
            aria-controls="sidebar-nav"
            aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
            data-ocid="nav.sidebar_toggle"
          >
            <Menu size={20} />
          </button>

          <button
            type="button"
            onClick={handleBrand}
            className="font-display font-bold text-xl tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded transition-colors duration-200"
            data-ocid="nav.logo_link"
            aria-label="Chefiyke — go to homepage"
          >
            <span className="text-gradient-accent">Chefiyke</span>
          </button>
        </div>

        {/* Center: Control Center label */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden sm:block">
          <span className="text-xs font-body font-medium tracking-[0.18em] uppercase text-muted-foreground/70 select-none">
            Control&nbsp;Center
          </span>
        </div>

        {/* Right: Virtual Office — always visible (Custos method: auth at route level, not button) */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleVirtualOffice}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:scale-[1.02] active:scale-[0.98]"
            style={{
              color: "#B8960C",
              borderColor: "#B8960C",
              background: "rgba(184,150,12,0.10)",
              boxShadow: "0 0 12px rgba(184,150,12,0.14)",
            }}
            data-ocid="nav.virtual_office_button"
            aria-label="Open Virtual Office"
          >
            <LayoutDashboard size={15} />
            <span>Virtual Office</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
