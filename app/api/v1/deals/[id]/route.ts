import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, badRequest, forbidden, notFound, unprocessable } from '@/lib/api-response'
import { requireAgencyAuth } from '@/lib/auth'
import { UpdateDealSchema } from '@/lib/validations/deal'
import { sendEmailJob } from '@/jobs/send-email'
import { renderEmailToHtml } from '@/lib/email'
import DealAssignedEmail from '@/emails/deal-assigned'
import ContractAvailableEmail from '@/emails/contract-available'
import React from 'react'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const authResult = await requireAgencyAuth()
  if (!authResult.ok) return authResult.response
  const { userId: agencyClerkId } = authResult

  const deal = await db.deal.findFirst({
    where: { id, agencyClerkId },
    include: {
      brand: true,
      creator: true,
      brief: true,
      submissions: { orderBy: { round: 'asc' } },
    },
  })

  if (!deal) return notFound()
  return ok(serializeDeal(deal))
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const authResult = await requireAgencyAuth()
  if (!authResult.ok) return authResult.response
  const { userId: agencyClerkId } = authResult

  const existing = await db.deal.findFirst({ where: { id, agencyClerkId } })
  if (!existing) return notFound()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return badRequest('Invalid JSON body')
  }

  const parse = UpdateDealSchema.safeParse(body)
  if (!parse.success) return unprocessable(parse.error.issues[0]?.message ?? 'Validation error')

  const input = parse.data
  const updateData: Record<string, unknown> = {}

  if (input.title !== undefined) updateData.title = input.title
  if (input.brandId !== undefined) updateData.brandId = input.brandId
  if (input.creatorId !== undefined) updateData.creatorId = input.creatorId
  if (input.contractStatus !== undefined) updateData.contractStatus = input.contractStatus
  if (input.contractUrl !== undefined) updateData.contractUrl = input.contractUrl
  if (input.paymentStatus !== undefined) updateData.paymentStatus = input.paymentStatus
  if (input.notes !== undefined) updateData.notes = input.notes
  if (input.deadline !== undefined) updateData.deadline = new Date(input.deadline)

  if (input.dealValue !== undefined || input.commissionPct !== undefined) {
    const dealValueCents = input.dealValue !== undefined
      ? Math.round(input.dealValue * 100)
      : Number(existing.dealValue)
    const commissionPct = input.commissionPct !== undefined
      ? input.commissionPct
      : Number(existing.commissionPct)

    updateData.dealValue = dealValueCents
    updateData.commissionPct = commissionPct
    updateData.creatorPayout = Math.round(dealValueCents * (1 - commissionPct / 100))
  }

  const deal = await db.deal.update({
    where: { id },
    data: updateData,
    include: {
      brand: true,
      creator: { select: { id: true, name: true, handle: true, avatarUrl: true } },
    },
  })

  // Fire-and-forget emails based on what changed
  if (input.creatorId) {
    const creatorName = deal.creator?.name ?? 'Creator'
    const agencyName = deal.brand?.name ?? 'Your agency'
    void renderEmailToHtml(
      React.createElement(DealAssignedEmail, {
        dealTitle: deal.title,
        creatorName,
        agencyName,
      })
    ).then((html) =>
      sendEmailJob.trigger({
        to: `${input.creatorId}@placeholder.dev`,
        subject: `Deal assigned: ${deal.title}`,
        html,
      })
    )
  }

  if (input.contractStatus === 'SENT') {
    const recipientClerkId = input.creatorId ?? existing.creatorId
    const creatorName = deal.creator?.name ?? 'Creator'
    if (recipientClerkId) {
      void renderEmailToHtml(
        React.createElement(ContractAvailableEmail, {
          dealTitle: deal.title,
          creatorName,
        })
      ).then((html) =>
        sendEmailJob.trigger({
          to: `${recipientClerkId}@placeholder.dev`,
          subject: `Contract ready: ${deal.title}`,
          html,
        })
      )
    }
  }

  return ok(serializeDeal(deal))
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const authResult = await requireAgencyAuth()
  if (!authResult.ok) return authResult.response
  const { userId: agencyClerkId } = authResult

  const deal = await db.deal.findFirst({ where: { id, agencyClerkId } })
  if (!deal) return notFound()
  if (deal.stage !== 'BRIEF_RECEIVED') {
    return forbidden('Only deals in BRIEF_RECEIVED stage can be deleted')
  }

  await db.deal.delete({ where: { id } })
  return ok({ id })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeDeal(deal: any) {
  return {
    ...deal,
    dealValue: Number(deal.dealValue) / 100,
    commissionPct: Number(deal.commissionPct),
    creatorPayout: Number(deal.creatorPayout) / 100,
    brief: deal.brief ? {
      ...deal.brief,
      budget: deal.brief.budget != null ? Number(deal.brief.budget) / 100 : null,
    } : null,
  }
}
