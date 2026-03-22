'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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

const ALL_PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'LinkedIn', 'Pinterest'] as const

interface CreatorProfileEditorProps {
  initialCreator: CreatorProfile
}

export function CreatorProfileEditor({ initialCreator }: CreatorProfileEditorProps) {
  const [creator, setCreator] = useState<CreatorProfile>(initialCreator)
  const [tagInput, setTagInput] = useState('')

  const initials = creator.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  function togglePlatform(platform: string) {
    setCreator(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform],
    }))
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const tag = tagInput.trim()
      if (tag && !creator.nicheTags.includes(tag)) {
        setCreator(prev => ({ ...prev, nicheTags: [...prev.nicheTags, tag] }))
      }
      setTagInput('')
    }
  }

  function removeTag(tag: string) {
    setCreator(prev => ({
      ...prev,
      nicheTags: prev.nicheTags.filter(t => t !== tag),
    }))
  }

  async function handleSave() {
    try {
      const res = await fetch('/api/v1/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: creator.name,
          bio: creator.bio,
          platforms: creator.platforms,
          nicheTags: creator.nicheTags,
          followerCount: creator.followerCount,
          engagementRate: creator.engagementRate,
          isPublic: creator.isPublic,
        }),
      })
      if (!res.ok) {
        const json = await res.json()
        toast.error(json.error ?? 'Failed to save profile')
        return
      }
      toast.success('Profile saved')
    } catch {
      toast.error('Failed to save profile')
    }
  }

  return (
    <div className="space-y-8">
      {/* Avatar */}
      <div className="flex flex-col items-start gap-2">
        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
          {initials}
        </div>
        <p className="text-xs text-muted-foreground">Upload avatar (Phase 4)</p>
      </div>

      {/* Display Name */}
      <div className="space-y-1.5">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          value={creator.name}
          onChange={e => setCreator(prev => ({ ...prev, name: e.target.value }))}
        />
      </div>

      {/* Handle — read-only */}
      <div className="space-y-1.5">
        <Label htmlFor="handle">Handle (cannot be changed)</Label>
        <Input
          id="handle"
          value={creator.handle}
          readOnly
          disabled
          className="font-mono"
        />
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={creator.bio ?? ''}
          onChange={e => setCreator(prev => ({ ...prev, bio: e.target.value || null }))}
          rows={4}
          placeholder="Tell brands about yourself..."
        />
      </div>

      {/* Platforms */}
      <div className="space-y-2">
        <Label>Platforms</Label>
        <div className="grid grid-cols-2 gap-2">
          {ALL_PLATFORMS.map(platform => (
            <div key={platform} className="flex items-center gap-2">
              <Checkbox
                id={`platform-${platform}`}
                checked={creator.platforms.includes(platform)}
                onCheckedChange={() => togglePlatform(platform)}
              />
              <Label htmlFor={`platform-${platform}`} className="font-normal cursor-pointer">
                {platform}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Niche Tags */}
      <div className="space-y-2">
        <Label>Niche Tags</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {creator.nicheTags.map(tag => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-foreground text-muted-foreground"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <Input
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="Type a tag and press Enter..."
        />
      </div>

      {/* Follower Count */}
      <div className="space-y-1.5">
        <Label htmlFor="followerCount">Follower Count</Label>
        <Input
          id="followerCount"
          type="number"
          min={0}
          value={creator.followerCount ?? ''}
          onChange={e =>
            setCreator(prev => ({
              ...prev,
              followerCount: e.target.value ? Number(e.target.value) : null,
            }))
          }
          placeholder="185000"
          className="font-mono"
        />
      </div>

      {/* Engagement Rate */}
      <div className="space-y-1.5">
        <Label htmlFor="engagementRate">Engagement Rate (%)</Label>
        <Input
          id="engagementRate"
          type="number"
          step="0.1"
          min={0}
          value={creator.engagementRate ?? ''}
          onChange={e =>
            setCreator(prev => ({
              ...prev,
              engagementRate: e.target.value ? Number(e.target.value) : null,
            }))
          }
          placeholder="4.2"
          className="font-mono"
        />
      </div>

      {/* Public Profile */}
      <div className="flex items-center gap-3">
        <Switch
          id="isPublic"
          checked={creator.isPublic}
          onCheckedChange={checked =>
            setCreator(prev => ({ ...prev, isPublic: checked }))
          }
        />
        <Label htmlFor="isPublic" className="cursor-pointer">
          Public profile (visible in discovery)
        </Label>
      </div>

      <Button onClick={handleSave} className="w-full sm:w-auto">
        Save Profile
      </Button>
    </div>
  )
}
