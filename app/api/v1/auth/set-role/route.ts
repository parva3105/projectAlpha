import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { ok, badRequest, unauthorized } from '@/lib/api-response'
import { z } from 'zod'
import { authRateLimit } from '@/lib/rate-limit'

const Schema = z.object({
  role: z.enum(['agency', 'creator', 'brand_manager']),
})

export async function POST(req: NextRequest) {
  // Rate limiting
  const identifier = req.headers.get('x-forwarded-for') ?? 'anon'
  const { success } = await authRateLimit.limit(identifier)
  if (!success) return new Response(JSON.stringify({ data: null, error: 'Too many requests' }), { status: 429 })

  const { userId } = await auth()
  if (!userId) return unauthorized()

  const body = await req.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return badRequest('Invalid role')

  const client = await clerkClient()
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { role: parsed.data.role },
  })

  return ok({ role: parsed.data.role })
}
