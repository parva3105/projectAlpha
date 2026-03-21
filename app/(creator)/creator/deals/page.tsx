import { serverFetch } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { isOverdue } from '@/lib/overdue.client'

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

export default async function CreatorDealsPage() {
  const res = await serverFetch('/api/v1/deals', { cache: 'no-store' })
  const { data } = await res.json()
  const myDeals = data ?? []

  if (myDeals.length === 0) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground text-sm">No deals assigned to you yet.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">My Deals</h1>
      <div className="grid gap-4">
        {(myDeals as Array<{ id: string; brand: { name: string }; title: string; stage: string; deadline: string; creatorPayout: number }>).map(deal => (
          <Link key={deal.id} href={`/creator/deals/${deal.id}`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{deal.brand.name}</p>
                    <h3 className="font-semibold">{deal.title}</h3>
                  </div>
                  <Badge variant="outline">
                    {STAGE_LABELS[deal.stage] ?? deal.stage}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    Due:{' '}
                    {new Date(deal.deadline).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  {isOverdue(deal) && (
                    <span className="text-red-400 font-medium">Overdue</span>
                  )}
                  <span className="font-mono text-foreground tabular-nums">
                    ${deal.creatorPayout.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
