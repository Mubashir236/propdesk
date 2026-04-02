import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import StatusBadge from "@/components/Shared/StatusBadge";
import AssignAgentModal from "@/components/Shared/AssignAgentModal";
import { formatAED, formatNumber, formatDate } from "@/lib/utils";
import { ArrowLeft, Home, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const STATUSES = ["available", "viewing_arranged", "rented", "renewal_pending", "vacant"];

export default function RentalsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const me = useQuery(api.users.getMe);
  const listing = useQuery(api.rentals.getRentalListing, { id: id as Id<"rental_listings"> });
  const agents = useQuery(api.users.listAgents);
  const updateListing = useMutation(api.rentals.updateRentalListing);
  const assignAgents = useMutation(api.rentals.assignAgentsToListing);
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
      <button onClick={() => navigate("/rentals")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" />
        Back to Rentals
      </button>

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-[#1A2D4A]">{listing.title_en}</h1>
            <StatusBadge status={listing.status} />
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{listing.ref_no}</p>
        </div>
        <div className="flex gap-2">
          {me?.role === "ceo" && (
            <>
              <Button variant="outline" size="sm" onClick={() => setShowAssign(true)}>
                <UserPlus className="w-3.5 h-3.5 mr-1" />
                Assign Agents
              </Button>
              <Select
                value={listing.status}
                onValueChange={(v) => updateListing({ id: id as Id<"rental_listings">, status: v as any })}
              >
                <SelectTrigger className="w-44 h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-gradient-to-br from-[#1A2D4A]/10 to-[#1A2D4A]/5 h-64 flex items-center justify-center border mb-5">
            <Home className="w-16 h-16 text-[#1A2D4A]/20" />
          </div>

          {/* Tenancy Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Tenancy Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
              {[
                { label: "Ejari Number", value: listing.ejari_number || "—" },
                { label: "Payment Terms", value: listing.payment_freq },
                { label: "Available From", value: listing.available_from ? formatDate(listing.available_from) : "—" },
                { label: "Annual Rent", value: formatAED(listing.annual_rent_aed) },
                { label: "Monthly Equiv.", value: formatAED(listing.annual_rent_aed / 12) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-medium mt-0.5">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-[#C9A84C]/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Annual Rent</p>
              <p className="text-2xl font-bold text-[#C9A84C]">{formatAED(listing.annual_rent_aed)}</p>
              <p className="text-xs text-muted-foreground mt-1">{listing.payment_freq}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Property Details</CardTitle></CardHeader>
            <CardContent className="space-y-2.5">
              {[
                { label: "Type", value: listing.type },
                { label: "Bedrooms", value: listing.bedrooms === "Studio" ? "Studio" : `${listing.bedrooms} BR` },
                { label: "Size", value: `${formatNumber(listing.area_sqft)} sqft` },
                { label: "Community", value: listing.community },
                { label: "Area", value: listing.area },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Assigned Agents</CardTitle></CardHeader>
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
                      <p className="text-xs font-medium">{agent.name}</p>
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
          onAssign={(ids) => assignAgents({ listing_id: id as Id<"rental_listings">, agent_ids: ids })}
          multi={true}
          title="Assign Agents to Rental"
        />
      )}
    </div>
  );
}
