import { apiUrl } from '@/lib/api'
import { DealsTable } from '@/components/deals/DealsTable'

export default async function DealsPage() {
  const res = await fetch(apiUrl('/api/v1/deals'), { cache: 'no-store' })
  const { data: deals } = await res.json()

  if ((deals ?? []).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground text-sm">No deals found.</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <DealsTable initialDeals={deals ?? []} />
    </div>
  )
}
