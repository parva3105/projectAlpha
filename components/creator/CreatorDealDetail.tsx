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
import { ContentSubmissionForm } from '@/components/creator/ContentSubmissionForm'
import type { MockDeal } from '@/lib/mock/deals'
import type { MockSubmission } from '@/lib/mock/submissions'

const STAGE_LABELS: Record<string, string> = {
  BRIEF_RECEIVED: 'Brief Received',
  CREATOR_ASSIGNED: 'Creator Assigned',
  CONTRACT_SENT: 'Contract Sent',
  IN_PRODUCTION: 'In Production',
  PENDING_APPROVAL: 'Pending Approval',
  LIVE: 'Live',
  PAYMENT_PENDING: 'Payment Pending',
  CLOSED: 'Closed',
}

const CONTRACT_LABELS: Record<string, string> = {
  NOT_SENT: 'Not Sent',
  SENT: 'Sent',
  SIGNED: 'Signed',
}

const PAYMENT_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  RECEIVED: 'Received',
}

function submissionStatusBadge(status: string) {
  switch (status) {
    case 'APPROVED':
      return (
        <Badge className="bg-green-500/15 text-green-400 border-green-500/20 hover:bg-green-500/15 text-xs">
          Approved
        </Badge>
      )
    case 'CHANGES_REQUESTED':
      return (
        <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/15 text-xs">
          Changes Requested
        </Badge>
      )
    case 'PENDING':
      return (
        <Badge variant="outline" className="text-xs">
          Pending Review
        </Badge>
      )
    default:
      return <Badge variant="outline" className="text-xs">{status}</Badge>
  }
}

interface CreatorDealDetailProps {
  initialDeal: MockDeal
  initialSubmissions: MockSubmission[]
}

export function CreatorDealDetail({
  initialDeal,
  initialSubmissions,
}: CreatorDealDetailProps) {
  const [submissions, setSubmissions] = useState<MockSubmission[]>(initialSubmissions)
  const [stage, setStage] = useState<string>(initialDeal.stage)

  function handleSubmitted(sub: MockSubmission) {
    setSubmissions(prev => [...prev, sub])
    if (stage === 'IN_PRODUCTION') {
      setStage('PENDING_APPROVAL')
    }
  }

  const canSubmit = stage === 'IN_PRODUCTION' || stage === 'PENDING_APPROVAL'

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <p className="text-sm text-muted-foreground">{initialDeal.brand.name}</p>
        <h1 className="text-2xl font-bold tracking-tight mt-1">{initialDeal.title}</h1>
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="outline">{initialDeal.platform}</Badge>
          <Badge variant="outline">{STAGE_LABELS[stage] ?? stage}</Badge>
        </div>
      </div>

      {/* Payout — prominent */}
      <div className="rounded-lg border border-border p-6 text-center">
        <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-2">
          Your Payout
        </p>
        <p className="text-4xl font-mono font-bold tabular-nums">
          ${initialDeal.creatorPayout.toLocaleString()}
        </p>
        <div className="mt-3">
          <Badge
            variant={initialDeal.paymentStatus === 'RECEIVED' ? 'default' : 'outline'}
            className="text-xs"
          >
            Payment: {PAYMENT_LABELS[initialDeal.paymentStatus] ?? initialDeal.paymentStatus}
          </Badge>
        </div>
      </div>

      {/* Brief */}
      {initialDeal.notes && (
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-2">
            Brief
          </p>
          <p className="text-sm leading-6">{initialDeal.notes}</p>
        </div>
      )}

      {/* Deadline + Contract */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">
            Deadline
          </p>
          <p className="font-mono text-sm tabular-nums">
            {new Date(initialDeal.deadline).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">
            Contract
          </p>
          <Badge variant="outline" className="text-xs">
            {CONTRACT_LABELS[initialDeal.contractStatus] ?? initialDeal.contractStatus}
          </Badge>
        </div>
      </div>

      {/* Submission History */}
      <div className="border-t border-border pt-6">
        <h2 className="text-base font-semibold mb-4">Submission History</h2>
        {submissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No submissions yet.</p>
        ) : (
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Round</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Feedback</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map(sub => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <span className="font-mono text-sm tabular-nums">{sub.round}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {new Date(sub.submittedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </TableCell>
                    <TableCell>{submissionStatusBadge(sub.status)}</TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {sub.feedback ?? '—'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Submission Form */}
      {canSubmit && (
        <div className="border-t border-border pt-6">
          <h2 className="text-base font-semibold mb-4">Submit Content</h2>
          <ContentSubmissionForm
            dealId={initialDeal.id}
            existingRounds={submissions.length}
            onSubmitted={handleSubmitted}
          />
        </div>
      )}
    </div>
  )
}
