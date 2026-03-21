'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { STAGE_ORDER, STAGE_LABELS } from '@/lib/stage-transitions.client'
import { isOverdue } from '@/lib/overdue.client'
import type { MockDeal } from '@/lib/mock/deals'

function formatDollars(value: number): string {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function StageBadge({ stage }: { stage: string }) {
  const classMap: Record<string, string> = {
    BRIEF_RECEIVED: '',
    CREATOR_ASSIGNED: '',
    CONTRACT_SENT: '',
    IN_PRODUCTION:
      'bg-blue-500/20 text-blue-400 border-blue-500/30',
    PENDING_APPROVAL:
      'bg-blue-500/20 text-blue-400 border-blue-500/30',
    LIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
    PAYMENT_PENDING:
      'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    CLOSED: '',
  }

  const variantMap: Record<
    string,
    'secondary' | 'outline' | 'default' | 'destructive'
  > = {
    BRIEF_RECEIVED: 'secondary',
    CREATOR_ASSIGNED: 'secondary',
    CONTRACT_SENT: 'outline',
    IN_PRODUCTION: 'outline',
    PENDING_APPROVAL: 'outline',
    LIVE: 'outline',
    PAYMENT_PENDING: 'outline',
    CLOSED: 'secondary',
  }

  const customClass = classMap[stage] ?? ''
  const variant = variantMap[stage] ?? 'secondary'

  return (
    <Badge variant={variant} className={customClass}>
      {STAGE_LABELS[stage] ?? stage}
    </Badge>
  )
}

interface DealsTableProps {
  initialDeals: MockDeal[]
}

export function DealsTable({ initialDeals }: DealsTableProps) {
  const [stageFilter, setStageFilter] = useState('ALL')
  const [overdueOnly, setOverdueOnly] = useState(false)

  const filtered = initialDeals.filter((deal) => {
    if (stageFilter !== 'ALL' && deal.stage !== stageFilter) return false
    if (overdueOnly && !isOverdue(deal)) return false
    return true
  })

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Deals</h1>
        <Link
          href="/deals/new"
          className="inline-flex h-7 items-center justify-center rounded-[min(var(--radius-md),12px)] border border-transparent bg-primary px-2.5 text-[0.8rem] font-medium text-primary-foreground transition-all hover:opacity-90"
        >
          New Deal
        </Link>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={stageFilter} onValueChange={(val) => setStageFilter(val ?? 'ALL')}>
          <SelectTrigger className="h-8 w-44 text-xs">
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="text-xs">
              All Stages
            </SelectItem>
            {STAGE_ORDER.map((stage) => (
              <SelectItem key={stage} value={stage} className="text-xs">
                {STAGE_LABELS[stage]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <Checkbox
            checked={overdueOnly}
            onCheckedChange={(checked) => setOverdueOnly(checked === true)}
          />
          <span className="text-xs text-foreground">Overdue only</span>
        </label>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No deals found.
        </p>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Payout</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((deal) => {
                const overdue = isOverdue(deal)
                return (
                  <TableRow key={deal.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/deals/${deal.id}`}
                        className="hover:underline underline-offset-2 text-foreground"
                      >
                        {deal.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {deal.brand.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {deal.creator ? deal.creator.name : (
                        <span className="italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StageBadge stage={deal.stage} />
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-sm font-mono tabular-nums ${
                          overdue ? 'text-destructive font-medium' : 'text-muted-foreground'
                        }`}
                      >
                        {deal.deadline
                          ? new Date(deal.deadline).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-sm">
                      {formatDollars(deal.dealValue)}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-sm text-green-400">
                      {formatDollars(deal.creatorPayout)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
