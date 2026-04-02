import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import LeadCard from "./LeadCard";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "viewing_scheduled"
  | "offer_made"
  | "negotiating"
  | "closed"
  | "lost";

const COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
  { id: "new", label: "New", color: "border-sky-400 bg-sky-50" },
  { id: "contacted", label: "Contacted", color: "border-indigo-400 bg-indigo-50" },
  { id: "qualified", label: "Qualified", color: "border-teal-400 bg-teal-50" },
  { id: "viewing_scheduled", label: "Viewing", color: "border-violet-400 bg-violet-50" },
  { id: "offer_made", label: "Offer Made", color: "border-orange-400 bg-orange-50" },
  { id: "negotiating", label: "Negotiating", color: "border-amber-400 bg-amber-50" },
  { id: "closed", label: "Closed", color: "border-emerald-400 bg-emerald-50" },
  { id: "lost", label: "Lost", color: "border-red-400 bg-red-50" },
];

interface KanbanBoardProps {
  leads: Doc<"leads">[];
}

export default function KanbanBoard({ leads }: KanbanBoardProps) {
  const updateStatus = useMutation(api.leads.updateLeadStatus);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeLead = activeId ? leads.find((l) => l._id === activeId) : null;

  function onDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as Id<"leads">;
    const targetStatus = over.id as LeadStatus;

    // Check if dropped on a column header
    if (COLUMNS.find((c) => c.id === targetStatus)) {
      const lead = leads.find((l) => l._id === leadId);
      if (lead && lead.status !== targetStatus) {
        await updateStatus({ id: leadId, status: targetStatus });
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 min-h-[60vh]">
        {COLUMNS.map((col) => {
          const colLeads = leads.filter((l) => l.status === col.id);
          return (
            <div
              key={col.id}
              className="flex flex-col shrink-0 w-[240px]"
            >
              {/* Column header — also a drop target */}
              <div
                id={col.id}
                className={cn(
                  "rounded-t-lg px-3 py-2 border-t-2 border-x border-b-0 mb-0.5",
                  col.color
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    {col.label}
                  </span>
                  <span className="text-xs font-bold bg-white/80 rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                    {colLeads.length}
                  </span>
                </div>
              </div>

              {/* Cards */}
              <div
                className={cn(
                  "flex-1 rounded-b-lg border border-border/50 bg-slate-50/60 p-2 space-y-2 min-h-[100px]"
                )}
              >
                <SortableContext
                  items={colLeads.map((l) => l._id)}
                  strategy={verticalListSortingStrategy}
                >
                  {colLeads.map((lead) => (
                    <LeadCard key={lead._id} lead={lead} />
                  ))}
                </SortableContext>
                {colLeads.length === 0 && (
                  <div className="h-16 border-2 border-dashed border-border/40 rounded-md flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground/50">
                      Drop here
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeLead && <LeadCard lead={activeLead} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}
