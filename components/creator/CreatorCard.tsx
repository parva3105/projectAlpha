import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { MockCreator } from '@/lib/mock/creators'

function formatFollowers(count: number | null): string {
  if (!count) return '—'
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000) return `${Math.round(count / 1_000)}K`
  return count.toString()
}

export function CreatorCard({ creator }: { creator: MockCreator }) {
  const initials = creator.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Link href={`/creators/${creator.handle}`} className="block">
      <div className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-sm font-semibold shrink-0">
            {initials}
          </div>
          <div>
            <p className="font-semibold text-sm">{creator.name}</p>
            <p className="text-xs font-mono text-muted-foreground">@{creator.handle}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {creator.platforms.map(p => (
            <Badge key={p} variant="outline" className="text-xs">
              {p}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {creator.nicheTags.slice(0, 3).map(t => (
            <Badge key={t} variant="secondary" className="text-xs">
              {t}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
          <span>{formatFollowers(creator.followerCount)} followers</span>
          {creator.engagementRate && (
            <span>{creator.engagementRate}% eng.</span>
          )}
        </div>
      </div>
    </Link>
  )
}
