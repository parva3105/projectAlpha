import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, badRequest, forbidden, notFound, unprocessable } from '@/lib/api-response'
import { getAgencyClerkId } from '@/lib/auth-helpers' // TODO(phase3): replace with real Clerk auth()
import { AdvanceStageSchema } from '@/lib/validations/deal'
import { isValidAdvance } from '@/lib/stage-transitions'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const agencyClerkId = getAgencyClerkId() // TODO(phase3): replace with real Clerk auth()

  const deal = await db.deal.findFirst({ where: { id, agencyClerkId } })
  if (!deal) return notFound()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return badRequest('Invalid JSON body')
  }

  const parse = AdvanceStageSchema.safeParse(body)
  if (!parse.success) return unprocessable(parse.error.issues[0]?.message ?? 'Validation error')

  const { stage: targetStage } = parse.data

  if (!isValidAdvance(deal.stage, targetStage)) {
    return forbidden(
      `Cannot advance from ${deal.stage} to ${targetStage}. PENDING_APPROVAL and LIVE are system-controlled.`
    )
  }

  const updated = await db.deal.update({
    where: { id },
    data: { stage: targetStage },
    include: {
      brand: true,
      creator: { select: { id: true, name: true, handle: true, avatarUrl: true } },
    },
  })

  return ok({
    ...updated,
    dealValue: Number(updated.dealValue) / 100,
    commissionPct: Number(updated.commissionPct),
    creatorPayout: Number(updated.creatorPayout) / 100,
  })
}
