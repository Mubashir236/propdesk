import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import KpiCard from "@/components/Dashboard/KpiCard";
import AgentGrid from "@/components/Dashboard/AgentGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "@/components/Shared/StatusBadge";
import { formatAED, timeAgo } from "@/lib/utils";
import {
  DollarSign,
  Users,
  Building2,
  TrendingUp,
  Home,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const me = useQuery(api.users.getMe);
  const leads = useQuery(api.leads.listLeads, {});
  const sales = useQuery(api.sales.listSalesListings, {});
  const rentals = useQuery(api.rentals.listRentalListings, {});
  const deals = useQuery(api.deals.listDeals);
  const commissions = useQuery(api.commissions.listCommissionsForAgent, {});
  const activities = useQuery(
    api.notifications.listNotifications,
    { unread_only: false }
  );
  const navigate = useNavigate();

  const isCeo = me?.role === "ceo";

  const openLeads = leads?.filter(
    (l) => !["closed", "lost"].includes(l.status)
  ).length ?? 0;
  const closedDeals = deals?.filter((d) => d.status === "closed").length ?? 0;
  const totalCommission = commissions?.reduce(
    (sum, c) => sum + (isCeo ? c.total_aed : c.agent_share_aed),
    0
  ) ?? 0;
  const activeSales = sales?.filter((s) => s.status === "available").length ?? 0;
  const activeRentals = rentals?.filter((r) => r.status === "available").length ?? 0;

  const recentLeads = leads?.slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A2D4A]">
          {isCeo ? "CEO Dashboard" : "My Dashboard"}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isCeo
            ? "Full company overview and performance metrics"
            : "Your personal pipeline and performance"}
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Open Leads"
          value={openLeads}
          icon={Users}
          iconColor="text-[#1A2D4A]"
        />
        <KpiCard
          label="Closed Deals"
          value={closedDeals}
          icon={FileText}
          iconColor="text-emerald-600"
        />
        <KpiCard
          label={isCeo ? "Total Commission" : "My Commission"}
          value={formatAED(totalCommission)}
          icon={DollarSign}
          iconColor="text-[#C9A84C]"
        />
        <KpiCard
          label="Active Listings"
          value={activeSales + activeRentals}
          subValue={`${activeSales} sales · ${activeRentals} rentals`}
          icon={Building2}
          iconColor="text-[#1A2D4A]"
        />
      </div>

      {/* CEO: Agent Grid */}
      {isCeo && (
        <div>
          <h2 className="text-base font-semibold mb-3 text-[#1A2D4A]">
            Agent Performance
          </h2>
          <AgentGrid />
        </div>
      )}

      {/* Recent Leads + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Leads */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Leads</CardTitle>
                <button
                  onClick={() => navigate("/leads")}
                  className="text-xs text-[#C9A84C] hover:text-[#A8893A] font-medium"
                >
                  View all
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentLeads.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No leads yet
                  </p>
                ) : (
                  recentLeads.map((lead) => (
                    <div
                      key={lead._id}
                      className="flex items-center gap-3 px-6 py-3 hover:bg-muted/40 cursor-pointer"
                      onClick={() => navigate(`/leads/${lead._id}`)}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#1A2D4A]/10 flex items-center justify-center text-xs font-bold text-[#1A2D4A] shrink-0">
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {lead.lead_type} · {lead.area_pref || "Any area"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <StatusBadge status={lead.status} size="sm" />
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatAED(lead.budget_max)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pipeline Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "New", status: "new", color: "bg-sky-500" },
                { label: "Contacted", status: "contacted", color: "bg-indigo-500" },
                { label: "Qualified", status: "qualified", color: "bg-teal-500" },
                { label: "Offer Made", status: "offer_made", color: "bg-orange-500" },
                { label: "Negotiating", status: "negotiating", color: "bg-amber-500" },
              ].map(({ label, status, color }) => {
                const count = leads?.filter((l) => l.status === status).length ?? 0;
                return (
                  <div key={status} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${color} shrink-0`} />
                    <span className="text-xs flex-1 text-muted-foreground">{label}</span>
                    <span className="text-xs font-semibold">{count}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Sales Available", value: activeSales, icon: Building2 },
                { label: "Rentals Available", value: activeRentals, icon: Home },
                { label: "Total Listings", value: (sales?.length ?? 0) + (rentals?.length ?? 0), icon: TrendingUp },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs flex-1 text-muted-foreground">{label}</span>
                  <span className="text-xs font-semibold">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
