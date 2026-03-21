'use client'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const ROLE_HOME = {
  agency:        '/dashboard',
  creator:       '/creator/deals',
  brand_manager: '/brand/briefs/new',
} as const

type Perspective = keyof typeof ROLE_HOME

function getCookiePerspective(): Perspective {
  if (typeof document === 'undefined') return 'agency'
  const match = document.cookie.match(/active_perspective=([^;]+)/)
  return (match?.[1] as Perspective) ?? 'agency'
}

export function RoleSwitcher() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [perspective, setPerspective] = useState<Perspective>(() => getCookiePerspective())

  // Only superadmin sees this
  if (!isLoaded || (user?.publicMetadata?.role as string | undefined) !== 'superadmin') return null

  function handleChange(value: Perspective | null) {
    if (!value) return
    document.cookie = `active_perspective=${value}; path=/; max-age=86400; SameSite=Lax`
    setPerspective(value)
    router.push(ROLE_HOME[value])
  }

  return (
    <Select value={perspective} onValueChange={handleChange}>
      <SelectTrigger className="w-48 text-xs border-dashed border-yellow-500/50 text-yellow-600 dark:text-yellow-400">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="agency">🏢 Agency</SelectItem>
        <SelectItem value="creator">🎨 Creator</SelectItem>
        <SelectItem value="brand_manager">🏷️ Brand Manager</SelectItem>
      </SelectContent>
    </Select>
  )
}
