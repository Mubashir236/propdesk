import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface AssignAgentModalProps {
  open: boolean;
  onClose: () => void;
  currentAgentIds: string[];
  onAssign: (agentIds: string[]) => void;
  multi?: boolean;
  title?: string;
}

export default function AssignAgentModal({
  open,
  onClose,
  currentAgentIds,
  onAssign,
  multi = true,
  title = "Assign Agents",
}: AssignAgentModalProps) {
  const agents = useQuery(api.users.listAgents);
  const [selected, setSelected] = useState<string[]>(currentAgentIds);

  function toggleAgent(id: string) {
    if (multi) {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
      );
    } else {
      setSelected([id]);
    }
  }

  function initials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-72 overflow-y-auto py-1">
          {!agents || agents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No agents found
            </p>
          ) : (
            agents
              .filter((a) => a.is_active)
              .map((agent) => {
                const isSelected = selected.includes(agent.clerk_user_id);
                return (
                  <button
                    key={agent._id}
                    onClick={() => toggleAgent(agent.clerk_user_id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left",
                      isSelected
                        ? "border-[#C9A84C] bg-[#C9A84C]/5"
                        : "border-border hover:bg-muted/50"
                    )}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {initials(agent.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{agent.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {agent.email}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#C9A84C] shrink-0" />
                    )}
                  </button>
                );
              })
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onAssign(selected);
              onClose();
            }}
          >
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
