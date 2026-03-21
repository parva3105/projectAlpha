import { apiUrl } from '@/lib/api'
import { BriefsTable } from '@/components/briefs/BriefsTable'

export default async function BriefsPage() {
  const res = await fetch(apiUrl('/api/v1/briefs'), { cache: 'no-store' })
  const { data: briefs } = await res.json()

  if ((briefs ?? []).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground text-sm">No briefs in your inbox.</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Brief Inbox</h1>
      <BriefsTable initialBriefs={briefs ?? []} />
    </div>
  )
}
