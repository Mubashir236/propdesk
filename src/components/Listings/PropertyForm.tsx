import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SalesFormValues {
  ref_no: string;
  title_en: string;
  title_ar: string;
  type: string;
  bedrooms: string;
  price_aed: number;
  area_sqft: number;
  community: string;
  area: string;
  furnishing: string;
  rera_permit: string;
  status: "available" | "under_offer" | "reserved" | "sold" | "off_market" | "expired";
  amenities: string[];
  assigned_agent_ids: string[];
  photo_storage_ids: string[];
  description_en: string;
}

interface PropertyFormProps {
  onSubmit: (values: SalesFormValues) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const PROPERTY_TYPES = ["Apartment", "Villa", "Townhouse", "Penthouse", "Plot", "Office", "Retail", "Warehouse"];
const BEDROOMS = ["Studio", "1", "2", "3", "4", "5", "6+"];
const FURNISHINGS = ["Furnished", "Semi-Furnished", "Unfurnished"];
const AREAS = [
  "Downtown Dubai", "Dubai Marina", "Palm Jumeirah", "Business Bay",
  "Jumeirah Village Circle", "Arabian Ranches", "Emirates Hills",
  "Dubai Hills Estate", "DIFC", "Al Barsha", "Mirdif", "Other"
];
const AMENITIES_LIST = [
  "Pool", "Gym", "Parking", "Balcony", "Sea View", "City View",
  "Garden", "Security", "Concierge", "Kids Area", "BBQ Area", "Study"
];

export default function PropertyForm({ onSubmit, onCancel, loading }: PropertyFormProps) {
  const [form, setForm] = useState<SalesFormValues>({
    ref_no: `SL-${Date.now().toString(36).toUpperCase()}`,
    title_en: "",
    title_ar: "",
    type: "Apartment",
    bedrooms: "2",
    price_aed: 0,
    area_sqft: 0,
    community: "",
    area: "Dubai Marina",
    furnishing: "Unfurnished",
    rera_permit: "",
    status: "available",
    amenities: [],
    assigned_agent_ids: [],
    photo_storage_ids: [],
    description_en: "",
  });

  function toggleAmenity(a: string) {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    }));
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit(form);
      }}
      className="space-y-5"
    >
      <div className="grid grid-cols-2 gap-4">
        {/* Ref */}
        <div>
          <Label>Reference No.</Label>
          <Input
            value={form.ref_no}
            onChange={(e) => setForm({ ...form, ref_no: e.target.value })}
            className="mt-1 font-mono"
          />
        </div>
        {/* Type */}
        <div>
          <Label>Property Type</Label>
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Title EN */}
        <div className="col-span-2">
          <Label>Title (English) *</Label>
          <Input
            required
            value={form.title_en}
            onChange={(e) => setForm({ ...form, title_en: e.target.value })}
            placeholder="e.g. Luxury 2BR Apartment in Dubai Marina"
            className="mt-1"
          />
        </div>

        {/* Title AR */}
        <div className="col-span-2">
          <Label>Title (Arabic)</Label>
          <Input
            value={form.title_ar}
            onChange={(e) => setForm({ ...form, title_ar: e.target.value })}
            placeholder="e.g. شقة فاخرة 2 غرفة نوم في دبي مارينا"
            dir="rtl"
            className="mt-1"
          />
        </div>

        {/* Bedrooms */}
        <div>
          <Label>Bedrooms</Label>
          <Select value={form.bedrooms} onValueChange={(v) => setForm({ ...form, bedrooms: v })}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {BEDROOMS.map((b) => <SelectItem key={b} value={b}>{b === "Studio" ? "Studio" : `${b} BR`}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Furnishing */}
        <div>
          <Label>Furnishing</Label>
          <Select value={form.furnishing} onValueChange={(v) => setForm({ ...form, furnishing: v })}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {FURNISHINGS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Price */}
        <div>
          <Label>Price (AED) *</Label>
          <Input
            type="number"
            required
            value={form.price_aed || ""}
            onChange={(e) => setForm({ ...form, price_aed: parseFloat(e.target.value) || 0 })}
            placeholder="2500000"
            className="mt-1"
          />
        </div>

        {/* Area sqft */}
        <div>
          <Label>Size (sqft)</Label>
          <Input
            type="number"
            value={form.area_sqft || ""}
            onChange={(e) => setForm({ ...form, area_sqft: parseFloat(e.target.value) || 0 })}
            placeholder="1200"
            className="mt-1"
          />
        </div>

        {/* Community */}
        <div>
          <Label>Community</Label>
          <Input
            value={form.community}
            onChange={(e) => setForm({ ...form, community: e.target.value })}
            placeholder="e.g. Marina Walk"
            className="mt-1"
          />
        </div>

        {/* Area */}
        <div>
          <Label>Area / District</Label>
          <Select value={form.area} onValueChange={(v) => setForm({ ...form, area: v })}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {AREAS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* RERA */}
        <div>
          <Label>RERA Permit No.</Label>
          <Input
            value={form.rera_permit}
            onChange={(e) => setForm({ ...form, rera_permit: e.target.value })}
            placeholder="RERA-XXXX-XXXX"
            className="mt-1"
          />
        </div>

        {/* Status */}
        <div>
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="under_offer">Under Offer</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="off_market">Off Market</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="col-span-2">
          <Label>Description</Label>
          <textarea
            value={form.description_en}
            onChange={(e) => setForm({ ...form, description_en: e.target.value })}
            rows={4}
            placeholder="Detailed property description…"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          />
        </div>

        {/* Amenities */}
        <div className="col-span-2">
          <Label>Amenities</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {AMENITIES_LIST.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                  form.amenities.includes(a)
                    ? "bg-[#1A2D4A] text-white border-[#1A2D4A]"
                    : "text-muted-foreground border-border hover:border-[#1A2D4A]/40"
                )}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Create Listing"}
        </Button>
      </div>
    </form>
  );
}
