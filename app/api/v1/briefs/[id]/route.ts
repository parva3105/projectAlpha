import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, badRequest, notFound, unprocessable } from '@/lib/api-response'
import { getAgencyClerkId } from '@/lib/auth-helpers' // TODO(phase3): replace with real Clerk auth()
import { UpdateBriefSchema } from '@/lib/validations/brief'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const agencyClerkId = getAgencyClerkId() // TODO(phase3): replace with real Clerk auth()

  const brief = await db.brief.findFirst({
    where: { id, agencyClerkId },
    include: {
      creator: { select: { id: true, name: true, handle: true, avatarUrl: true } },
      deal: true,
    },
  })

  if (!brief) return notFound()
  return ok(serializeBrief(brief))
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const agencyClerkId = getAgencyClerkId() // TODO(phase3): replace with real Clerk auth()

  const brief = await db.brief.findFirst({ where: { id, agencyClerkId } })
  if (!brief) return notFound()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return badRequest('Invalid JSON body')
  }

  const parse = UpdateBriefSchema.safeParse(body)
  if (!parse.success) return unprocessable(parse.error.issues[0]?.message ?? 'Validation error')

  const { status } = parse.data

  // CONVERTED: create a Deal from brief data and mark brief as converted
  if (status === 'CONVERTED') {
    const budgetCents = brief.budget != null ? Number(brief.budget) : 0
    // Default 20% commission when converting from brief
    const commissionPct = 20
    const creatorPayout = Math.round(budgetCents * (1 - commissionPct / 100))
    // Resolve brand ID before entering the transaction
    const brandId = await getOrCreatePlaceholderBrand()

    const [updatedBrief, deal] = await db.$transaction([
      db.brief.update({ where: { id }, data: { status: 'CONVERTED' } }),
      db.deal.create({
        data: {
          agencyClerkId,
          title: brief.title,
          briefId: id,
          brandId,
          dealValue: budgetCents,
          commissionPct,
          creatorPayout,
          creatorId: brief.creatorId ?? undefined,
          notes: brief.description,
        },
      }),
    ])

    return ok({
      brief: serializeBrief(updatedBrief),
      deal: {
        ...deal,
        dealValue: Number(deal.dealValue) / 100,
        commissionPct: Number(deal.commissionPct),
        creatorPayout: Number(deal.creatorPayout) / 100,
      },
    })
  }

  // REVIEWED or DECLINED — simple status update
  const updatedBrief = await db.brief.update({
    where: { id },
    data: { status },
    include: { creator: { select: { id: true, name: true, handle: true, avatarUrl: true } } },
  })

  return ok(serializeBrief(updatedBrief))
}

/** Get or create a generic placeholder brand so the Deal FK is satisfied */
async function getOrCreatePlaceholderBrand(): Promise<string> {
  const existing = await db.brand.findFirst({ where: { name: 'Unassigned' } })
  if (existing) return existing.id
  const brand = await db.brand.create({ data: { name: 'Unassigned' } })
  return brand.id
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeBrief(b: any) {
  return {
    ...b,
    budget: b.budget != null ? Number(b.budget) / 100 : null,
    deal: b.deal ? {
      ...b.deal,
      dealValue: Number(b.deal.dealValue) / 100,
      commissionPct: Number(b.deal.commissionPct),
      creatorPayout: Number(b.deal.creatorPayout) / 100,
    } : undefined,
  }
}
