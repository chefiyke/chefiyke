import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
  noFooter?: boolean;
  /** Pass true to hide the sidebar (e.g. full-screen admin pages) */
  noSidebar?: boolean;
}

export function Layout({
  children,
  noFooter = false,
  noSidebar = false,
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleCollapse = useCallback(
    () => setSidebarCollapsed((prev) => !prev),
    [],
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Fixed top navbar */}
      <Navbar onSidebarToggle={toggleSidebar} sidebarOpen={sidebarOpen} />

      {/* Below-navbar layout: sidebar + content */}
      <div className="flex flex-1" style={{ marginTop: "64px" }}>
        {!noSidebar && (
          <Sidebar
            open={sidebarOpen}
            collapsed={sidebarCollapsed}
            onClose={closeSidebar}
            onCollapse={toggleCollapse}
          />
        )}

        {/* Main content — disable interactions when mobile sidebar is open so the backdrop is the only click target */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-none ${sidebarOpen ? "pointer-events-none md:pointer-events-auto" : ""}`}
        >
          <main id="main-content" className="flex-1">
            {children}
          </main>

          {!noFooter && <Footer />}
        </div>
      </div>
    </div>
  );
}
