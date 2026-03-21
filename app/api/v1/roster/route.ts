import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, created, badRequest, unprocessable } from '@/lib/api-response'
import { requireAgencyAuth } from '@/lib/auth'
import { AddCreatorToRosterSchema } from '@/lib/validations/roster'

export async function GET() {
  const authResult = await requireAgencyAuth()
  if (!authResult.ok) return authResult.response
  const { userId: agencyClerkId } = authResult

  const creators = await db.creator.findMany({
    where: { agencyClerkId },
    orderBy: { name: 'asc' },
  })

  return ok(creators.map(serializeCreator))
}

export async function POST(req: NextRequest) {
  const authResult = await requireAgencyAuth()
  if (!authResult.ok) return authResult.response
  const { userId: agencyClerkId } = authResult

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return badRequest('Invalid JSON body')
  }

  const parse = AddCreatorToRosterSchema.safeParse(body)
  if (!parse.success) return unprocessable(parse.error.issues[0]?.message ?? 'Validation error')

  const creator = await db.creator.create({
    data: {
      ...parse.data,
      clerkId: `roster_${crypto.randomUUID()}`,
      agencyClerkId,
      engagementRate: parse.data.engagementRate ?? null,
    },
  })

  return created(serializeCreator(creator))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeCreator(c: any) {
  return {
    ...c,
    engagementRate: c.engagementRate != null ? Number(c.engagementRate) : null,
  }
}
