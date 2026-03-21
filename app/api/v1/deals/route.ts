import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, created, badRequest, unprocessable } from '@/lib/api-response'
import { getAgencyClerkId } from '@/lib/auth-helpers' // TODO(phase3): replace with real Clerk auth()
import { CreateDealSchema } from '@/lib/validations/deal'

export async function GET(req: NextRequest) {
  const agencyClerkId = getAgencyClerkId() // TODO(phase3): replace with real Clerk auth()
  const { searchParams } = req.nextUrl

  const stage = searchParams.get('stage') ?? undefined
  const creatorId = searchParams.get('creatorId') ?? undefined
  const brandId = searchParams.get('brandId') ?? undefined
  const overdueOnly = searchParams.get('overdueOnly') === 'true'

  const where: Record<string, unknown> = { agencyClerkId }
  if (stage) where.stage = stage
  if (creatorId) where.creatorId = creatorId
  if (brandId) where.brandId = brandId
  if (overdueOnly) {
    where.deadline = { lt: new Date() }
    where.stage = { notIn: ['CLOSED', 'LIVE'] }
  }

  const deals = await db.deal.findMany({
    where,
    include: {
      brand: true,
      creator: { select: { id: true, name: true, handle: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const data = deals.map(serializeDeal)
  return ok(data)
}

export async function POST(req: NextRequest) {
  const agencyClerkId = getAgencyClerkId() // TODO(phase3): replace with real Clerk auth()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return badRequest('Invalid JSON body')
  }

  const parse = CreateDealSchema.safeParse(body)
  if (!parse.success) return unprocessable(parse.error.issues[0]?.message ?? 'Validation error')

  const input = parse.data
  const dealValueCents = Math.round(input.dealValue * 100)
  const creatorPayout = Math.round(dealValueCents * (1 - input.commissionPct / 100))

  const deal = await db.deal.create({
    data: {
      agencyClerkId,
      title: input.title,
      brandId: input.brandId,
      creatorId: input.creatorId,
      briefId: input.briefId,
      dealValue: dealValueCents,
      commissionPct: input.commissionPct,
      creatorPayout,
      deadline: input.deadline ? new Date(input.deadline) : undefined,
      contractStatus: input.contractStatus,
      contractUrl: input.contractUrl,
      paymentStatus: input.paymentStatus,
      notes: input.notes,
    },
    include: {
      brand: true,
      creator: { select: { id: true, name: true, handle: true, avatarUrl: true } },
    },
  })

  return created(serializeDeal(deal))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeDeal(deal: any) {
  return {
    ...deal,
    dealValue: Number(deal.dealValue) / 100,
    commissionPct: Number(deal.commissionPct),
    creatorPayout: Number(deal.creatorPayout) / 100,
  }
}
