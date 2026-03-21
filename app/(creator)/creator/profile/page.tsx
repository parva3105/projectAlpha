import { mockCreators } from '@/lib/mock/creators'
import { CreatorProfileEditor } from '@/components/creator/CreatorProfileEditor'

export default function CreatorProfilePage() {
  const creator = mockCreators.find(c => c.id === 'creator_001')!
  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight mb-6">My Profile</h1>
      <CreatorProfileEditor initialCreator={creator} />
    </div>
  )
}
