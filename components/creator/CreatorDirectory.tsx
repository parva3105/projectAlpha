'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { CreatorCard } from '@/components/creator/CreatorCard'
import type { MockCreator } from '@/lib/mock/creators'

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'LinkedIn', 'Pinterest'] as const

interface CreatorDirectoryProps {
  creators: MockCreator[]
}

export function CreatorDirectory({ creators }: CreatorDirectoryProps) {
  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState<string[]>([])
  const [nicheSearch, setNicheSearch] = useState('')
  const [minEngagement, setMinEngagement] = useState<number | null>(null)

  function togglePlatform(platform: string) {
    setPlatformFilter(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    )
  }

  function clearFilters() {
    setSearch('')
    setPlatformFilter([])
    setNicheSearch('')
    setMinEngagement(null)
  }

  const filtered = creators.filter(creator => {
    if (
      search &&
      !creator.name.toLowerCase().includes(search.toLowerCase()) &&
      !creator.handle.toLowerCase().includes(search.toLowerCase())
    ) {
      return false
    }
    if (
      platformFilter.length > 0 &&
      !platformFilter.some(p => creator.platforms.includes(p))
    ) {
      return false
    }
    if (
      nicheSearch &&
      !creator.nicheTags.some(t =>
        t.toLowerCase().includes(nicheSearch.toLowerCase())
      )
    ) {
      return false
    }
    if (
      minEngagement !== null &&
      (creator.engagementRate === null || creator.engagementRate < minEngagement)
    ) {
      return false
    }
    return true
  })

  return (
    <div>
      {/* Filter bar */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <Input
            className="max-w-xs"
            placeholder="Search creators..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Input
            className="max-w-xs"
            placeholder="Niche..."
            value={nicheSearch}
            onChange={e => setNicheSearch(e.target.value)}
          />
          <Input
            className="w-44 font-mono"
            type="number"
            placeholder="Min engagement %"
            min={0}
            step={0.1}
            value={minEngagement ?? ''}
            onChange={e =>
              setMinEngagement(e.target.value ? Number(e.target.value) : null)
            }
          />
          <Button variant="ghost" onClick={clearFilters}>
            Clear
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
          {PLATFORMS.map(platform => (
            <div key={platform} className="flex items-center gap-1.5">
              <Checkbox
                id={`filter-${platform}`}
                checked={platformFilter.includes(platform)}
                onCheckedChange={() => togglePlatform(platform)}
              />
              <Label
                htmlFor={`filter-${platform}`}
                className="text-sm font-normal cursor-pointer"
              >
                {platform}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No creators match your filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(c => (
            <CreatorCard key={c.id} creator={c} />
          ))}
        </div>
      )}
    </div>
  )
}
