import { mockRoster } from '@/lib/mock/creators'
import { mockDeals } from '@/lib/mock/deals'
import { RosterTable } from '@/components/roster/RosterTable'

export default function RosterPage() {
  return (
    <div className="p-6">
      <RosterTable initialCreators={mockRoster} deals={mockDeals} />
    </div>
  )
}
