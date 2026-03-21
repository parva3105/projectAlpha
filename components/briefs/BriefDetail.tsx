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
import type { MockBrief } from '@/lib/mock/briefs'

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
  initialBrief: MockBrief
}

export function BriefDetail({ initialBrief }: BriefDetailProps) {
  const [brief, setBrief] = useState<MockBrief>(initialBrief)
  const router = useRouter()

  function handleMarkReviewed() {
    setBrief(prev => ({ ...prev, status: 'REVIEWED' }))
    toast.success('Brief marked as reviewed')
  }

  function handleDecline() {
    setBrief(prev => ({ ...prev, status: 'DECLINED' }))
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
            <Badge variant="outline">{brief.platform}</Badge>
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
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">Platform</p>
            <p className="text-sm">{brief.platform}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">Niche</p>
            <p className="text-sm">{brief.niche}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">Budget</p>
            <p className="font-mono text-sm tabular-nums">${brief.budget.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Submitted By */}
      <div className="border-t border-border pt-6 space-y-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-3">Submitted By</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Name</p>
            <p className="text-sm font-medium">{brief.brandManagerName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Company</p>
            <p className="text-sm">{brief.brandManagerCompany}</p>
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
                    This will mark the brief as declined. The brand manager will not be
                    notified in Phase 1.
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
