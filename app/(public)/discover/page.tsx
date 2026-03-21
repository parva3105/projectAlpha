import { mockCreators } from '@/lib/mock/creators'
import { CreatorDirectory } from '@/components/creator/CreatorDirectory'

export default function DiscoverPage() {
  const publicCreators = mockCreators.filter(c => c.isPublic)
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Discover Creators</h1>
      <CreatorDirectory creators={publicCreators} />
    </div>
  )
}
