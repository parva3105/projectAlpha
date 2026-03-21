'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  Inbox,
  User,
  PenLine,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Role } from '@/lib/role-context'

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: Record<Role, NavItem[]> = {
  agency: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Deals', href: '/deals', icon: FileText },
    { label: 'Roster', href: '/roster', icon: Users },
    { label: 'Brands', href: '/brands', icon: Building2 },
    { label: 'Briefs', href: '/briefs', icon: Inbox },
  ],
  creator: [
    { label: 'My Deals', href: '/creator/deals', icon: FileText },
    { label: 'Profile', href: '/creator/profile', icon: User },
  ],
  brand_manager: [
    { label: 'Submit Brief', href: '/briefs/new', icon: PenLine },
    { label: 'My Briefs', href: '/brand/briefs', icon: Inbox },
  ],
}

interface SidebarProps {
  role: Role
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const items = NAV_ITEMS[role]

  return (
    <aside className="w-56 shrink-0 border-r border-border flex flex-col min-h-screen">
      <div className="p-4 border-b border-border">
        <span className="font-semibold text-sm text-foreground">Brand Deal Manager</span>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
