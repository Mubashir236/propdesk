import { useNavigate } from "react-router-dom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import StatusBadge from "@/components/Shared/StatusBadge";
import { formatAED, timeAgo } from "@/lib/utils";
import { Phone, Mail, GripVertical, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Doc } from "../../../convex/_generated/dataModel";

interface LeadCardProps {
  lead: Doc<"leads">;
  isDragging?: boolean;
}

export default function LeadCard({ lead, isDragging }: LeadCardProps) {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: lead._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const typeColors: Record<string, string> = {
    buyer: "text-blue-600",
    tenant: "text-violet-600",
    investor: "text-emerald-600",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group",
        (isDragging || isSortableDragging) && "opacity-50 shadow-lg ring-2 ring-[#C9A84C]/50"
      )}
    >
      {/* Drag handle + title row */}
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing shrink-0 touch-none"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <div
          className="flex-1 min-w-0"
          onClick={() => navigate(`/leads/${lead._id}`)}
        >
          <div className="flex items-start justify-between gap-1 mb-1">
            <p className="text-sm font-semibold leading-tight truncate">
              {lead.name}
            </p>
            <span
              className={cn(
                "text-[10px] font-semibold uppercase shrink-0",
                typeColors[lead.lead_type] ?? "text-muted-foreground"
              )}
            >
              {lead.lead_type}
            </span>
          </div>

          {/* Budget */}
          <p className="text-xs text-[#C9A84C] font-semibold mb-1.5">
            {lead.budget_max > 0
              ? `Up to ${formatAED(lead.budget_max)}`
              : "Budget TBC"}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {lead.area_pref && (
              <span className="text-[10px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">
                {lead.area_pref}
              </span>
            )}
            {lead.property_type_pref && (
              <span className="text-[10px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">
                {lead.property_type_pref}
              </span>
            )}
          </div>

          {/* Contact row */}
          <div className="flex items-center gap-2 text-muted-foreground">
            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:text-[#1A2D4A] transition-colors"
              >
                <Phone className="w-3 h-3" />
              </a>
            )}
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:text-[#1A2D4A] transition-colors"
              >
                <Mail className="w-3 h-3" />
              </a>
            )}
            <span className="ml-auto text-[10px] text-muted-foreground">
              {lead.ref_no}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
