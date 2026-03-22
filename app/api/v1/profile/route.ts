import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, badRequest, notFound, unprocessable } from '@/lib/api-response'
import { requireCreatorAuth } from '@/lib/auth'
import { UpdateCreatorProfileSchema } from '@/lib/validations/creator'

export async function GET() {
  const authResult = await requireCreatorAuth()
  if (!authResult.ok) return authResult.response
  const { userId: clerkId } = authResult

  const creator = await db.creator.findUnique({ where: { clerkId } })
  if (!creator) return notFound('Creator profile not found')

  return ok(serializeCreator(creator))
}

export async function PATCH(req: NextRequest) {
  const authResult = await requireCreatorAuth()
  if (!authResult.ok) return authResult.response
  const { userId: clerkId } = authResult

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return badRequest('Invalid JSON body')
  }

  const parse = UpdateCreatorProfileSchema.safeParse(body)
  if (!parse.success) return unprocessable(parse.error.issues[0]?.message ?? 'Validation error')

  const creator = await db.creator.findUnique({ where: { clerkId } })
  if (!creator) return notFound('Creator profile not found')

  const { name, bio, platforms, nicheTags, followerCount, engagementRate, isPublic } = parse.data

  const updated = await db.creator.update({
    where: { clerkId },
    data: {
      ...(name !== undefined && { name }),
      ...(bio !== undefined && { bio }),
      ...(platforms !== undefined && { platforms }),
      ...(nicheTags !== undefined && { nicheTags }),
      ...(followerCount !== undefined && { followerCount }),
      ...(engagementRate !== undefined && { engagementRate }),
      ...(isPublic !== undefined && { isPublic }),
    },
  })

  return ok(serializeCreator(updated))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeCreator(c: any) {
  return {
    ...c,
    engagementRate: c.engagementRate != null ? Number(c.engagementRate) : null,
  }
}
