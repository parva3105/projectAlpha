import { serverFetch } from '@/lib/api'
import { CreatorProfileEditor } from '@/components/creator/CreatorProfileEditor'

type CreatorProfile = {
  name: string
  handle: string
  bio: string | null
  avatarUrl: string | null
  platforms: string[]
  nicheTags: string[]
  followerCount: number | null
  engagementRate: number | null
  isPublic: boolean
}

export default async function CreatorProfilePage() {
  const res = await serverFetch('/api/v1/profile', { cache: 'no-store' })
  const { data: creator } = (await res.json()) as { data: CreatorProfile | null; error: string | null }

  if (!creator) {
    return (
      <div className="p-6 max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight mb-6">My Profile</h1>
        <p className="text-muted-foreground text-sm">Creator profile not found.</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight mb-6">My Profile</h1>
      <CreatorProfileEditor initialCreator={creator} />
    </div>
  )
}
