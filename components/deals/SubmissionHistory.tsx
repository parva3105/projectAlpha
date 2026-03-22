'use client'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export type ApiSubmission = {
  id: string
  dealId: string
  creatorId: string
  round: number
  url: string | null
  fileKey: string | null
  status: string
  feedback: string | null
  submittedAt: string
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'APPROVED') {
    return (
      <Badge
        variant="outline"
        className="bg-green-500/20 text-green-400 border-green-500/30"
      >
        Approved
      </Badge>
    )
  }
  if (status === 'CHANGES_REQUESTED') {
    return (
      <Badge
        variant="outline"
        className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      >
        Changes Requested
      </Badge>
    )
  }
  return <Badge variant="outline">Pending</Badge>
}

interface SubmissionHistoryProps {
  submissions: ApiSubmission[]
}

export function SubmissionHistory({ submissions }: SubmissionHistoryProps) {
  if (submissions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">No submissions yet.</p>
    )
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Round</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Feedback</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((sub) => (
            <TableRow key={sub.id}>
              <TableCell className="font-mono tabular-nums text-sm">
                #{sub.round}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(sub.submittedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </TableCell>
              <TableCell>
                <StatusBadge status={sub.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-xs">
                {sub.feedback ? (
                  <span className="line-clamp-2">{sub.feedback}</span>
                ) : (
                  <span className="italic">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
