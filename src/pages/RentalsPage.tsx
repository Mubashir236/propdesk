import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import PropertyCard from "@/components/Listings/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Search, Home } from "lucide-react";

const STATUSES = ["all", "available", "viewing_arranged", "rented", "renewal_pending", "vacant"];

export default function RentalsPage() {
  const me = useQuery(api.users.getMe);
  const listings = useQuery(api.rentals.listRentalListings, {});
  const createListing = useMutation(api.rentals.createRentalListing);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    ref_no: `RL-${Date.now().toString(36).toUpperCase()}`,
    title_en: "",
    type: "Apartment",
    bedrooms: "2",
    annual_rent_aed: "",
    area_sqft: "",
    community: "",
    area: "Dubai Marina",
    available_from: Date.now().toString(),
    payment_freq: "4 Cheques",
    status: "available" as "available" | "viewing_arranged" | "rented" | "renewal_pending" | "vacant",
    ejari_number: "",
  });

  const filtered = listings?.filter((l) => {
    const matchTab = activeTab === "all" || l.status === activeTab;
    const matchSearch =
      !search ||
      l.title_en.toLowerCase().includes(search.toLowerCase()) ||
      l.community.toLowerCase().includes(search.toLowerCase()) ||
      l.ref_no.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  }) ?? [];

  async function handleCreate() {
    await createListing({
      ...form,
      annual_rent_aed: parseFloat(form.annual_rent_aed) || 0,
      area_sqft: parseFloat(form.area_sqft) || 0,
      available_from: Date.now(),
      assigned_agent_ids: [],
      photo_storage_ids: [],
    });
    setShowForm(false);
  }

  function statusCount(s: string) {
    if (s === "all") return listings?.length ?? 0;
    return listings?.filter((l) => l.status === s).length ?? 0;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2D4A]">Rental Properties</h1>
          <p className="text-sm text-muted-foreground">{listings?.length ?? 0} properties</p>
        </div>
        {me?.role === "ceo" && (
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Rental
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search rentals…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
          {STATUSES.map((s) => (
            <TabsTrigger
              key={s}
              value={s}
              className="capitalize data-[state=active]:bg-[#1A2D4A] data-[state=active]:text-white rounded-md"
            >
              {s === "all" ? "All" : s.replace(/_/g, " ")}
              <span className="ml-1.5 text-[10px] opacity-70">({statusCount(s)})</span>
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={activeTab} className="mt-5">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Home className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No rentals found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((l) => (
                <PropertyCard
                  key={l._id}
                  id={l._id}
                  refNo={l.ref_no}
                  title={l.title_en}
                  type="rental"
                  propertyType={l.type}
                  bedrooms={l.bedrooms}
                  price={l.annual_rent_aed}
                  area={l.area_sqft}
                  community={l.community}
                  status={l.status}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Rental Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Rental Listing</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Ref No.</Label>
              <Input value={form.ref_no} onChange={(e) => setForm({ ...form, ref_no: e.target.value })} className="mt-1 font-mono" />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Apartment", "Villa", "Studio", "Townhouse", "Penthouse"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Title *</Label>
              <Input value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} placeholder="e.g. Spacious Studio in JVC" className="mt-1" />
            </div>
            <div>
              <Label>Bedrooms</Label>
              <Select value={form.bedrooms} onValueChange={(v) => setForm({ ...form, bedrooms: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Studio", "1", "2", "3", "4", "5+"].map((b) => (
                    <SelectItem key={b} value={b}>{b === "Studio" ? "Studio" : `${b} BR`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Annual Rent (AED)</Label>
              <Input type="number" value={form.annual_rent_aed} onChange={(e) => setForm({ ...form, annual_rent_aed: e.target.value })} placeholder="90000" className="mt-1" />
            </div>
            <div>
              <Label>Size (sqft)</Label>
              <Input type="number" value={form.area_sqft} onChange={(e) => setForm({ ...form, area_sqft: e.target.value })} placeholder="750" className="mt-1" />
            </div>
            <div>
              <Label>Community</Label>
              <Input value={form.community} onChange={(e) => setForm({ ...form, community: e.target.value })} placeholder="e.g. JVC Cluster" className="mt-1" />
            </div>
            <div>
              <Label>Payment Frequency</Label>
              <Select value={form.payment_freq} onValueChange={(v) => setForm({ ...form, payment_freq: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["1 Cheque", "2 Cheques", "4 Cheques", "6 Cheques", "12 Cheques"].map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ejari Number</Label>
              <Input value={form.ejari_number} onChange={(e) => setForm({ ...form, ejari_number: e.target.value })} placeholder="EJARI-XXXX" className="mt-1" />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="viewing_arranged">Viewing Arranged</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                  <SelectItem value="renewal_pending">Renewal Pending</SelectItem>
                  <SelectItem value="vacant">Vacant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.title_en}>Create Rental</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
