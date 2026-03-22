'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { isOverdue } from '@/lib/overdue.client'

type ApiDeal = {
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

function formatDollars(value: number): string {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

interface DealCardProps {
  deal: ApiDeal
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

        {/* Deadline row */}
        {deal.deadline && (
          <div className="flex items-center justify-end">
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
          </div>
        )}

        {/* Deal value */}
        <p className="text-xs font-mono font-semibold text-foreground tabular-nums">
          {formatDollars(deal.dealValue)}
        </p>
      </div>
    </Link>
  )
}
