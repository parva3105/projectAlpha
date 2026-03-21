import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, badRequest, forbidden, notFound, unprocessable } from '@/lib/api-response'
import { requireAgencyAuth } from '@/lib/auth'
import { AdvanceStageSchema } from '@/lib/validations/deal'
import { isValidAdvance } from '@/lib/stage-transitions'
import { sendEmailJob } from '@/jobs/send-email'
import { renderEmailToHtml } from '@/lib/email'
import PaymentReceivedEmail from '@/emails/payment-received'
import React from 'react'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const authResult = await requireAgencyAuth()
  if (!authResult.ok) return authResult.response
  const { userId: agencyClerkId } = authResult

  const deal = await db.deal.findFirst({
    where: { id, agencyClerkId },
    include: { creator: { select: { id: true, name: true, clerkId: true } } },
  })
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
      creator: { select: { id: true, name: true, handle: true, avatarUrl: true, clerkId: true } },
    },
  })

  // Fire-and-forget: notify creator when deal reaches PAYMENT_PENDING
  if (targetStage === 'PAYMENT_PENDING' && deal.creator) {
    const creatorName = deal.creator.name
    const creatorClerkId = deal.creator.clerkId
    void renderEmailToHtml(
      React.createElement(PaymentReceivedEmail, {
        dealTitle: deal.title,
        creatorName,
      })
    ).then((html) =>
      sendEmailJob.trigger({
        to: `${creatorClerkId}@placeholder.dev`,
        subject: `Your payment has been sent: ${deal.title}`,
        html,
      })
    )
  }

  return ok({
    ...updated,
    dealValue: Number(updated.dealValue) / 100,
    commissionPct: Number(updated.commissionPct),
    creatorPayout: Number(updated.creatorPayout) / 100,
  })
}
