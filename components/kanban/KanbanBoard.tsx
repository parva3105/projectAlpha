'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { toast } from 'sonner'
import {
  STAGE_ORDER,
  STAGE_LABELS,
  SYSTEM_CONTROLLED_STAGES,
} from '@/lib/stage-transitions.client'
import { KanbanColumn } from './KanbanColumn'
import { KanbanFilters } from './KanbanFilters'
import { DealCard } from './DealCard'
import type { MockDeal } from '@/lib/mock/deals'

interface KanbanBoardProps {
  initialDeals: MockDeal[]
}

export function KanbanBoard({ initialDeals }: KanbanBoardProps) {
  const [deals, setDeals] = useState<MockDeal[]>(initialDeals)
  const [filteredDeals, setFilteredDeals] = useState<MockDeal[]>(initialDeals)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  const activeDeal = activeId ? deals.find((d) => d.id === activeId) ?? null : null

  function dealsByStage(stage: string): MockDeal[] {
    return filteredDeals.filter((d) => d.stage === stage)
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const dealId = active.id as string
    const targetStage = over.id as string

    const deal = deals.find((d) => d.id === dealId)
    if (!deal) return

    // No-op if dropped on same column
    if (deal.stage === targetStage) return

    // Guard: system-controlled stages cannot be manually set
    if (SYSTEM_CONTROLLED_STAGES.includes(targetStage)) {
      toast.error('This stage is system-controlled and cannot be set manually.')
      return
    }

    // Move deal to new stage in local state
    const updated = deals.map((d) =>
      d.id === dealId ? { ...d, stage: targetStage } : d
    )
    setDeals(updated)
    setFilteredDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: targetStage } : d))
    )
    toast.success(`Moved to ${STAGE_LABELS[targetStage]}`)
  }

  function handleFilterChange(filtered: MockDeal[]) {
    setFilteredDeals(filtered)
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Deal Pipeline</h1>

      <KanbanFilters deals={deals} onFilterChange={handleFilterChange} />

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGE_ORDER.map((stage) => (
            <KanbanColumn
              key={stage}
              id={stage}
              label={STAGE_LABELS[stage]}
              deals={dealsByStage(stage)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeDeal ? (
            <div className="opacity-90 rotate-2 scale-105">
              <DealCard deal={activeDeal} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
