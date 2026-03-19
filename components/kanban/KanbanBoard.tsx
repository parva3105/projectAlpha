'use client';

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { toast } from "sonner";
import {
  STAGE_ORDER,
  STAGE_LABELS,
  SYSTEM_CONTROLLED_STAGES,
  type DealStage,
} from "@/lib/stage-transitions";
import { KanbanColumn } from "./KanbanColumn";
import { DealCard, type DealCardDeal } from "@/components/deals/DealCard";

export interface KanbanDeal extends DealCardDeal {
  stage: DealStage;
}

interface KanbanBoardProps {
  initialDeals: KanbanDeal[];
}

export function KanbanBoard({ initialDeals }: KanbanBoardProps) {
  const [deals, setDeals] = useState<KanbanDeal[]>(initialDeals);
  const [activeDealId, setActiveDealId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const dealsByStage = (stage: DealStage): KanbanDeal[] =>
    deals.filter((d) => d.stage === stage);

  const activeDeal = activeDealId
    ? deals.find((d) => d.id === activeDealId) ?? null
    : null;

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDealId(null);

    if (!over) return;

    const dealId = active.id as string;
    const targetStage = over.id as DealStage;

    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return;

    // No-op if dropped on the same column
    if (deal.stage === targetStage) return;

    // Guard: system-controlled stages cannot be manually set
    if (SYSTEM_CONTROLLED_STAGES.includes(targetStage)) {
      toast.error("This stage is set automatically by the system");
      return;
    }

    // Optimistic update — move deal to new column immediately
    const previousStage = deal.stage;
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: targetStage } : d))
    );

    try {
      const res = await fetch(`/api/v1/deals/${dealId}/stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetStage }),
      });

      const json = (await res.json()) as { data: unknown; error: string | null };

      if (!res.ok || json.error) {
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
    } catch (err) {
      // Revert optimistic update
      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, stage: previousStage } : d))
      );
      toast.error(
        err instanceof Error ? err.message : "Failed to update deal stage"
      );
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e) => setActiveDealId(e.active.id as string)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDealId(null)}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGE_ORDER.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            stageLabel={STAGE_LABELS[stage]}
            deals={dealsByStage(stage)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeDeal ? <DealCard deal={activeDeal} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
