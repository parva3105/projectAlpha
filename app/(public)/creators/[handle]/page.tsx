import { notFound } from 'next/navigation'
import { mockCreators } from '@/lib/mock/creators'
import { Badge } from '@/components/ui/badge'
import { PartnershipRequestDialog } from '@/components/creator/PartnershipRequestDialog'

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const creator = mockCreators.find(c => c.handle === handle && c.isPublic)
  if (!creator) notFound()

  const initials = creator.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-start gap-6 mb-6">
        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-2xl font-bold shrink-0">
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{creator.name}</h1>
          <p className="font-mono text-muted-foreground">@{creator.handle}</p>
          {creator.bio && (
            <p className="mt-2 text-sm text-muted-foreground leading-6">{creator.bio}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            {creator.platforms.map(p => (
              <Badge key={p} variant="outline">
                {p}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-6 mb-6 text-sm">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wide font-medium mb-1">
            Followers
          </p>
          <p className="font-mono text-lg tabular-nums">
            {creator.followerCount?.toLocaleString() ?? '—'}
          </p>
        </div>
        {creator.engagementRate && (
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide font-medium mb-1">
              Engagement
            </p>
            <p className="font-mono text-lg tabular-nums">{creator.engagementRate}%</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {creator.nicheTags.map(t => (
          <Badge key={t} variant="secondary">
            {t}
          </Badge>
        ))}
      </div>

      <PartnershipRequestDialog creatorName={creator.name} />
    </div>
  )
}
