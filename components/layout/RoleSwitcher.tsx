'use client'

import { useRouter } from 'next/navigation'
import { useRole, type Role } from '@/lib/role-context'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const ROLE_HOME_ROUTES: Record<Role, string> = {
  agency: '/dashboard',
  creator: '/creator/deals',
  brand_manager: '/brand/briefs/new',
}

export function RoleSwitcher() {
  const { role, setRole } = useRole()
  const router = useRouter()

  function handleChange(newRole: Role | null) {
    if (!newRole) return
    setRole(newRole)
    router.push(ROLE_HOME_ROUTES[newRole])
  }

  return (
    <Select value={role} onValueChange={handleChange}>
      <SelectTrigger className="w-40 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="agency">Agency</SelectItem>
        <SelectItem value="creator">Creator Portal</SelectItem>
        <SelectItem value="brand_manager">Brand Portal</SelectItem>
      </SelectContent>
    </Select>
  )
}
