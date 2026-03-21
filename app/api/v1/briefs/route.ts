import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, created, badRequest, unprocessable } from '@/lib/api-response'
import { getAgencyClerkId, getBrandClerkId } from '@/lib/auth-helpers' // TODO(phase3): replace with real Clerk auth()
import { CreateBriefSchema } from '@/lib/validations/brief'

export async function GET(req: NextRequest) {
  const agencyClerkId = getAgencyClerkId() // TODO(phase3): replace with real Clerk auth()
  const status = req.nextUrl.searchParams.get('status') ?? undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { agencyClerkId }
  if (status) where.status = status

  const briefs = await db.brief.findMany({
    where,
    include: { creator: { select: { id: true, name: true, handle: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return ok(briefs.map(serializeBrief))
}

export async function POST(req: NextRequest) {
  const brandManagerClerkId = getBrandClerkId() // TODO(phase3): replace with real Clerk auth()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return badRequest('Invalid JSON body')
  }

  const parse = CreateBriefSchema.safeParse(body)
  if (!parse.success) return unprocessable(parse.error.issues[0]?.message ?? 'Validation error')

  const { budget, ...rest } = parse.data
  const budgetCents = budget != null ? Math.round(budget * 100) : undefined

  const brief = await db.brief.create({
    data: {
      ...rest,
      brandManagerClerkId,
      budget: budgetCents,
    },
    include: { creator: { select: { id: true, name: true, handle: true, avatarUrl: true } } },
  })

  return created(serializeBrief(brief))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeBrief(b: any) {
  return {
    ...b,
    budget: b.budget != null ? Number(b.budget) / 100 : null,
  }
}
