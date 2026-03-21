import { serverFetch } from '@/lib/api'
import { RosterTable } from '@/components/roster/RosterTable'

export default async function RosterPage() {
  const [rosterRes, dealsRes] = await Promise.all([
    serverFetch('/api/v1/roster', { cache: 'no-store' }),
    serverFetch('/api/v1/deals', { cache: 'no-store' }),
  ])
  const { data: creators } = await rosterRes.json()
  const { data: deals } = await dealsRes.json()

  if ((creators ?? []).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground text-sm">No creators on your roster yet.</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <RosterTable initialCreators={creators ?? []} deals={deals ?? []} />
    </div>
  )
}
