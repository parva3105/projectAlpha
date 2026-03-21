import { mockDeals } from '@/lib/mock/deals'
import { DealsTable } from '@/components/deals/DealsTable'

export default function DealsPage() {
  return (
    <div className="p-6">
      <DealsTable initialDeals={mockDeals} />
    </div>
  )
}
