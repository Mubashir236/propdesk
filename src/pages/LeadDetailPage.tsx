import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StatusBadge from "@/components/Shared/StatusBadge";
import AssignAgentModal from "@/components/Shared/AssignAgentModal";
import { formatAED, timeAgo } from "@/lib/utils";
import {
  ArrowLeft,
  Phone,
  Mail,
  Globe,
  MapPin,
  DollarSign,
  Calendar,
  User,
  MessageSquare,
  PhoneCall,
  Eye,
  FileText,
  ArrowRight,
  UserPlus,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  call: PhoneCall,
  whatsapp: MessageSquare,
  email: Mail,
  viewing: Eye,
  note: FileText,
  stage_change: ArrowRight,
};

const STATUSES = [
  "new", "contacted", "qualified", "viewing_scheduled",
  "offer_made", "negotiating", "closed", "lost",
];

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const me = useQuery(api.users.getMe);
  const lead = useQuery(api.leads.getLead, { id: id as Id<"leads"> });
  const activities = useQuery(api.activities.listActivitiesForLead, {
    lead_id: id as Id<"leads">,
  });
  const updateStatus = useMutation(api.leads.updateLeadStatus);
  const logActivity = useMutation(api.activities.logActivity);
  const assignLead = useMutation(api.leads.assignLeadToAgent);

  const [showAssign, setShowAssign] = useState(false);
  const [actType, setActType] = useState<"call" | "whatsapp" | "email" | "viewing" | "note">("note");
  const [actNotes, setActNotes] = useState("");

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-4 border-[#1A2D4A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  async function handleLogActivity() {
    if (!actNotes.trim()) return;
    await logActivity({
      lead_id: id as Id<"leads">,
      type: actType,
      notes: actNotes,
    });
    setActNotes("");
  }

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Back */}
      <button
        onClick={() => navigate("/leads")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Leads
      </button>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-[#1A2D4A]">{lead.name}</h1>
            <StatusBadge status={lead.status} />
            <span className="text-xs text-muted-foreground bg-slate-100 px-2 py-0.5 rounded font-mono">
              {lead.ref_no}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
            <span className="capitalize">{lead.lead_type}</span>
            {lead.nationality && <span>· {lead.nationality}</span>}
            {lead.source && <span>· {lead.source}</span>}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {me?.role === "ceo" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAssign(true)}
            >
              <UserPlus className="w-3.5 h-3.5 mr-1" />
              Assign
            </Button>
          )}
          <Select
            value={lead.status}
            onValueChange={(v) =>
              updateStatus({ id: id as Id<"leads">, status: v as any })
            }
          >
            <SelectTrigger className="w-44 h-8 text-sm">
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Profile + Requirements */}
        <div className="space-y-4">
          {/* Contact Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              {lead.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  <a href={`tel:${lead.phone}`} className="hover:text-[#1A2D4A]">
                    {lead.phone}
                  </a>
                </div>
              )}
              {lead.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  <a href={`mailto:${lead.email}`} className="hover:text-[#1A2D4A] truncate">
                    {lead.email}
                  </a>
                </div>
              )}
              {lead.nationality && (
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{lead.nationality}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[#C9A84C] font-semibold">
                  {formatAED(lead.budget_min)} – {formatAED(lead.budget_max)}
                </span>
              </div>
              {lead.property_type_pref && (
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{lead.property_type_pref}</span>
                </div>
              )}
              {lead.area_pref && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{lead.area_pref}</span>
                </div>
              )}
              {lead.timeline && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{lead.timeline}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {lead.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {lead.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Activity Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Log Activity */}
              <div className="mb-5 p-3 bg-slate-50 rounded-lg border">
                <div className="flex gap-2 mb-2">
                  {(["call", "whatsapp", "email", "viewing", "note"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setActType(t)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-medium transition-colors capitalize",
                        actType === t
                          ? "bg-[#1A2D4A] text-white"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={actNotes}
                    onChange={(e) => setActNotes(e.target.value)}
                    placeholder={`Log a ${actType}…`}
                    className="text-sm h-8"
                    onKeyDown={(e) => e.key === "Enter" && handleLogActivity()}
                  />
                  <Button
                    size="sm"
                    onClick={handleLogActivity}
                    disabled={!actNotes.trim()}
                  >
                    Log
                  </Button>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-3">
                {!activities || activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No activity recorded yet
                  </p>
                ) : (
                  activities.map((act) => {
                    const Icon = ACTIVITY_ICONS[act.type] ?? FileText;
                    return (
                      <div key={act._id} className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5 text-[#1A2D4A]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium capitalize text-[#1A2D4A]">
                              {act.type.replace(/_/g, " ")}
                            </span>
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {timeAgo(act.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                            {act.notes}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assign Agent Modal */}
      {me?.role === "ceo" && (
        <AssignAgentModal
          open={showAssign}
          onClose={() => setShowAssign(false)}
          currentAgentIds={lead.assigned_agent_id ? [lead.assigned_agent_id] : []}
          onAssign={(ids) => {
            if (ids[0]) {
              assignLead({
                lead_id: id as Id<"leads">,
                agent_clerk_id: ids[0],
              });
            }
          }}
          multi={false}
          title="Assign Lead to Agent"
        />
      )}
    </div>
  );
}
