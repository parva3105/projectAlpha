'use client'

import { useUser } from '@clerk/nextjs'
import { RoleSwitcher } from './RoleSwitcher'

const ROLE_TITLES: Record<string, string> = {
  agency: 'Agency',
  creator: 'Creator Portal',
  brand_manager: 'Brand Portal',
  superadmin: 'Admin',
}

export function Header() {
  const { user, isLoaded } = useUser()

  const role = isLoaded ? (user?.publicMetadata?.role as string | undefined) ?? 'agency' : 'agency'
  const roleTitle = ROLE_TITLES[role] ?? 'Agency'

  const displayName = isLoaded
    ? (user?.fullName ?? user?.firstName ?? 'User')
    : 'User'

  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0">
      <span className="text-sm font-medium text-muted-foreground">
        {roleTitle}
      </span>
      <div className="flex items-center gap-3">
        <RoleSwitcher />
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
          {initials}
        </div>
      </div>
    </header>
  )
}
