import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import StatusBadge from "@/components/Shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import { Plus, Search, TrendingUp, CalendarClock, Building } from "lucide-react";

export default function OffPlanPage() {
  const me = useQuery(api.users.getMe);
  const projects = useQuery(api.offplan.listProjects);
  const createProject = useMutation(api.offplan.createProject);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    ref_no: `OP-${Date.now().toString(36).toUpperCase()}`,
    project_name: "",
    developer_name: "",
    community: "",
    area: "",
    handover_date: "",
    status: "Pre-Launch",
    commission_rate_pct: "3",
    payment_plan_type: "20/80",
  });

  const filtered = projects?.filter(
    (p) =>
      p.project_name.toLowerCase().includes(search.toLowerCase()) ||
      p.developer_name.toLowerCase().includes(search.toLowerCase()) ||
      p.community.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  async function handleCreate() {
    await createProject({
      ...form,
      handover_date: form.handover_date ? new Date(form.handover_date).getTime() : Date.now(),
      commission_rate_pct: parseFloat(form.commission_rate_pct) || 3,
    });
    setShowForm(false);
  }

  const statusColors: Record<string, string> = {
    "Pre-Launch": "bg-violet-100 text-violet-700",
    "Launched": "bg-emerald-100 text-emerald-700",
    "Under Construction": "bg-amber-100 text-amber-700",
    "Completed": "bg-blue-100 text-blue-700",
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2D4A]">Off-Plan Projects</h1>
          <p className="text-sm text-muted-foreground">{projects?.length ?? 0} projects</p>
        </div>
        {me?.role === "ceo" && (
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Project
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search projects…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No off-plan projects yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <div
              key={project._id}
              onClick={() => navigate(`/off-plan/${project._id}`)}
              className="bg-white border rounded-xl p-5 hover:shadow-md hover:border-[#C9A84C]/30 cursor-pointer transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#1A2D4A]/5 flex items-center justify-center">
                  <Building className="w-5 h-5 text-[#1A2D4A]/50" />
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[project.status] ?? "bg-slate-100 text-slate-600"}`}
                >
                  {project.status}
                </span>
              </div>

              <h3 className="font-semibold text-[#1A2D4A] leading-tight mb-0.5">{project.project_name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{project.developer_name}</p>

              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>{project.community}, {project.area}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarClock className="w-3 h-3" />
                  <span>Handover: {project.handover_date ? formatDate(project.handover_date) : "TBA"}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted-foreground">{project.ref_no}</span>
                <span className="text-xs font-semibold text-[#C9A84C]">
                  {project.commission_rate_pct}% commission
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Off-Plan Project</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Ref No.</Label>
              <Input value={form.ref_no} onChange={(e) => setForm({ ...form, ref_no: e.target.value })} className="mt-1 font-mono" />
            </div>
            <div>
              <Label>Status</Label>
              <Input value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1" placeholder="Pre-Launch" />
            </div>
            <div className="col-span-2">
              <Label>Project Name *</Label>
              <Input value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} placeholder="e.g. Emaar Beachfront Tower" className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label>Developer</Label>
              <Input value={form.developer_name} onChange={(e) => setForm({ ...form, developer_name: e.target.value })} placeholder="e.g. Emaar Properties" className="mt-1" />
            </div>
            <div>
              <Label>Community</Label>
              <Input value={form.community} onChange={(e) => setForm({ ...form, community: e.target.value })} placeholder="e.g. Dubai Creek Harbour" className="mt-1" />
            </div>
            <div>
              <Label>Area</Label>
              <Input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="e.g. Dubai" className="mt-1" />
            </div>
            <div>
              <Label>Handover Date</Label>
              <Input type="date" value={form.handover_date} onChange={(e) => setForm({ ...form, handover_date: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Commission (%)</Label>
              <Input type="number" value={form.commission_rate_pct} onChange={(e) => setForm({ ...form, commission_rate_pct: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Payment Plan</Label>
              <Input value={form.payment_plan_type} onChange={(e) => setForm({ ...form, payment_plan_type: e.target.value })} placeholder="e.g. 20/80" className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.project_name}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
