import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Home,
  TrendingUp,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCircle,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  role: "ceo" | "agent";
}

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["ceo", "agent"] },
  { to: "/sales", icon: Building2, label: "Sales", roles: ["ceo", "agent"] },
  { to: "/rentals", icon: Home, label: "Rentals", roles: ["ceo", "agent"] },
  { to: "/off-plan", icon: TrendingUp, label: "Off-Plan", roles: ["ceo", "agent"] },
  { to: "/leads", icon: Users, label: "Leads", roles: ["ceo", "agent"] },
  { to: "/analytics", icon: BarChart3, label: "Analytics", roles: ["ceo", "agent"] },
  { to: "/team", icon: UserCircle, label: "Team", roles: ["ceo"] },
  { to: "/settings", icon: Settings, label: "Settings", roles: ["ceo", "agent"] },
];

export default function Sidebar({ collapsed, onToggle, role }: SidebarProps) {
  const location = useLocation();
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "sidebar-transition flex flex-col h-full bg-[#1A2D4A] border-r border-[#C9A84C]/20 shrink-0 z-30",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center h-16 border-b border-[#C9A84C]/20 px-4 shrink-0",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#C9A84C] rounded-md flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-[#1A2D4A]" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">PropDesk</span>
            </div>
          )}
          {collapsed && (
            <div className="w-7 h-7 bg-[#C9A84C] rounded-md flex items-center justify-center">
              <Building2 className="w-4 h-4 text-[#1A2D4A]" />
            </div>
          )}
          <button
            onClick={onToggle}
            className={cn(
              "text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors rounded p-0.5",
              collapsed && "hidden"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto space-y-0.5 px-2">
          {visibleItems.map(({ to, icon: Icon, label }) => {
            const isActive =
              to === "/dashboard"
                ? location.pathname === "/dashboard"
                : location.pathname.startsWith(to);

            const link = (
              <NavLink
                to={to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group",
                  collapsed ? "justify-center px-2" : "",
                  isActive
                    ? "bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/30"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className={cn("shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            );

            if (collapsed) {
              return (
                <Tooltip key={to}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right" className="bg-[#1A2D4A] text-white border-[#C9A84C]/30">
                    {label}
                  </TooltipContent>
                </Tooltip>
              );
            }
            return <div key={to}>{link}</div>;
          })}
        </nav>

        {/* Collapse toggle (when collapsed) */}
        {collapsed && (
          <div className="pb-4 flex justify-center">
            <button
              onClick={onToggle}
              className="text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors p-1 rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Role badge */}
        {!collapsed && (
          <div className="p-4 border-t border-[#C9A84C]/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-white/50 capitalize">{role} account</span>
            </div>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
