import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import CommissionBarChart from "@/components/Analytics/CommissionBarChart";
import DealDonutChart from "@/components/Analytics/DealDonutChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import KpiCard from "@/components/Dashboard/KpiCard";
import { formatAED } from "@/lib/utils";
import { DollarSign, TrendingUp, Users, FileText } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

export default function AnalyticsPage() {
  const me = useQuery(api.users.getMe);
  const allCommissions = useQuery(api.commissions.listCommissionsForAgent, {});
  const allDeals = useQuery(api.deals.listDeals);
  const leads = useQuery(api.leads.listLeads, {});
  const settings = useQuery(api.settings.getSettings);

  const isCeo = me?.role === "ceo";

  // Build last 6 months commission data
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), 5 - i);
    return {
      month: format(d, "MMM"),
      start: startOfMonth(d).getTime(),
      end: endOfMonth(d).getTime(),
    };
  });

  const commissionBarData = months.map(({ month, start, end }) => {
    const monthComms = allCommissions?.filter(
      (c) => c.calculated_at >= start && c.calculated_at <= end
    ) ?? [];
    return {
      month,
      agent_share: monthComms.reduce((s, c) => s + c.agent_share_aed, 0),
      company_share: monthComms.reduce((s, c) => s + c.company_share_aed, 0),
    };
  });

  // Deal type breakdown for donut
  const dealTypes = ["sale", "rental", "off_plan"].map((type) => ({
    name: type.replace("_", "-"),
    value: allDeals?.filter((d) => d.deal_type === type).length ?? 0,
  }));

  // KPIs
  const totalRevenue = allCommissions?.reduce((s, c) => s + c.total_aed, 0) ?? 0;
  const agentRevenue = allCommissions?.reduce((s, c) => s + c.agent_share_aed, 0) ?? 0;
  const closedDeals = allDeals?.filter((d) => d.status === "closed").length ?? 0;
  const conversionRate =
    leads && leads.length > 0
      ? ((leads.filter((l) => l.status === "closed").length / leads.length) * 100).toFixed(1)
      : "0";
  const targetRevenue = settings?.target_monthly_revenue ?? 0;
  const currentMonthRevenue =
    allCommissions?.filter((c) => {
      const start = startOfMonth(new Date()).getTime();
      return c.calculated_at >= start;
    }).reduce((s, c) => s + c.total_aed, 0) ?? 0;
  const targetPct = targetRevenue > 0
    ? Math.min(100, Math.round((currentMonthRevenue / targetRevenue) * 100))
    : 0;

  // Lead source breakdown
  const sourceMap: Record<string, number> = {};
  leads?.forEach((l) => {
    const src = l.source || "Unknown";
    sourceMap[src] = (sourceMap[src] ?? 0) + 1;
  });
  const topSources = Object.entries(sourceMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A2D4A]">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          {isCeo ? "Company-wide performance metrics" : "Your personal performance"}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Commission Revenue"
          value={formatAED(isCeo ? totalRevenue : agentRevenue)}
          icon={DollarSign}
          iconColor="text-[#C9A84C]"
        />
        <KpiCard
          label="Closed Deals"
          value={closedDeals}
          icon={FileText}
          iconColor="text-emerald-600"
        />
        <KpiCard
          label="Lead Conversion"
          value={`${conversionRate}%`}
          icon={TrendingUp}
          iconColor="text-blue-600"
        />
        <KpiCard
          label="Total Leads"
          value={leads?.length ?? 0}
          icon={Users}
          iconColor="text-[#1A2D4A]"
        />
      </div>

      {/* Monthly target progress (CEO only) */}
      {isCeo && targetRevenue > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Monthly Revenue Target</CardTitle>
              <span className="text-sm font-semibold text-[#C9A84C]">{targetPct}%</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C9A84C] rounded-full transition-all duration-500"
                style={{ width: `${targetPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
              <span>{formatAED(currentMonthRevenue)} this month</span>
              <span>Target: {formatAED(targetRevenue)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Commission bar chart — 2/3 width */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Commission Revenue — Last 6 Months</CardTitle>
          </CardHeader>
          <CardContent>
            <CommissionBarChart data={commissionBarData} />
          </CardContent>
        </Card>

        {/* Deal type donut — 1/3 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Deal Type Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <DealDonutChart data={dealTypes} />
          </CardContent>
        </Card>
      </div>

      {/* Lead pipeline funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Lead Pipeline Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { stage: "new", label: "New", color: "bg-sky-500" },
                { stage: "contacted", label: "Contacted", color: "bg-indigo-500" },
                { stage: "qualified", label: "Qualified", color: "bg-teal-500" },
                { stage: "viewing_scheduled", label: "Viewing", color: "bg-violet-500" },
                { stage: "offer_made", label: "Offer Made", color: "bg-orange-500" },
                { stage: "negotiating", label: "Negotiating", color: "bg-amber-500" },
                { stage: "closed", label: "Closed", color: "bg-emerald-500" },
              ].map(({ stage, label, color }) => {
                const count = leads?.filter((l) => l.status === stage).length ?? 0;
                const pct = leads?.length ? Math.round((count / leads.length) * 100) : 0;
                return (
                  <div key={stage} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
                    <div className="flex-1 h-6 bg-slate-100 rounded-md overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-md transition-all duration-500`}
                        style={{ width: `${Math.max(pct, pct > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Lead sources */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {topSources.length === 0 ? (
              <p className="text-sm text-muted-foreground">No source data</p>
            ) : (
              <div className="space-y-2.5">
                {topSources.map(([source, count]) => {
                  const pct = leads?.length ? Math.round((count / leads.length) * 100) : 0;
                  return (
                    <div key={source} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground truncate w-28 shrink-0">{source}</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#C9A84C] rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
