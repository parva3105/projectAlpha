'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AddCreatorSheet } from '@/components/roster/AddCreatorSheet'
import type { MockCreator } from '@/lib/mock/creators'
import type { MockDeal } from '@/lib/mock/deals'

const CLOSED_STAGES = ['CLOSED', 'LIVE']

function formatFollowers(count: number | null): string {
  if (!count) return '—'
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000) return `${Math.round(count / 1_000)}K`
  return count.toString()
}

interface RosterTableProps {
  initialCreators: MockCreator[]
  deals: MockDeal[]
}

export function RosterTable({ initialCreators, deals }: RosterTableProps) {
  const [creators, setCreators] = useState<MockCreator[]>(initialCreators)

  function handleCreated(creator: MockCreator) {
    setCreators(prev => [...prev, creator])
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Creator Roster</h1>
        <AddCreatorSheet onCreated={handleCreated} />
      </div>

      {creators.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Your roster is empty. Add your first creator.
        </p>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Creator</TableHead>
                <TableHead>Handle</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Niche</TableHead>
                <TableHead>Followers</TableHead>
                <TableHead>Active Deals</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creators.map(creator => {
                const initials = creator.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
                const activeDeals = deals.filter(
                  d =>
                    d.creatorId === creator.id &&
                    !CLOSED_STAGES.includes(d.stage)
                ).length

                return (
                  <TableRow key={creator.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
                          {initials}
                        </div>
                        <span className="font-medium text-sm">{creator.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm text-muted-foreground">
                        @{creator.handle}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {creator.platforms[0] ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {creator.nicheTags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {formatFollowers(creator.followerCount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm tabular-nums">
                        {activeDeals}
                      </span>
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
