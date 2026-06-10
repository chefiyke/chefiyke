import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Cog,
  Contact2,
  DollarSign,
  FileEdit,
  Image,
  LayoutDashboard,
  MessageSquare,
  Monitor,
  Phone,
  Star,
  Users,
  X,
} from "lucide-react";
import { useCallback } from "react";
import { useRole } from "../hooks/useRole";
import { scrollToSection } from "../utils/scroll";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  type: "scroll" | "route" | "protected";
  target: string;
  group: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  // Content
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    type: "scroll",
    target: "home",
    group: "Content",
  },
  {
    id: "competence",
    label: "View My Competence",
    icon: Star,
    type: "scroll",
    target: "competence",
    group: "Content",
  },
  {
    id: "how-i-help",
    label: "How I Help",
    icon: MessageSquare,
    type: "scroll",
    target: "how-i-help",
    group: "Content",
  },
  {
    id: "testimonials",
    label: "Testimonials",
    icon: BookOpen,
    type: "scroll",
    target: "testimonials",
    group: "Content",
  },
  {
    id: "systems-built",
    label: "Systems I've Built",
    icon: Monitor,
    type: "route",
    target: "/systems",
    group: "Content",
  },
  // Services
  {
    id: "consulting",
    label: "Consulting",
    icon: Briefcase,
    type: "route",
    target: "/consulting",
    group: "Services",
  },
  {
    id: "work-with-me",
    label: "Work With Me",
    icon: Briefcase,
    type: "scroll",
    target: "work-with-me",
    group: "Services",
  },
  {
    id: "pricing",
    label: "Pricing",
    icon: DollarSign,
    type: "scroll",
    target: "pricing",
    group: "Services",
  },
  // Connect
  {
    id: "contact",
    label: "Contact",
    icon: Phone,
    type: "scroll",
    target: "contact",
    group: "Connect",
  },
  {
    id: "affiliates",
    label: "Affiliates",
    icon: Users,
    type: "route",
    target: "/affiliate/signup",
    group: "Connect",
  },
  {
    id: "images-media",
    label: "Images / Media",
    icon: Image,
    type: "scroll",
    target: "presence",
    group: "Connect",
  },
  // Admin
  {
    id: "content-editor",
    label: "Content Editor",
    icon: FileEdit,
    type: "protected",
    target: "/virtual-office",
    group: "Admin",
  },
  {
    id: "contact-manager",
    label: "Contact Manager",
    icon: Contact2,
    type: "protected",
    target: "/virtual-office",
    group: "Admin",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Cog,
    type: "protected",
    target: "/virtual-office",
    group: "Admin",
  },
];

const GROUP_ORDER = ["Content", "Services", "Connect", "Admin"];

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onCollapse: () => void;
}

export function Sidebar({
  open,
  collapsed,
  onClose,
  onCollapse,
}: SidebarProps) {
  const navigate = useNavigate();
  const { isOwnerEmail, isAdmin } = useRole();
  const canAccessAdmin = isOwnerEmail || isAdmin;

  const handleItemClick = useCallback(
    (item: SidebarItem) => {
      if (item.type === "scroll") {
        scrollToSection(`#${item.target}`);
        onClose();
      } else if (item.type === "route") {
        navigate({ to: item.target as "/" });
        onClose();
      } else if (item.type === "protected") {
        if (canAccessAdmin) {
          navigate({ to: item.target as "/" });
        } else {
          navigate({ to: "/access-denied" });
        }
        onClose();
      }
    },
    [navigate, onClose, canAccessAdmin],
  );

  const grouped = GROUP_ORDER.map((group) => ({
    group,
    items: SIDEBAR_ITEMS.filter((i) => i.group === group),
  }));

  return (
    <>
      {/* Mobile overlay backdrop — z-30 so sidebar (z-40) sits above it and navbar (z-50) sits above both */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          role="button"
          tabIndex={-1}
          aria-label="Close navigation"
        />
      )}

      {/* Sidebar panel — z-40 (below navbar z-50); pointer-events-none when closed so it never intercepts taps */}
      <nav
        id="sidebar-nav"
        aria-label="Site navigation"
        className={`
          fixed top-0 left-0 h-full z-40 flex flex-col
          border-r border-border transition-all duration-300
          ${open ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none"}
          md:translate-x-0 md:pointer-events-auto md:sticky md:top-16
          ${collapsed ? "w-16" : "w-64"}
        `}
        style={{
          background: "oklch(0.10 0 0)",
          minHeight: "calc(100vh - 64px)",
          height: "calc(100vh - 0px)",
        }}
      >
        {/* Sidebar header */}
        <div
          className="h-16 flex items-center justify-between px-4 border-b border-border/60 flex-shrink-0"
          style={{ background: "oklch(0.11 0 0)" }}
        >
          {!collapsed && (
            <span className="font-display font-semibold text-sm text-foreground/80 tracking-wide truncate">
              Navigation
            </span>
          )}

          {/* Mobile close */}
          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close sidebar"
            data-ocid="sidebar.close_button"
          >
            <X size={18} />
          </button>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={onCollapse}
            className="hidden md:flex p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ml-auto"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            data-ocid="sidebar.collapse_button"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto py-3">
          {grouped.map(({ group, items }, gi) => (
            <div key={group} className={gi > 0 ? "mt-1" : ""}>
              {/* Group label */}
              {!collapsed && (
                <div className="px-4 py-1.5">
                  <span className="text-[10px] font-body font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
                    {group}
                  </span>
                </div>
              )}

              {/* Group divider when collapsed */}
              {collapsed && gi > 0 && (
                <div className="mx-3 my-1 h-px bg-border/40" />
              )}

              <ul className="space-y-0.5 px-2">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isAdminItem = item.type === "protected";
                  const isDisabled = isAdminItem && !canAccessAdmin;

                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => handleItemClick(item)}
                        disabled={isDisabled}
                        title={collapsed ? item.label : undefined}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                          text-sm font-body font-medium transition-all duration-200
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                          ${
                            isDisabled
                              ? "opacity-30 cursor-not-allowed text-muted-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/20 active:bg-muted/30"
                          }
                          ${collapsed ? "justify-center px-2" : ""}
                        `}
                        data-ocid={`sidebar.${item.id}_link`}
                        aria-label={collapsed ? item.label : undefined}
                      >
                        <Icon size={17} className="flex-shrink-0" />
                        {!collapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Sidebar footer — affiliate CTA */}
        {!collapsed && (
          <div className="p-4 border-t border-border/60 flex-shrink-0">
            <a
              href="/affiliate/signup"
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:scale-[1.01] active:scale-[0.99]"
              style={{
                color: "#B8960C",
                border: "1px solid rgba(184,150,12,0.35)",
                background: "rgba(184,150,12,0.07)",
              }}
              data-ocid="sidebar.become_affiliate_button"
              aria-label="Become my affiliate"
            >
              <Star size={15} />
              <span>Become My Affiliate</span>
            </a>
          </div>
        )}

        {collapsed && (
          <div className="p-2 border-t border-border/60 flex-shrink-0">
            <a
              href="/affiliate/signup"
              className="flex items-center justify-center w-full p-2.5 rounded-lg transition-all duration-200"
              style={{ color: "#B8960C" }}
              title="Become My Affiliate"
              data-ocid="sidebar.become_affiliate_icon_button"
              aria-label="Become my affiliate"
            >
              <Star size={17} />
            </a>
          </div>
        )}
      </nav>
    </>
  );
}
