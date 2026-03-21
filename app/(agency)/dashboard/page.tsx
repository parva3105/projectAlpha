import Link from 'next/link'
import { apiUrl } from '@/lib/api'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'

export default async function DashboardPage() {
  const res = await fetch(apiUrl('/api/v1/deals'), { cache: 'no-store' })
  const { data: deals } = await res.json()

  if ((deals ?? []).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground text-sm">No deals yet. Create your first deal.</p>
        <Link href="/deals/new" className="mt-4 text-sm underline text-foreground">Create deal</Link>
      </div>
    )
  }

  return <KanbanBoard initialDeals={deals ?? []} />
}
