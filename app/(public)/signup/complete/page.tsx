'use client'

import { useEffect } from 'react'
import { useUser, useSession } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function SignupCompletePage() {
  const { user, isLoaded } = useUser()
  const { session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded || !user || !session) return

    async function complete() {
      const unsafeRole = user!.unsafeMetadata?.role as string | undefined
      if (!unsafeRole) return

      await fetch('/api/v1/auth/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: unsafeRole }),
      })

      await session!.reload()

      const homeRoutes: Record<string, string> = {
        agency: '/dashboard',
        creator: '/creator/deals',
        brand_manager: '/brand/briefs/new',
      }
      router.push(homeRoutes[unsafeRole] ?? '/')
    }

    complete()
  }, [isLoaded, user, session, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground text-sm">Setting up your account…</p>
    </div>
  )
}
