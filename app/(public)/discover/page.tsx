import { apiUrl } from '@/lib/api'
import { CreatorDirectory } from '@/components/creator/CreatorDirectory'

export default async function DiscoverPage() {
  const res = await fetch(apiUrl('/api/v1/creators'), { cache: 'no-store' })
  const { data: creators } = await res.json()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Discover Creators</h1>
      <CreatorDirectory creators={creators ?? []} />
    </div>
  )
}
