import { apiUrl } from '@/lib/api'
import { RosterTable } from '@/components/roster/RosterTable'

export default async function RosterPage() {
  const [rosterRes, dealsRes] = await Promise.all([
    fetch(apiUrl('/api/v1/roster'), { cache: 'no-store' }),
    fetch(apiUrl('/api/v1/deals'), { cache: 'no-store' }),
  ])
  const { data: creators } = await rosterRes.json()
  const { data: deals } = await dealsRes.json()

  return (
    <div className="p-6">
      <RosterTable initialCreators={creators ?? []} deals={deals ?? []} />
    </div>
  )
}
