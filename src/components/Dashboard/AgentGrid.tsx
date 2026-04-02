import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAED } from "@/lib/utils";
import { ArrowUpDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SortKey = "name" | "leads" | "deals" | "commission";

export default function AgentGrid() {
  const navigate = useNavigate();
  const agents = useQuery(api.users.listAgents);
  const allLeads = useQuery(api.leads.listLeads, {});
  const allDeals = useQuery(api.deals.listDeals);
  const allCommissions = useQuery(api.commissions.listAllCommissions);

  const [sortKey, setSortKey] = useState<SortKey>("commission");
  const [sortAsc, setSortAsc] = useState(false);

  if (!agents) return <div className="h-40 animate-pulse bg-muted rounded-xl" />;

  function initials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }

  const agentStats = agents.map((agent) => {
    const leads = allLeads?.filter((l) => l.assigned_agent_id === agent.clerk_user_id) ?? [];
    const deals = allDeals?.filter((d) => d.agent_id === agent.clerk_user_id) ?? [];
    const closedDeals = deals.filter((d) => d.status === "closed");
    const commissions = allCommissions?.filter((c) => c.agent_id === agent.clerk_user_id) ?? [];
    const totalCommission = commissions.reduce((sum, c) => sum + c.agent_share_aed, 0);
    return { agent, leads: leads.length, deals: closedDeals.length, commission: totalCommission };
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(false); }
  }

  const sorted = [...agentStats].sort((a, b) => {
    let diff = 0;
    if (sortKey === "name") diff = a.agent.name.localeCompare(b.agent.name);
    else if (sortKey === "leads") diff = a.leads - b.leads;
    else if (sortKey === "deals") diff = a.deals - b.deals;
    else diff = a.commission - b.commission;
    return sortAsc ? diff : -diff;
  });

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => toggleSort(k)}
      className={cn(
        "flex items-center gap-1 text-xs font-medium",
        sortKey === k ? "text-[#C9A84C]" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
      <ArrowUpDown className="w-3 h-3" />
    </button>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Agent Performance</CardTitle>
          <div className="flex items-center gap-3">
            <SortBtn k="leads" label="Leads" />
            <SortBtn k="deals" label="Deals" />
            <SortBtn k="commission" label="Commission" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {sorted.map(({ agent, leads, deals, commission }) => (
            <div
              key={agent._id}
              className="flex items-center gap-3 px-6 py-3 hover:bg-muted/40 cursor-pointer transition-colors"
              onClick={() => navigate(`/team/${agent._id}`)}
            >
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback className="text-xs">{initials(agent.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{agent.name}</p>
                <p className="text-xs text-muted-foreground truncate">{agent.email}</p>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-right">
                <div>
                  <p className="text-sm font-semibold">{leads}</p>
                  <p className="text-[10px] text-muted-foreground">Leads</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">{deals}</p>
                  <p className="text-[10px] text-muted-foreground">Closed</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-600">
                    {formatAED(commission)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Commission</p>
                </div>
              </div>
              <Badge variant={agent.is_active ? "success" : "secondary"} className="hidden sm:inline-flex">
                {agent.is_active ? "Active" : "Inactive"}
              </Badge>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          ))}
          {sorted.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No agents yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
