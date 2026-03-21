'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { isOverdue } from '@/lib/overdue.client'
import type { MockDeal } from '@/lib/mock/deals'

function formatDollars(value: number): string {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

interface DealCardProps {
  deal: MockDeal
}

export function DealCard({ deal }: DealCardProps) {
  const overdue = isOverdue(deal)

  return (
    <Link href={`/deals/${deal.id}`} className="block">
      <div className="rounded-lg border border-border bg-card p-3 space-y-2 hover:border-ring/50 transition-colors cursor-pointer shadow-sm">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-tight line-clamp-2 text-card-foreground">
            {deal.title}
          </p>
          {overdue && (
            <Badge variant="destructive" className="text-[10px] shrink-0">
              Overdue
            </Badge>
          )}
        </div>

        {/* Brand + Creator */}
        <div className="text-xs text-muted-foreground space-y-0.5">
          <p className="truncate">{deal.brand.name}</p>
          <p className="truncate font-mono">
            {deal.creator ? deal.creator.name : 'Unassigned'}
          </p>
        </div>

        {/* Platform badge + deadline row */}
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {deal.platform}
          </Badge>
          {deal.deadline && (
            <span
              className={`text-[10px] font-mono tabular-nums ${
                overdue ? 'text-destructive' : 'text-muted-foreground'
              }`}
            >
              {new Date(deal.deadline).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>

        {/* Deal value */}
        <p className="text-xs font-mono font-semibold text-foreground tabular-nums">
          {formatDollars(deal.dealValue)}
        </p>
      </div>
    </Link>
  )
}
