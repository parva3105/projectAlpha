import { mockDeals } from '@/lib/mock/deals'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'

export default function DashboardPage() {
  return <KanbanBoard initialDeals={mockDeals} />
}
