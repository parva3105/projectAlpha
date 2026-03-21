'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  STAGE_ORDER,
  STAGE_LABELS,
  SYSTEM_CONTROLLED_STAGES,
  getPreviousStage,
} from '@/lib/stage-transitions.client'
import type { MockDeal } from '@/lib/mock/deals'

interface StageControlPanelProps {
  deal: MockDeal
  onDealChange: (deal: MockDeal) => void
}

export function StageControlPanel({ deal, onDealChange }: StageControlPanelProps) {
  const [selectedStage, setSelectedStage] = useState('')

  const currentIndex = STAGE_ORDER.indexOf(deal.stage)
  // All stages strictly after current, excluding system-controlled ones
  const forwardStages = STAGE_ORDER.slice(currentIndex + 1).filter(
    (s) => !SYSTEM_CONTROLLED_STAGES.includes(s)
  )

  const isCurrentSystemControlled = SYSTEM_CONTROLLED_STAGES.includes(deal.stage)
  const previousStage = getPreviousStage(deal.stage)

  function handleAdvance() {
    if (!selectedStage) return
    const updated: MockDeal = { ...deal, stage: selectedStage }
    onDealChange(updated)
    setSelectedStage('')
    toast.success(`Advanced to ${STAGE_LABELS[selectedStage]}`)
  }

  function handleReopen() {
    if (!previousStage) return
    const updated: MockDeal = { ...deal, stage: previousStage }
    onDealChange(updated)
    toast.success(`Reverted to ${STAGE_LABELS[previousStage]}`)
  }

  return (
    <div className="space-y-4">
      {/* Current stage badge */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          Current stage:
        </span>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {STAGE_LABELS[deal.stage] ?? deal.stage}
        </Badge>
      </div>

      {/* System-controlled notice */}
      {isCurrentSystemControlled && (
        <p className="text-xs text-muted-foreground bg-muted/40 rounded-md px-3 py-2">
          This stage is system-controlled and is set automatically based on content
          actions.
        </p>
      )}

      {/* Advance stage */}
      {forwardStages.length > 0 && (
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-1">
            <label
              htmlFor="advance-stage-select"
              className="text-sm font-medium"
            >
              Advance to:
            </label>
            <select
              id="advance-stage-select"
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
            >
              <option value="">Select a stage...</option>
              {forwardStages.map((stage) => (
                <option key={stage} value={stage}>
                  {STAGE_LABELS[stage]}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={handleAdvance}
            disabled={!selectedStage}
            size="sm"
          >
            Advance Stage
          </Button>
        </div>
      )}

      {/* Reopen — hidden at BRIEF_RECEIVED */}
      {deal.stage !== 'BRIEF_RECEIVED' && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleReopen}
          disabled={!previousStage}
        >
          Reopen (one step back)
        </Button>
      )}
    </div>
  )
}
