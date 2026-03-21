'use client'

import { useRole } from '@/lib/role-context'
import { RoleSwitcher } from './RoleSwitcher'

const ROLE_TITLES: Record<string, string> = {
  agency: 'Agency',
  creator: 'Creator Portal',
  brand_manager: 'Brand Portal',
}

export function Header() {
  const { role } = useRole()
  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0">
      <span className="text-sm font-medium text-muted-foreground">
        {ROLE_TITLES[role]}
      </span>
      <div className="flex items-center gap-3">
        <RoleSwitcher />
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
          AG
        </div>
      </div>
    </header>
  )
}
