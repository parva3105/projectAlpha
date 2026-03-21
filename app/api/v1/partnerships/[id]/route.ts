import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, badRequest, notFound, unprocessable } from '@/lib/api-response'
import { requireCreatorAuth } from '@/lib/auth'
import { ReviewPartnershipSchema } from '@/lib/validations/partnership'
import { sendEmailJob } from '@/jobs/send-email'
import { renderEmailToHtml } from '@/lib/email'
import PartnershipAcceptedEmail from '@/emails/partnership-accepted'
import PartnershipDeclinedEmail from '@/emails/partnership-declined'
import React from 'react'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Partnership accept/decline is a creator action
  const authResult = await requireCreatorAuth()
  if (!authResult.ok) return authResult.response
  const { userId: creatorClerkId } = authResult

  // Look up the creator profile for this Clerk user
  const creator = await db.creator.findUnique({ where: { clerkId: creatorClerkId } })
  if (!creator) return notFound('Creator profile not found')

  // Verify the request belongs to this creator
  const partnershipRequest = await db.partnershipRequest.findFirst({
    where: { id, creatorId: creator.id },
  })
  if (!partnershipRequest) return notFound()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return badRequest('Invalid JSON body')
  }

  const parse = ReviewPartnershipSchema.safeParse(body)
  if (!parse.success) return unprocessable(parse.error.issues[0]?.message ?? 'Validation error')

  const { status } = parse.data

  if (status === 'ACCEPTED') {
    const [updated] = await db.$transaction([
      db.partnershipRequest.update({ where: { id }, data: { status: 'ACCEPTED' } }),
      // Roster the creator under this agency
      db.creator.update({
        where: { id: creator.id },
        data: { agencyClerkId: partnershipRequest.agencyClerkId },
      }),
    ])

    // Fire-and-forget: notify agency that creator accepted
    void renderEmailToHtml(
      React.createElement(PartnershipAcceptedEmail, { creatorName: creator.name })
    ).then((html) =>
      sendEmailJob.trigger({
        to: `${partnershipRequest.agencyClerkId}@placeholder.dev`,
        subject: 'Creator accepted your partnership request',
        html,
      })
    )

    return ok(updated)
  }

  // DECLINED
  const updated = await db.partnershipRequest.update({
    where: { id },
    data: { status: 'DECLINED' },
  })

  // Fire-and-forget: notify agency that creator declined
  void renderEmailToHtml(
    React.createElement(PartnershipDeclinedEmail, { creatorName: creator.name })
  ).then((html) =>
    sendEmailJob.trigger({
      to: `${partnershipRequest.agencyClerkId}@placeholder.dev`,
      subject: 'Creator declined your partnership request',
      html,
    })
  )

  return ok(updated)
}
