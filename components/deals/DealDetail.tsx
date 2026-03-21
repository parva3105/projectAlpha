'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { SubmissionHistory } from '@/components/deals/SubmissionHistory'
import { StageControlPanel } from '@/components/deals/StageControlPanel'
import { isOverdue } from '@/lib/overdue.client'
import { STAGE_LABELS } from '@/lib/stage-transitions.client'
import type { MockDeal } from '@/lib/mock/deals'
import type { MockSubmission } from '@/lib/mock/submissions'

function formatDollars(value: number): string {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function contractStatusLabel(status: string): string {
  if (status === 'SENT') return 'Sent'
  if (status === 'SIGNED') return 'Signed'
  return 'Not Sent'
}

function contractBadgeVariant(
  status: string
): 'outline' | 'secondary' | 'default' {
  if (status === 'SIGNED') return 'default'
  if (status === 'SENT') return 'secondary'
  return 'outline'
}

interface DealDetailProps {
  initialDeal: MockDeal
  initialSubmissions: MockSubmission[]
}

export function DealDetail({ initialDeal, initialSubmissions }: DealDetailProps) {
  const [deal, setDeal] = useState<MockDeal>(initialDeal)
  const [submissions, setSubmissions] = useState<MockSubmission[]>(initialSubmissions)
  const [feedbackText, setFeedbackText] = useState('')
  const [showFeedbackInput, setShowFeedbackInput] = useState(false)
  const [contentUrl, setContentUrl] = useState('')

  const overdue = isOverdue(deal)
  const creatorPayout = deal.dealValue * (1 - deal.commissionPct / 100)

  // Section B handlers
  function handleMarkContractSent() {
    setDeal((prev) => ({ ...prev, contractStatus: 'SENT' }))
    toast.success('Contract marked as Sent.')
  }

  function handleMarkContractSigned() {
    setDeal((prev) => ({ ...prev, contractStatus: 'SIGNED' }))
    toast.success('Contract marked as Signed.')
  }

  // Section C handlers
  function handleApproveContent() {
    // Mark latest submission as APPROVED
    setSubmissions((prev) =>
      prev.map((s, i) =>
        i === prev.length - 1
          ? { ...s, status: 'APPROVED', reviewedAt: new Date().toISOString() }
          : s
      )
    )
    setDeal((prev) => ({ ...prev, stage: 'LIVE' }))
    toast.success('Content approved! Deal is now Live.')
  }

  function handleRequestChanges() {
    if (!feedbackText.trim()) {
      toast.error('Please enter feedback before requesting changes.')
      return
    }
    const nextRound = submissions.length + 1
    const newSub: MockSubmission = {
      id: `sub_${Date.now()}`,
      dealId: deal.id,
      creatorId: deal.creatorId ?? '',
      round: nextRound,
      url: null,
      fileKey: null,
      status: 'CHANGES_REQUESTED',
      feedback: feedbackText.trim(),
      submittedAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
    }
    setSubmissions((prev) => [...prev, newSub])
    setDeal((prev) => ({ ...prev, stage: 'IN_PRODUCTION' }))
    setFeedbackText('')
    setShowFeedbackInput(false)
    toast.success('Changes requested. Deal reverted to In Production.')
  }

  function handleSubmitContent() {
    if (!contentUrl.trim()) {
      toast.error('Please enter a content URL.')
      return
    }
    const nextRound = submissions.length + 1
    const newSub: MockSubmission = {
      id: `sub_${Date.now()}`,
      dealId: deal.id,
      creatorId: deal.creatorId ?? '',
      round: nextRound,
      url: contentUrl.trim(),
      fileKey: null,
      status: 'PENDING',
      feedback: null,
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
    }
    setSubmissions((prev) => [...prev, newSub])
    if (deal.stage === 'IN_PRODUCTION') {
      setDeal((prev) => ({ ...prev, stage: 'PENDING_APPROVAL' }))
    }
    setContentUrl('')
    toast.success('Content submitted for approval.')
  }

  // Section D handler
  function handleMarkPaymentReceived() {
    setDeal((prev) => ({ ...prev, paymentStatus: 'RECEIVED' }))
    toast.success('Payment marked as Received.')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
      {/* Main content — left 2 columns */}
      <div className="lg:col-span-2 space-y-6">

        {/* Section A — Brief */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-xl">{deal.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Created {new Date(deal.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              {overdue && (
                <Badge variant="destructive" className="shrink-0">
                  Overdue
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Platform + Deadline */}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="secondary">{deal.platform}</Badge>
              {deal.deadline && (
                <span
                  className={`text-sm font-mono tabular-nums ${
                    overdue ? 'text-destructive font-medium' : 'text-muted-foreground'
                  }`}
                >
                  Due:{' '}
                  {new Date(deal.deadline).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>

            <Separator />

            {/* Brand + Creator grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground font-medium text-xs uppercase tracking-wider mb-1">
                  Brand
                </p>
                <p className="font-medium">{deal.brand.name}</p>
                {deal.brand.website && (
                  <a
                    href={deal.brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary underline-offset-2 hover:underline"
                  >
                    {deal.brand.website}
                  </a>
                )}
              </div>
              <div>
                <p className="text-muted-foreground font-medium text-xs uppercase tracking-wider mb-1">
                  Creator
                </p>
                {deal.creator ? (
                  <>
                    <p className="font-medium">{deal.creator.name}</p>
                    <p className="text-xs font-mono text-muted-foreground">
                      @{deal.creator.handle}
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground italic">Not assigned</p>
                )}
              </div>
            </div>

            {/* Notes */}
            {deal.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-muted-foreground font-medium text-xs uppercase tracking-wider mb-1">
                    Notes
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{deal.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Section B — Contract */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Section B — Contract</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant={contractBadgeVariant(deal.contractStatus)}>
                {contractStatusLabel(deal.contractStatus)}
              </Badge>
            </div>

            <div className="flex gap-2 flex-wrap">
              {deal.contractStatus === 'NOT_SENT' && (
                <Button size="sm" variant="outline" onClick={handleMarkContractSent}>
                  Mark Sent
                </Button>
              )}
              {deal.contractStatus === 'SENT' && (
                <Button size="sm" onClick={handleMarkContractSigned}>
                  Mark Signed
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section C — Content Approval */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Section C — Content Approval</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SubmissionHistory submissions={submissions} />

            {/* Approve / Request Changes — only in PENDING_APPROVAL */}
            {deal.stage === 'PENDING_APPROVAL' && (
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleApproveContent}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowFeedbackInput((v) => !v)}
                  >
                    Request Changes
                  </Button>
                </div>

                {showFeedbackInput && (
                  <div className="space-y-2">
                    <Label htmlFor="feedback-text">Feedback</Label>
                    <Textarea
                      id="feedback-text"
                      rows={3}
                      placeholder="Describe what needs to change..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleRequestChanges}
                    >
                      Submit Feedback
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Content submission URL form — visible in IN_PRODUCTION or PENDING_APPROVAL */}
            {(deal.stage === 'IN_PRODUCTION' || deal.stage === 'PENDING_APPROVAL') && (
              <div className="space-y-2 pt-2 border-t border-border">
                <Label htmlFor="content-url">Submit Content URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="content-url"
                    type="url"
                    placeholder="https://..."
                    value={contentUrl}
                    onChange={(e) => setContentUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleSubmitContent}>
                    Submit Content
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section D — Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Section D — Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Creator payout — large font-mono display */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Creator Payout
              </p>
              <p className="text-3xl font-mono font-bold text-green-400 tabular-nums">
                {formatDollars(creatorPayout)}
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                {deal.dealValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} ×{' '}
                {(1 - deal.commissionPct / 100) * 100}% (after {deal.commissionPct}% commission)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge
                variant={deal.paymentStatus === 'RECEIVED' ? 'default' : 'outline'}
                className={
                  deal.paymentStatus === 'RECEIVED'
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : ''
                }
              >
                {deal.paymentStatus === 'RECEIVED' ? 'Received' : 'Pending'}
              </Badge>
            </div>

            {deal.paymentStatus === 'PENDING' &&
              (deal.stage === 'CLOSED' || deal.stage === 'PAYMENT_PENDING') && (
                <Button size="sm" onClick={handleMarkPaymentReceived}>
                  Mark Payment Received
                </Button>
              )}
          </CardContent>
        </Card>
      </div>

      {/* Right column — Stage Control Panel */}
      <div className="lg:col-span-1">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle className="text-base">Pipeline Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <StageControlPanel deal={deal} onDealChange={setDeal} />
          </CardContent>
        </Card>

        {/* Quick financials summary */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Financials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deal Value</span>
              <span className="font-mono font-medium">
                {formatDollars(deal.dealValue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Commission</span>
              <span className="font-mono font-medium">{deal.commissionPct}%</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Creator Payout</span>
              <span className="font-mono font-semibold text-green-400">
                {formatDollars(creatorPayout)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
