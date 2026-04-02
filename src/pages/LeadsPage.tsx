import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import KanbanBoard from "@/components/Pipeline/KanbanBoard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import StatusBadge from "@/components/Shared/StatusBadge";
import { formatAED } from "@/lib/utils";
import { Plus, LayoutGrid, List, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LeadsPage() {
  const me = useQuery(api.users.getMe);
  const leads = useQuery(api.leads.listLeads, {});
  const createLead = useMutation(api.leads.createLead);
  const navigate = useNavigate();

  const [view, setView] = useState<"kanban" | "table">(
    me?.role === "ceo" ? "table" : "kanban"
  );
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  // Form state
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    nationality: "",
    lead_type: "buyer" as "buyer" | "tenant" | "investor",
    source: "",
    budget_min: "",
    budget_max: "",
    property_type_pref: "",
    area_pref: "",
    timeline: "",
    notes: "",
  });

  async function handleCreate() {
    if (!form.name) return;
    await createLead({
      ...form,
      budget_min: parseFloat(form.budget_min) || 0,
      budget_max: parseFloat(form.budget_max) || 0,
    });
    setShowForm(false);
    setForm({
      name: "", phone: "", email: "", nationality: "",
      lead_type: "buyer", source: "", budget_min: "", budget_max: "",
      property_type_pref: "", area_pref: "", timeline: "", notes: "",
    });
  }

  const filtered = leads?.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      l.ref_no.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2D4A]">Leads</h1>
          <p className="text-sm text-muted-foreground">
            {leads?.length ?? 0} total leads
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center border rounded-md overflow-hidden">
            <button
              onClick={() => setView("kanban")}
              className={cn(
                "px-3 py-1.5 text-sm",
                view === "kanban"
                  ? "bg-[#1A2D4A] text-white"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("table")}
              className={cn(
                "px-3 py-1.5 text-sm",
                view === "table"
                  ? "bg-[#1A2D4A] text-white"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            New Lead
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search leads…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Kanban Board */}
      {view === "kanban" && (
        <KanbanBoard leads={filtered} />
      )}

      {/* Table view */}
      {view === "table" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Lead</th>
                    <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Budget</th>
                    <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground hidden md:table-cell">Area</th>
                    <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground hidden lg:table-cell">Source</th>
                    <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-muted-foreground">
                        No leads found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((lead) => (
                      <tr
                        key={lead._id}
                        className="hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => navigate(`/leads/${lead._id}`)}
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium">{lead.name}</p>
                          <p className="text-xs text-muted-foreground">{lead.phone || lead.email}</p>
                        </td>
                        <td className="px-4 py-3 capitalize">{lead.lead_type}</td>
                        <td className="px-4 py-3 text-[#C9A84C] font-medium">
                          {formatAED(lead.budget_max)}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                          {lead.area_pref || "—"}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                          {lead.source || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={lead.status} size="sm" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Lead Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Lead</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Full Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Mohammed Al Rashid"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+971 50 000 0000"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Nationality</Label>
              <Input
                value={form.nationality}
                onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                placeholder="e.g. Emirati"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Lead Type</Label>
              <Select
                value={form.lead_type}
                onValueChange={(v) => setForm({ ...form, lead_type: v as any })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="tenant">Tenant</SelectItem>
                  <SelectItem value="investor">Investor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Budget Min (AED)</Label>
              <Input
                type="number"
                value={form.budget_min}
                onChange={(e) => setForm({ ...form, budget_min: e.target.value })}
                placeholder="500000"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Budget Max (AED)</Label>
              <Input
                type="number"
                value={form.budget_max}
                onChange={(e) => setForm({ ...form, budget_max: e.target.value })}
                placeholder="2000000"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Property Type</Label>
              <Input
                value={form.property_type_pref}
                onChange={(e) => setForm({ ...form, property_type_pref: e.target.value })}
                placeholder="e.g. 2BR Apartment"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Preferred Area</Label>
              <Input
                value={form.area_pref}
                onChange={(e) => setForm({ ...form, area_pref: e.target.value })}
                placeholder="e.g. Dubai Marina"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Timeline</Label>
              <Input
                value={form.timeline}
                onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                placeholder="e.g. 3 months"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Source</Label>
              <Input
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                placeholder="e.g. Bayut, Referral"
                className="mt-1"
              />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any initial notes…"
                rows={3}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!form.name}>
              Create Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
