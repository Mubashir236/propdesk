import { cn } from "@/lib/utils";

type Status =
  | "available"
  | "under_offer"
  | "reserved"
  | "sold"
  | "off_market"
  | "expired"
  | "viewing_arranged"
  | "rented"
  | "renewal_pending"
  | "vacant"
  | "new"
  | "contacted"
  | "qualified"
  | "viewing_scheduled"
  | "offer_made"
  | "negotiating"
  | "closed"
  | "lost"
  | "in_progress"
  | string;

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  // Sales / rental listings
  available: { label: "Available", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  under_offer: { label: "Under Offer", className: "bg-amber-100 text-amber-700 border-amber-200" },
  reserved: { label: "Reserved", className: "bg-orange-100 text-orange-700 border-orange-200" },
  sold: { label: "Sold", className: "bg-blue-100 text-blue-700 border-blue-200" },
  off_market: { label: "Off Market", className: "bg-slate-100 text-slate-600 border-slate-200" },
  expired: { label: "Expired", className: "bg-red-100 text-red-600 border-red-200" },

  // Rental specific
  viewing_arranged: { label: "Viewing Arranged", className: "bg-violet-100 text-violet-700 border-violet-200" },
  rented: { label: "Rented", className: "bg-blue-100 text-blue-700 border-blue-200" },
  renewal_pending: { label: "Renewal Pending", className: "bg-amber-100 text-amber-700 border-amber-200" },
  vacant: { label: "Vacant", className: "bg-slate-100 text-slate-600 border-slate-200" },

  // Lead statuses
  new: { label: "New", className: "bg-sky-100 text-sky-700 border-sky-200" },
  contacted: { label: "Contacted", className: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  qualified: { label: "Qualified", className: "bg-teal-100 text-teal-700 border-teal-200" },
  viewing_scheduled: { label: "Viewing", className: "bg-violet-100 text-violet-700 border-violet-200" },
  offer_made: { label: "Offer Made", className: "bg-orange-100 text-orange-700 border-orange-200" },
  negotiating: { label: "Negotiating", className: "bg-amber-100 text-amber-700 border-amber-200" },
  closed: { label: "Closed", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  lost: { label: "Lost", className: "bg-red-100 text-red-600 border-red-200" },

  // Deal statuses
  in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-700 border-blue-200" },

  // Off-plan units
  available_unit: { label: "Available", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

interface StatusBadgeProps {
  status: Status;
  size?: "sm" | "md";
  className?: string;
}

export default function StatusBadge({ status, size = "md", className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status.replace(/_/g, " "),
    className: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
