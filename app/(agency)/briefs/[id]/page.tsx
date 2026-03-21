import { notFound } from 'next/navigation'
import { mockBriefs } from '@/lib/mock/briefs'
import { BriefDetail } from '@/components/briefs/BriefDetail'

export default async function BriefDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const brief = mockBriefs.find(b => b.id === id)
  if (!brief) notFound()
  return (
    <div className="p-6">
      <BriefDetail initialBrief={brief} />
    </div>
  )
}
