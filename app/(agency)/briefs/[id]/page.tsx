import { notFound } from 'next/navigation'
import { apiUrl } from '@/lib/api'
import { BriefDetail } from '@/components/briefs/BriefDetail'

export default async function BriefDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const res = await fetch(apiUrl(`/api/v1/briefs/${id}`), { cache: 'no-store' })
  if (!res.ok) notFound()
  const { data: brief } = await res.json()
  if (!brief) notFound()
  return (
    <div className="p-6">
      <BriefDetail initialBrief={brief} />
    </div>
  )
}
