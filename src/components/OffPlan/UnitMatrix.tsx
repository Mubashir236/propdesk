import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { formatAED } from "@/lib/utils";
import { useState } from "react";

interface UnitMatrixProps {
  units: Doc<"off_plan_units">[];
  isCeo: boolean;
}

const STATUS_COLORS = {
  available: "bg-emerald-100 border-emerald-300 text-emerald-700 hover:bg-emerald-200",
  reserved: "bg-amber-100 border-amber-300 text-amber-700 hover:bg-amber-200",
  sold: "bg-blue-100 border-blue-300 text-blue-700",
};

export default function UnitMatrix({ units, isCeo }: UnitMatrixProps) {
  const updateStatus = useMutation(api.offplan.updateUnitStatus);
  const [selected, setSelected] = useState<Doc<"off_plan_units"> | null>(null);

  // Group by floor
  const floors = [...new Set(units.map((u) => u.floor))].sort((a, b) => b - a);
  const unitsPerFloor = (floor: number) =>
    units.filter((u) => u.floor === floor).sort((a, b) =>
      a.unit_number.localeCompare(b.unit_number)
    );

  // Summary counts
  const available = units.filter((u) => u.status === "available").length;
  const reserved = units.filter((u) => u.status === "reserved").length;
  const sold = units.filter((u) => u.status === "sold").length;

  return (
    <div className="space-y-4">
      {/* Legend + summary */}
      <div className="flex items-center gap-4 flex-wrap">
        {[
          { status: "available", label: "Available", count: available, color: "bg-emerald-200" },
          { status: "reserved", label: "Reserved", count: reserved, color: "bg-amber-200" },
          { status: "sold", label: "Sold", count: sold, color: "bg-blue-200" },
        ].map(({ status, label, count, color }) => (
          <div key={status} className="flex items-center gap-1.5 text-xs">
            <div className={cn("w-3 h-3 rounded-sm border", color)} />
            <span className="text-muted-foreground">{label}</span>
            <span className="font-bold">{count}</span>
          </div>
        ))}
      </div>

      {/* Floor grid */}
      <div className="overflow-x-auto">
        <div className="space-y-1 min-w-[400px]">
          {floors.map((floor) => (
            <div key={floor} className="flex items-center gap-1">
              <div className="w-12 text-right text-xs text-muted-foreground font-mono shrink-0">
                F{floor}
              </div>
              <div className="flex gap-1 flex-wrap">
                {unitsPerFloor(floor).map((unit) => (
                  <button
                    key={unit._id}
                    onClick={() => setSelected(selected?._id === unit._id ? null : unit)}
                    disabled={unit.status === "sold" && !isCeo}
                    className={cn(
                      "w-14 h-10 rounded border text-[10px] font-semibold transition-all",
                      STATUS_COLORS[unit.status] ?? "bg-slate-100",
                      selected?._id === unit._id && "ring-2 ring-[#1A2D4A] ring-offset-1",
                      "cursor-pointer"
                    )}
                  >
                    {unit.unit_number}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected unit detail */}
      {selected && (
        <div className="mt-3 p-4 bg-slate-50 rounded-lg border animate-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-sm">Unit {selected.unit_number} — Floor {selected.floor}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selected.unit_type} · {selected.bedrooms === "Studio" ? "Studio" : `${selected.bedrooms} BR`} · {selected.size_sqft} sqft
              </p>
              <p className="text-sm font-bold text-[#C9A84C] mt-1">{formatAED(selected.price_aed)}</p>
            </div>
            {isCeo && selected.status !== "sold" && (
              <div className="flex gap-2">
                {(["available", "reserved", "sold"] as const)
                  .filter((s) => s !== selected.status)
                  .map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        updateStatus({ unit_id: selected._id as Id<"off_plan_units">, status: s });
                        setSelected(null);
                      }}
                      className="px-2 py-1 text-[10px] font-semibold rounded border capitalize bg-white hover:bg-muted transition-colors"
                    >
                      Mark {s}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
