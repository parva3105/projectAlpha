import { notFound } from 'next/navigation'
import { apiUrl } from '@/lib/api'
import { DealDetail } from '@/components/deals/DealDetail'

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const res = await fetch(apiUrl(`/api/v1/deals/${id}`), { cache: 'no-store' })
  if (!res.ok) notFound()
  const { data: deal } = await res.json()
  if (!deal) notFound()

  return (
    <div className="p-6">
      <DealDetail initialDeal={deal} initialSubmissions={deal.submissions ?? []} />
    </div>
  )
}
