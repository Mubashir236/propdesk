import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/Shared/StatusBadge";
import { formatAED, formatDate } from "@/lib/utils";
import {
  ArrowLeft, Mail, Phone, Percent, DollarSign, Users, FileText, Edit2, Check, X
} from "lucide-react";

export default function AgentDetailPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();

  const agents = useQuery(api.users.listAgents);
  const allLeads = useQuery(api.leads.listLeads, {});
  const allDeals = useQuery(api.deals.listDeals);
  const allCommissions = useQuery(api.commissions.listAllCommissions);
  const updateSplit = useMutation(api.users.updateAgentSplit);

  const agent = agents?.find((a) => a._id === agentId);
  const [editSplit, setEditSplit] = useState(false);
  const [splitValue, setSplitValue] = useState("");

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-4 border-[#1A2D4A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  function initials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }

  const agentLeads = allLeads?.filter((l) => l.assigned_agent_id === agent.clerk_user_id) ?? [];
  const agentDeals = allDeals?.filter((d) => d.agent_id === agent.clerk_user_id) ?? [];
  const closedDeals = agentDeals.filter((d) => d.status === "closed");
  const agentComms = allCommissions?.filter((c) => c.agent_id === agent.clerk_user_id) ?? [];
  const totalCommission = agentComms.reduce((s, c) => s + c.agent_share_aed, 0);

  async function handleSaveSplit() {
    const pct = parseFloat(splitValue);
    if (!isNaN(pct) && pct >= 0 && pct <= 100) {
      await updateSplit({ agent_id: agentId as Id<"users">, agent_split_pct: pct });
    }
    setEditSplit(false);
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <button onClick={() => navigate("/team")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" />
        Back to Team
      </button>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Avatar className="w-14 h-14">
          <AvatarFallback className="text-lg">{initials(agent.name)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#1A2D4A]">{agent.name}</h1>
            <Badge variant={agent.is_active ? "success" : "secondary"}>
              {agent.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            {agent.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {agent.email}
              </span>
            )}
            {agent.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {agent.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: agentLeads.length, icon: Users, color: "text-[#1A2D4A]" },
          { label: "Closed Deals", value: closedDeals.length, icon: FileText, color: "text-emerald-600" },
          { label: "My Commission", value: formatAED(totalCommission), icon: DollarSign, color: "text-[#C9A84C]" },
          {
            label: "Commission Split",
            value: (
              <div className="flex items-center gap-2">
                {editSplit ? (
                  <>
                    <input
                      type="number"
                      value={splitValue}
                      onChange={(e) => setSplitValue(e.target.value)}
                      className="w-14 text-xl font-bold border rounded px-1"
                      autoFocus
                    />
                    <span className="text-xl font-bold">%</span>
                    <button onClick={handleSaveSplit} className="text-emerald-600"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditSplit(false)} className="text-red-500"><X className="w-4 h-4" /></button>
                  </>
                ) : (
                  <>
                    <span>{agent.agent_split_pct}%</span>
                    <button
                      onClick={() => { setSplitValue(String(agent.agent_split_pct)); setEditSplit(true); }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            ),
            icon: Percent,
            color: "text-violet-600",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
                  <div className="text-2xl font-bold">{value}</div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center">
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Agent's Leads */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pipeline ({agentLeads.length} leads)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-80 overflow-y-auto">
              {agentLeads.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No leads assigned</p>
              ) : (
                agentLeads.map((lead) => (
                  <div
                    key={lead._id}
                    onClick={() => navigate(`/leads/${lead._id}`)}
                    className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/40 cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{lead.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{lead.lead_type} · {lead.area_pref || "Any"}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <StatusBadge status={lead.status} size="sm" />
                      <p className="text-xs text-muted-foreground mt-0.5">{formatAED(lead.budget_max)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Agent's Commissions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Commission History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-80 overflow-y-auto">
              {agentComms.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No commissions yet</p>
              ) : (
                agentComms.map((comm) => (
                  <div key={comm._id} className="flex items-center gap-3 px-5 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{formatDate(comm.calculated_at)}</p>
                      <p className="text-xs">Rate: {comm.rate_pct}% · Split: {comm.split_pct}%</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-emerald-600">{formatAED(comm.agent_share_aed)}</p>
                      <p className="text-xs text-muted-foreground">of {formatAED(comm.total_aed)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
