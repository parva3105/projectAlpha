import { apiUrl } from '@/lib/api'
import { BriefsTable } from '@/components/briefs/BriefsTable'

export default async function BriefsPage() {
  const res = await fetch(apiUrl('/api/v1/briefs'), { cache: 'no-store' })
  const { data: briefs } = await res.json()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Brief Inbox</h1>
      <BriefsTable initialBriefs={briefs ?? []} />
    </div>
  )
}
