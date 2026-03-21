'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import type { MockCreator } from '@/lib/mock/creators'

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'LinkedIn', 'Pinterest'] as const

type FormValues = {
  name: string
  handle: string
  bio: string
  nicheTags: string
  followerCount: string
  engagementRate: string
}

interface AddCreatorSheetProps {
  onCreated: (creator: MockCreator) => void
}

export function AddCreatorSheet({ onCreated }: AddCreatorSheetProps) {
  const [open, setOpen] = useState(false)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>()

  function togglePlatform(platform: string) {
    setSelectedPlatforms(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    )
  }

  function onSubmit(data: FormValues) {
    const newCreator: MockCreator = {
      id: `creator_${Date.now()}`,
      clerkId: `clerk_${Date.now()}`,
      name: data.name,
      handle: data.handle,
      bio: data.bio || null,
      avatarUrl: null,
      platforms: selectedPlatforms,
      nicheTags: data.nicheTags
        ? data.nicheTags.split(',').map(t => t.trim()).filter(Boolean)
        : [],
      followerCount: data.followerCount ? Number(data.followerCount) : null,
      engagementRate: data.engagementRate ? Number(data.engagementRate) : null,
      isPublic: true,
      agencyClerkId: 'test_agency_001',
      createdAt: new Date().toISOString(),
    }
    onCreated(newCreator)
    toast.success('Creator added to roster')
    reset()
    setSelectedPlatforms([])
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button />}>Add Creator</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Creator to Roster</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-6">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register('name', { required: 'Name is required' })}
              placeholder="Aria Chen"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="handle">Handle *</Label>
            <Input
              id="handle"
              {...register('handle', { required: 'Handle is required' })}
              placeholder="aria.chen"
              className="font-mono"
            />
            {errors.handle && (
              <p className="text-xs text-destructive">{errors.handle.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...register('bio')}
              placeholder="Short bio..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Platforms</Label>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map(platform => (
                <div key={platform} className="flex items-center gap-2">
                  <Checkbox
                    id={`platform-${platform}`}
                    checked={selectedPlatforms.includes(platform)}
                    onCheckedChange={() => togglePlatform(platform)}
                  />
                  <Label htmlFor={`platform-${platform}`} className="font-normal cursor-pointer">
                    {platform}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nicheTags">Niche Tags</Label>
            <Input
              id="nicheTags"
              {...register('nicheTags')}
              placeholder="Wellness, Fitness, Lifestyle"
            />
            <p className="text-xs text-muted-foreground">Comma-separated</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="followerCount">Follower Count</Label>
            <Input
              id="followerCount"
              type="number"
              {...register('followerCount')}
              placeholder="185000"
              min={0}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="engagementRate">Engagement Rate (%)</Label>
            <Input
              id="engagementRate"
              type="number"
              step="0.1"
              {...register('engagementRate')}
              placeholder="4.2"
              min={0}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">Add Creator</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                setSelectedPlatforms([])
                setOpen(false)
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
