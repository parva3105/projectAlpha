import { apiUrl } from '@/lib/api'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'

export default async function DashboardPage() {
  const res = await fetch(apiUrl('/api/v1/deals'), { cache: 'no-store' })
  const { data: deals } = await res.json()

  return <KanbanBoard initialDeals={deals ?? []} />
}
