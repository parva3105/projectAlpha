'use client';

import { useDroppable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { DealCard, type DealCardDeal } from "@/components/deals/DealCard";
import { DealDraggable } from "./DealDraggable";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  stage: string;
  stageLabel: string;
  deals: DealCardDeal[];
}

export function KanbanColumn({ stage, stageLabel, deals }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div className="flex flex-col w-64 shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2 mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground truncate">
          {stageLabel}
        </h3>
        <Badge variant="secondary" className="text-[10px] tabular-nums">
          {deals.length}
        </Badge>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 flex flex-col gap-2 rounded-lg p-2 min-h-40 transition-colors",
          isOver ? "bg-accent/60" : "bg-muted/40"
        )}
      >
        {deals.map((deal) => (
          <DealDraggable key={deal.id} id={deal.id}>
            <DealCard deal={deal} />
          </DealDraggable>
        ))}

        {deals.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-muted-foreground/50 select-none">
              No deals
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
