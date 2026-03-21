'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Role = 'agency' | 'creator' | 'brand_manager'

const ROLE_KEY = 'devRole'
const DEFAULT_ROLE: Role = 'agency'

interface RoleContextValue {
  role: Role
  setRole: (role: Role) => void
}

const RoleContext = createContext<RoleContextValue>({
  role: DEFAULT_ROLE,
  setRole: () => {},
})

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(DEFAULT_ROLE)

  useEffect(() => {
    const stored = localStorage.getItem(ROLE_KEY) as Role | null
    if (stored && ['agency', 'creator', 'brand_manager'].includes(stored)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRoleState(stored)
    }
  }, [])

  function setRole(newRole: Role) {
    setRoleState(newRole)
    localStorage.setItem(ROLE_KEY, newRole)
  }

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>
}

export function useRole() {
  return useContext(RoleContext)
}
