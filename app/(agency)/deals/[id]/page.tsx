import { notFound } from 'next/navigation'
import { mockDeals } from '@/lib/mock/deals'
import { mockSubmissions } from '@/lib/mock/submissions'
import { DealDetail } from '@/components/deals/DealDetail'

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const deal = mockDeals.find((d) => d.id === id)
  if (!deal) notFound()

  const submissions = mockSubmissions.filter((s) => s.dealId === id)

  return (
    <div className="p-6">
      <DealDetail initialDeal={deal} initialSubmissions={submissions} />
    </div>
  )
}
