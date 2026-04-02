import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { cn } from "@/lib/utils";

interface AppShellProps {
  me: { role: "ceo" | "agent"; name: string } | null;
  children: React.ReactNode;
}

export default function AppShell({ me, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = me?.role ?? "agent";

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
          role={role}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50 flex">
            <Sidebar
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
              role={role}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          onMobileMenuToggle={() => setMobileOpen((v) => !v)}
          role={role}
        />
        <main
          className={cn(
            "flex-1 overflow-y-auto p-4 md:p-6"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
