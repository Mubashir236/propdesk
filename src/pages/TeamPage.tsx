import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatAED } from "@/lib/utils";
import { UserPlus, Phone, Mail, ChevronRight, Search } from "lucide-react";

export default function TeamPage() {
  const navigate = useNavigate();
  const agents = useQuery(api.users.listAgents);
  const allLeads = useQuery(api.leads.listLeads, {});
  const allDeals = useQuery(api.deals.listDeals);
  const allCommissions = useQuery(api.commissions.listAllCommissions);
  const inviteAgent = useMutation(api.users.inviteAgent);
  const updateSplit = useMutation(api.users.updateAgentSplit);

  const [showInvite, setShowInvite] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    clerk_user_id: "",
    agent_split_pct: "50",
  });

  function initials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }

  function getAgentStats(clerkId: string) {
    const leads = allLeads?.filter((l) => l.assigned_agent_id === clerkId) ?? [];
    const deals = allDeals?.filter((d) => d.agent_id === clerkId && d.status === "closed") ?? [];
    const comms = allCommissions?.filter((c) => c.agent_id === clerkId) ?? [];
    return {
      leads: leads.length,
      deals: deals.length,
      commission: comms.reduce((s, c) => s + c.agent_share_aed, 0),
    };
  }

  const filtered = agents?.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  async function handleInvite() {
    await inviteAgent({
      ...form,
      agent_split_pct: parseFloat(form.agent_split_pct) || 50,
    });
    setShowInvite(false);
    setForm({ name: "", email: "", phone: "", clerk_user_id: "", agent_split_pct: "50" });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2D4A]">Team</h1>
          <p className="text-sm text-muted-foreground">{agents?.length ?? 0} agents</p>
        </div>
        <Button onClick={() => setShowInvite(true)} size="sm">
          <UserPlus className="w-4 h-4 mr-1" />
          Add Agent
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search agents…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((agent) => {
          const stats = getAgentStats(agent.clerk_user_id);
          return (
            <div
              key={agent._id}
              onClick={() => navigate(`/team/${agent._id}`)}
              className="bg-white border rounded-xl p-5 hover:shadow-md hover:border-[#C9A84C]/30 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>{initials(agent.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1A2D4A] truncate">{agent.name}</p>
                  <Badge variant={agent.is_active ? "success" : "secondary"} className="mt-0.5">
                    {agent.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="space-y-1.5 text-sm mb-3">
                {agent.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{agent.email}</span>
                  </div>
                )}
                {agent.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>{agent.phone}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t text-center">
                <div>
                  <p className="text-sm font-bold">{stats.leads}</p>
                  <p className="text-[10px] text-muted-foreground">Leads</p>
                </div>
                <div>
                  <p className="text-sm font-bold">{stats.deals}</p>
                  <p className="text-[10px] text-muted-foreground">Deals</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#C9A84C]">
                    {agent.agent_split_pct}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">Split</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total Commission</span>
                  <span className="text-xs font-semibold text-emerald-600">
                    {formatAED(stats.commission)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No agents found
          </div>
        )}
      </div>

      {/* Invite Agent Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Agent</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Full Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Agent full name" className="mt-1" />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="agent@company.com" className="mt-1" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+971 50 000 0000" className="mt-1" />
            </div>
            <div>
              <Label>Clerk User ID *</Label>
              <Input value={form.clerk_user_id} onChange={(e) => setForm({ ...form, clerk_user_id: e.target.value })} placeholder="user_xxxx (from Clerk dashboard)" className="mt-1 font-mono text-xs" />
            </div>
            <div>
              <Label>Agent Commission Split (%)</Label>
              <Input type="number" min="0" max="100" value={form.agent_split_pct} onChange={(e) => setForm({ ...form, agent_split_pct: e.target.value })} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={!form.name || !form.email || !form.clerk_user_id}>
              Add Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
