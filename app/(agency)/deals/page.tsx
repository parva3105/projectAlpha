import { apiUrl } from '@/lib/api'
import { DealsTable } from '@/components/deals/DealsTable'

export default async function DealsPage() {
  const res = await fetch(apiUrl('/api/v1/deals'), { cache: 'no-store' })
  const { data: deals } = await res.json()

  return (
    <div className="p-6">
      <DealsTable initialDeals={deals ?? []} />
    </div>
  )
}
