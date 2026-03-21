import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, badRequest, notFound } from '@/lib/api-response'
import { requireAgencyAuth } from '@/lib/auth'
import { getPreviousStage } from '@/lib/stage-transitions'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const authResult = await requireAgencyAuth()
  if (!authResult.ok) return authResult.response
  const { userId: agencyClerkId } = authResult

  const deal = await db.deal.findFirst({ where: { id, agencyClerkId } })
  if (!deal) return notFound()

  const prevStage = getPreviousStage(deal.stage)
  if (!prevStage) {
    return badRequest('Deal is already at the first stage (BRIEF_RECEIVED)')
  }

  const updated = await db.deal.update({
    where: { id },
    data: { stage: prevStage },
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
