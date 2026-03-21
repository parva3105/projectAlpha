import { auth } from '@clerk/nextjs/server'
import { unauthorized, forbidden } from './api-response'

// Seeded test IDs — superadmin always operates on this test data
const TEST_AGENCY_CLERK_ID  = 'test_agency_001'
const TEST_CREATOR_CLERK_ID = 'test_creator_001'
const TEST_BRAND_CLERK_ID   = 'test_brand_001'

type AuthOk   = { ok: true; userId: string }
type AuthFail = { ok: false; response: Response }
export type AuthResult = AuthOk | AuthFail

function getRole(sessionClaims: unknown): string | undefined {
  return (sessionClaims as { metadata?: { role?: string } })?.metadata?.role
}

export async function requireAgencyAuth(): Promise<AuthResult> {
  const { userId, sessionClaims } = await auth()
  if (!userId) return { ok: false, response: unauthorized() }
  const role = getRole(sessionClaims)
  if (role === 'superadmin') return { ok: true, userId: TEST_AGENCY_CLERK_ID }
  if (role !== 'agency')     return { ok: false, response: forbidden() }
  return { ok: true, userId }
}

export async function requireCreatorAuth(): Promise<AuthResult> {
  const { userId, sessionClaims } = await auth()
  if (!userId) return { ok: false, response: unauthorized() }
  const role = getRole(sessionClaims)
  if (role === 'superadmin') return { ok: true, userId: TEST_CREATOR_CLERK_ID }
  if (role !== 'creator')    return { ok: false, response: forbidden() }
  return { ok: true, userId }
}

export async function requireBrandAuth(): Promise<AuthResult> {
  const { userId, sessionClaims } = await auth()
  if (!userId) return { ok: false, response: unauthorized() }
  const role = getRole(sessionClaims)
  if (role === 'superadmin')    return { ok: true, userId: TEST_BRAND_CLERK_ID }
  if (role !== 'brand_manager') return { ok: false, response: forbidden() }
  return { ok: true, userId }
}

// Use for routes accessible by multiple roles
export async function requireAnyAuth(): Promise<AuthResult & { role?: string }> {
  const { userId, sessionClaims } = await auth()
  if (!userId) return { ok: false, response: unauthorized() }
  return { ok: true, userId, role: getRole(sessionClaims) }
}
