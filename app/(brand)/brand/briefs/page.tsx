import Link from 'next/link'
import { serverFetch } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Brief = {
  id: string
  title: string
  platform: string | null
  budget: number | null
  status: string
  createdAt: string
}

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

export default async function BrandBriefsPage() {
  const res = await serverFetch('/api/v1/briefs', { cache: 'no-store' })
  const { data: briefs } = (await res.json()) as { data: Brief[] | null; error: string | null }
  const list = briefs ?? []

  if (list.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight mb-6">My Briefs</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground text-sm mb-4">You haven&apos;t submitted any briefs yet.</p>
          <Link href="/brand/briefs/new" className="text-sm font-medium underline underline-offset-4">
            Submit your first brief
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">My Briefs</h1>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map(brief => (
              <TableRow key={brief.id}>
                <TableCell>
                  <span className="font-medium text-sm">{brief.title}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{brief.platform ?? '—'}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm tabular-nums">
                    {brief.budget != null ? `$${brief.budget.toLocaleString()}` : '—'}
                  </span>
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
    </div>
  )
}
