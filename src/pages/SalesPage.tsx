import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import PropertyCard from "@/components/Listings/PropertyCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Building2 } from "lucide-react";

const STATUSES = ["all", "available", "under_offer", "reserved", "sold", "off_market", "expired"];

export default function SalesPage() {
  const me = useQuery(api.users.getMe);
  const listings = useQuery(api.sales.listSalesListings, {});
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filtered = listings?.filter((l) => {
    const matchTab = activeTab === "all" || l.status === activeTab;
    const matchSearch =
      !search ||
      l.title_en.toLowerCase().includes(search.toLowerCase()) ||
      l.community.toLowerCase().includes(search.toLowerCase()) ||
      l.area.toLowerCase().includes(search.toLowerCase()) ||
      l.ref_no.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  }) ?? [];

  function statusCount(status: string) {
    if (status === "all") return listings?.length ?? 0;
    return listings?.filter((l) => l.status === status).length ?? 0;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2D4A]">Sales Listings</h1>
          <p className="text-sm text-muted-foreground">
            {listings?.length ?? 0} properties
          </p>
        </div>
        {me?.role === "ceo" && (
          <Button onClick={() => navigate("/sales/new")} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Listing
          </Button>
        )}
      </div>

      {/* Search + filter row */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, community, area…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Status tabs */}
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
              <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No listings found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((listing) => (
                <PropertyCard
                  key={listing._id}
                  id={listing._id}
                  refNo={listing.ref_no}
                  title={listing.title_en}
                  type="sale"
                  propertyType={listing.type}
                  bedrooms={listing.bedrooms}
                  price={listing.price_aed}
                  area={listing.area_sqft}
                  community={listing.community}
                  status={listing.status}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
