import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import StatusBadge from "@/components/Shared/StatusBadge";
import AssignAgentModal from "@/components/Shared/AssignAgentModal";
import { formatAED, formatNumber } from "@/lib/utils";
import {
  ArrowLeft, Bed, Maximize2, MapPin, Shield, UserPlus, Building2
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const STATUSES = ["available", "under_offer", "reserved", "sold", "off_market", "expired"];

export default function SalesDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const me = useQuery(api.users.getMe);
  const listing = useQuery(api.sales.getSalesListing, { id: id as Id<"sales_listings"> });
  const agents = useQuery(api.users.listAgents);
  const updateListing = useMutation(api.sales.updateSalesListing);
  const assignAgents = useMutation(api.sales.assignAgentsToListing);
  const [showAssign, setShowAssign] = useState(false);

  if (!listing) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-4 border-[#1A2D4A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  function initials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }

  const assignedAgents = agents?.filter((a) =>
    listing.assigned_agent_ids.includes(a.clerk_user_id)
  ) ?? [];

  return (
    <div className="space-y-5 max-w-5xl">
      <button
        onClick={() => navigate("/sales")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Sales
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-[#1A2D4A] leading-tight">{listing.title_en}</h1>
            <StatusBadge status={listing.status} />
          </div>
          {listing.title_ar && (
            <p className="text-sm text-muted-foreground mt-0.5" dir="rtl">{listing.title_ar}</p>
          )}
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{listing.ref_no}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {me?.role === "ceo" && (
            <>
              <Button variant="outline" size="sm" onClick={() => setShowAssign(true)}>
                <UserPlus className="w-3.5 h-3.5 mr-1" />
                Assign Agents
              </Button>
              <Select
                value={listing.status}
                onValueChange={(v) => updateListing({ id: id as Id<"sales_listings">, status: v as any })}
              >
                <SelectTrigger className="w-40 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Photo placeholder */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-xl bg-gradient-to-br from-[#1A2D4A]/10 to-[#1A2D4A]/5 h-64 flex items-center justify-center border">
            <Building2 className="w-16 h-16 text-[#1A2D4A]/20" />
          </div>

          {/* Description */}
          {listing.description_en && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {listing.description_en}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Amenities */}
          {listing.amenities.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((a) => (
                    <span
                      key={a}
                      className="px-2.5 py-1 bg-[#1A2D4A]/5 text-[#1A2D4A] text-xs rounded-full border border-[#1A2D4A]/10"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Price */}
          <Card className="border-[#C9A84C]/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Asking Price</p>
              <p className="text-2xl font-bold text-[#C9A84C]">{formatAED(listing.price_aed)}</p>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {[
                { label: "Type", value: listing.type },
                { label: "Bedrooms", value: listing.bedrooms === "Studio" ? "Studio" : `${listing.bedrooms} BR` },
                { label: "Size", value: `${formatNumber(listing.area_sqft)} sqft` },
                { label: "Community", value: listing.community },
                { label: "Area", value: listing.area },
                { label: "Furnishing", value: listing.furnishing },
                { label: "RERA Permit", value: listing.rera_permit || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-right">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Assigned Agents */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Assigned Agents</CardTitle>
            </CardHeader>
            <CardContent>
              {assignedAgents.length === 0 ? (
                <p className="text-xs text-muted-foreground">No agents assigned</p>
              ) : (
                <div className="space-y-2">
                  {assignedAgents.map((agent) => (
                    <div key={agent._id} className="flex items-center gap-2">
                      <Avatar className="w-7 h-7">
                        <AvatarFallback className="text-[10px]">{initials(agent.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{agent.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {me?.role === "ceo" && (
        <AssignAgentModal
          open={showAssign}
          onClose={() => setShowAssign(false)}
          currentAgentIds={listing.assigned_agent_ids}
          onAssign={(ids) =>
            assignAgents({ listing_id: id as Id<"sales_listings">, agent_ids: ids })
          }
          multi={true}
          title="Assign Agents to Listing"
        />
      )}
    </div>
  );
}
