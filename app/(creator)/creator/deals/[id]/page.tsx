import { notFound } from 'next/navigation'
import { mockDeals } from '@/lib/mock/deals'
import { mockSubmissions } from '@/lib/mock/submissions'
import { CreatorDealDetail } from '@/components/creator/CreatorDealDetail'

const MOCK_CREATOR_ID = 'creator_001'

export default async function CreatorDealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const deal = mockDeals.find(d => d.id === id && d.creatorId === MOCK_CREATOR_ID)
  if (!deal) notFound()
  const submissions = mockSubmissions.filter(s => s.dealId === id)
  return (
    <div className="p-6">
      <CreatorDealDetail initialDeal={deal} initialSubmissions={submissions} />
    </div>
  )
}
