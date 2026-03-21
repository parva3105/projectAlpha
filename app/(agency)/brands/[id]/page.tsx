import { notFound } from 'next/navigation'
import Link from 'next/link'
import { serverFetch } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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

function stageBadgeVariant(stage: string): 'default' | 'secondary' | 'outline' | 'destructive' {
  if (stage === 'CLOSED') return 'secondary'
  if (stage === 'LIVE') return 'default'
  if (stage === 'PAYMENT_PENDING') return 'outline'
  return 'outline'
}

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const res = await serverFetch(`/api/v1/brands/${id}`, { cache: 'no-store' })
  if (!res.ok) notFound()
  const { data: brand } = await res.json()
  if (!brand) notFound()

  const brandDeals = brand.deals ?? []

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{brand.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {brand.website ? (
            <a
              href={brand.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline text-sm"
            >
              {brand.website}
            </a>
          ) : (
            <span className="text-sm text-muted-foreground">No website</span>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-3">Deals</h2>
        {brandDeals.length === 0 ? (
          <p className="text-sm text-muted-foreground">No deals yet.</p>
        ) : (
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Deadline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(brandDeals as Array<{ id: string; title: string; stage: string; creator: { name: string } | null; dealValue: number; deadline: string }>).map(deal => (
                  <TableRow key={deal.id}>
                    <TableCell>
                      <Link
                        href={`/deals/${deal.id}`}
                        className="font-medium text-sm hover:underline"
                      >
                        {deal.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {deal.creator ? (
                        <span className="text-sm">{deal.creator.name}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={stageBadgeVariant(deal.stage)} className="text-xs">
                        {STAGE_LABELS[deal.stage] ?? deal.stage}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm tabular-nums">
                        ${deal.dealValue.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm tabular-nums">
                        {new Date(deal.deadline).toLocaleDateString('en-US', {
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
    </div>
  )
}
