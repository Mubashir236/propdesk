import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UnitMatrix from "@/components/OffPlan/UnitMatrix";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Plus, Building } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export default function OffPlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const me = useQuery(api.users.getMe);
  const project = useQuery(api.offplan.getProject, { id: id as Id<"off_plan_projects"> });
  const units = useQuery(api.offplan.listUnits, { project_id: id as Id<"off_plan_projects"> });
  const createUnit = useMutation(api.offplan.createUnit);

  const [showAddUnit, setShowAddUnit] = useState(false);
  const [unitForm, setUnitForm] = useState({
    unit_number: "",
    floor: "1",
    unit_type: "Apartment",
    bedrooms: "2",
    size_sqft: "",
    price_aed: "",
    status: "available" as "available" | "reserved" | "sold",
    assigned_agent_id: "",
  });

  if (!project) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-4 border-[#1A2D4A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isCeo = me?.role === "ceo";

  async function handleAddUnit() {
    await createUnit({
      project_id: id as Id<"off_plan_projects">,
      ...unitForm,
      floor: parseFloat(unitForm.floor) || 1,
      size_sqft: parseFloat(unitForm.size_sqft) || 0,
      price_aed: parseFloat(unitForm.price_aed) || 0,
    });
    setShowAddUnit(false);
  }

  const availableCount = units?.filter((u) => u.status === "available").length ?? 0;
  const reservedCount = units?.filter((u) => u.status === "reserved").length ?? 0;
  const soldCount = units?.filter((u) => u.status === "sold").length ?? 0;
  const totalUnits = units?.length ?? 0;

  return (
    <div className="space-y-5 max-w-6xl">
      <button onClick={() => navigate("/off-plan")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </button>

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#1A2D4A]/10 flex items-center justify-center">
              <Building className="w-5 h-5 text-[#1A2D4A]/60" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1A2D4A]">{project.project_name}</h1>
              <p className="text-sm text-muted-foreground">{project.developer_name}</p>
            </div>
          </div>
        </div>
        {isCeo && (
          <Button size="sm" onClick={() => setShowAddUnit(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Unit
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Project info */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Project Details</CardTitle></CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              {[
                { label: "Status", value: project.status },
                { label: "Community", value: project.community },
                { label: "Area", value: project.area },
                { label: "Handover", value: project.handover_date ? formatDate(project.handover_date) : "TBA" },
                { label: "Payment Plan", value: project.payment_plan_type },
                { label: "Commission", value: `${project.commission_rate_pct}%` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-right">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Unit Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2.5">
              {[
                { label: "Total Units", value: totalUnits, color: "text-foreground" },
                { label: "Available", value: availableCount, color: "text-emerald-600" },
                { label: "Reserved", value: reservedCount, color: "text-amber-600" },
                { label: "Sold", value: soldCount, color: "text-blue-600" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className={`font-semibold ${color}`}>{value}</span>
                </div>
              ))}
              {totalUnits > 0 && (
                <div className="mt-2">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(soldCount / totalUnits) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {Math.round((soldCount / totalUnits) * 100)}% sold
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Unit Matrix */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Unit Availability Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              {!units || units.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Building className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No units added yet</p>
                  {isCeo && (
                    <Button size="sm" variant="outline" className="mt-3" onClick={() => setShowAddUnit(true)}>
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add First Unit
                    </Button>
                  )}
                </div>
              ) : (
                <UnitMatrix units={units} isCeo={isCeo} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Unit Dialog */}
      <Dialog open={showAddUnit} onOpenChange={setShowAddUnit}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Unit</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Unit Number *</Label>
              <Input value={unitForm.unit_number} onChange={(e) => setUnitForm({ ...unitForm, unit_number: e.target.value })} placeholder="e.g. 1204" className="mt-1" />
            </div>
            <div>
              <Label>Floor</Label>
              <Input type="number" value={unitForm.floor} onChange={(e) => setUnitForm({ ...unitForm, floor: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Unit Type</Label>
              <Input value={unitForm.unit_type} onChange={(e) => setUnitForm({ ...unitForm, unit_type: e.target.value })} placeholder="Apartment" className="mt-1" />
            </div>
            <div>
              <Label>Bedrooms</Label>
              <Select value={unitForm.bedrooms} onValueChange={(v) => setUnitForm({ ...unitForm, bedrooms: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Studio", "1", "2", "3", "4"].map((b) => (
                    <SelectItem key={b} value={b}>{b === "Studio" ? "Studio" : `${b} BR`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Size (sqft)</Label>
              <Input type="number" value={unitForm.size_sqft} onChange={(e) => setUnitForm({ ...unitForm, size_sqft: e.target.value })} placeholder="850" className="mt-1" />
            </div>
            <div>
              <Label>Price (AED)</Label>
              <Input type="number" value={unitForm.price_aed} onChange={(e) => setUnitForm({ ...unitForm, price_aed: e.target.value })} placeholder="1500000" className="mt-1" />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={unitForm.status} onValueChange={(v) => setUnitForm({ ...unitForm, status: v as any })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUnit(false)}>Cancel</Button>
            <Button onClick={handleAddUnit} disabled={!unitForm.unit_number}>Add Unit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
