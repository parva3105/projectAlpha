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

export type ApiDeal = {
  id: string
  title: string
  agencyClerkId: string
  brandId: string
  creatorId: string | null
  briefId: string | null
  stage: string
  dealValue: number
  commissionPct: number
  creatorPayout: number
  deadline: string | null
  contractStatus: string
  contractUrl: string | null
  paymentStatus: string
  notes: string | null
  createdAt: string
  updatedAt: string
  brand: { id: string; name: string; website: string | null }
  creator: { id: string; name: string; handle: string; avatarUrl: string | null } | null
}

interface KanbanBoardProps {
  initialDeals: ApiDeal[]
}

export function KanbanBoard({ initialDeals }: KanbanBoardProps) {
  const [deals, setDeals] = useState<ApiDeal[]>(initialDeals)
  const [filteredDeals, setFilteredDeals] = useState<ApiDeal[]>(initialDeals)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  const activeDeal = activeId ? deals.find((d) => d.id === activeId) ?? null : null

  function dealsByStage(stage: string): ApiDeal[] {
    return filteredDeals.filter((d) => d.stage === stage)
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  async function handleDragEnd(event: DragEndEvent) {
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

    // Optimistic update — remember original stage for rollback
    const originalStage = deal.stage
    const applyStage = (stage: string) => (d: ApiDeal) =>
      d.id === dealId ? { ...d, stage } : d

    setDeals((prev) => prev.map(applyStage(targetStage)))
    setFilteredDeals((prev) => prev.map(applyStage(targetStage)))

    // Persist to API
    const res = await fetch(`/api/v1/deals/${dealId}/stage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: targetStage }),
    })

    if (!res.ok) {
      // Revert optimistic update
      setDeals((prev) => prev.map(applyStage(originalStage)))
      setFilteredDeals((prev) => prev.map(applyStage(originalStage)))
      toast.error('Failed to move deal — changes reverted')
      return
    }

    toast.success(`Moved to ${STAGE_LABELS[targetStage]}`)
  }

  function handleFilterChange(filtered: ApiDeal[]) {
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
