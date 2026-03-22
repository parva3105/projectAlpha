'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

type ApiBrief = {
  id: string
  brandManagerClerkId: string
  agencyClerkId: string
  creatorId: string | null
  title: string
  description: string
  budget: number | null
  platform: string | null
  niche: string | null
  status: string
  createdAt: string
  updatedAt: string
}

function statusBadge(status: string) {
  switch (status) {
    case 'NEW':
      return <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/20 hover:bg-blue-500/15">NEW</Badge>
    case 'REVIEWED':
      return <Badge variant="outline">REVIEWED</Badge>
    case 'CONVERTED':
      return <Badge className="bg-green-500/15 text-green-400 border-green-500/20 hover:bg-green-500/15">CONVERTED</Badge>
    case 'DECLINED':
      return <Badge variant="destructive">DECLINED</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

interface BriefDetailProps {
  initialBrief: ApiBrief
}

export function BriefDetail({ initialBrief }: BriefDetailProps) {
  const [brief, setBrief] = useState<ApiBrief>(initialBrief)
  const router = useRouter()

  async function handleMarkReviewed() {
    const res = await fetch(`/api/v1/briefs/${brief.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'REVIEWED' }),
    })
    const json = await res.json()
    if (!res.ok) {
      toast.error('Failed to mark brief as reviewed')
      return
    }
    setBrief(json.data)
    toast.success('Brief marked as reviewed')
  }

  async function handleDecline() {
    const res = await fetch(`/api/v1/briefs/${brief.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'DECLINED' }),
    })
    const json = await res.json()
    if (!res.ok) {
      toast.error('Failed to decline brief')
      return
    }
    setBrief(json.data)
    toast.success('Brief declined')
  }

  const isTerminal = brief.status === 'CONVERTED' || brief.status === 'DECLINED'

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{brief.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            {statusBadge(brief.status)}
            {brief.platform && <Badge variant="outline">{brief.platform}</Badge>}
          </div>
        </div>
      </div>

      {/* Brief Info */}
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">Description</p>
          <p className="text-sm leading-6">{brief.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {brief.platform && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">Platform</p>
              <p className="text-sm">{brief.platform}</p>
            </div>
          )}
          {brief.niche && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">Niche</p>
              <p className="text-sm">{brief.niche}</p>
            </div>
          )}
          {brief.budget != null && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">Budget</p>
              <p className="font-mono text-sm tabular-nums">${brief.budget.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Submitted By */}
      <div className="border-t border-border pt-6 space-y-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-3">Submitted By</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Submitted By (Clerk ID)</p>
            <p className="text-sm font-mono text-muted-foreground">{brief.brandManagerClerkId}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Date</p>
            <p className="font-mono text-sm tabular-nums">
              {new Date(brief.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Requested Creator */}
      {brief.creatorId && (
        <div className="border-t border-border pt-6">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-2">Requested Creator</p>
          <p className="font-mono text-sm text-muted-foreground">{brief.creatorId}</p>
        </div>
      )}

      {/* Action Bar */}
      <div className="border-t border-border pt-6 flex items-center gap-3">
        {isTerminal ? (
          <>{statusBadge(brief.status)}</>
        ) : (
          <>
            <Button onClick={() => router.push(`/deals/new?briefId=${brief.id}`)}>
              Convert to Deal
            </Button>

            {brief.status === 'NEW' && (
              <Button variant="outline" onClick={handleMarkReviewed}>
                Mark Reviewed
              </Button>
            )}

            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="destructive" />}>
                Decline
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Decline this brief?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will mark the brief as declined. The brand manager will be
                    notified by email.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDecline}>
                    Decline Brief
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </div>
  )
}
