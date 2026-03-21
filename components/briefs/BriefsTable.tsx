'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { MockBrief } from '@/lib/mock/briefs'

const STATUS_OPTIONS = ['ALL', 'NEW', 'REVIEWED', 'CONVERTED', 'DECLINED'] as const

function statusBadge(status: string) {
  switch (status) {
    case 'NEW':
      return <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/20 hover:bg-blue-500/15 text-xs">NEW</Badge>
    case 'REVIEWED':
      return <Badge variant="outline" className="text-xs">REVIEWED</Badge>
    case 'CONVERTED':
      return <Badge className="bg-green-500/15 text-green-400 border-green-500/20 hover:bg-green-500/15 text-xs">CONVERTED</Badge>
    case 'DECLINED':
      return <Badge variant="destructive" className="text-xs">DECLINED</Badge>
    default:
      return <Badge variant="outline" className="text-xs">{status}</Badge>
  }
}

interface BriefsTableProps {
  initialBriefs: MockBrief[]
}

export function BriefsTable({ initialBriefs }: BriefsTableProps) {
  const [briefs] = useState<MockBrief[]>(initialBriefs)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const filtered =
    statusFilter === 'ALL'
      ? briefs
      : briefs.filter(b => b.status === statusFilter)

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Select value={statusFilter} onValueChange={(val) => { if (val !== null) setStatusFilter(val) }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(opt => (
              <SelectItem key={opt} value={opt}>
                {opt === 'ALL' ? 'All Statuses' : opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No briefs yet.</p>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Niche</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(brief => (
                <TableRow key={brief.id}>
                  <TableCell>
                    <Link
                      href={`/briefs/${brief.id}`}
                      className="font-medium text-sm hover:underline"
                    >
                      {brief.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{brief.brandManagerName}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{brief.brandManagerCompany}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{brief.platform}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm tabular-nums">
                      ${brief.budget.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{brief.niche}</span>
                  </TableCell>
                  <TableCell>{statusBadge(brief.status)}</TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                      {new Date(brief.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
