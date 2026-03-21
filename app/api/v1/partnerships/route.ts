import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { created, badRequest, notFound, unprocessable, err } from '@/lib/api-response'
import { requireAgencyAuth } from '@/lib/auth'
import { CreatePartnershipSchema } from '@/lib/validations/partnership'
import { sendEmailJob } from '@/jobs/send-email'
import { renderEmailToHtml } from '@/lib/email'
import PartnershipRequestEmail from '@/emails/partnership-request'
import React from 'react'

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

  const parse = CreatePartnershipSchema.safeParse(body)
  if (!parse.success) return unprocessable(parse.error.issues[0]?.message ?? 'Validation error')

  const { creatorId, message } = parse.data

  const creator = await db.creator.findUnique({ where: { id: creatorId } })
  if (!creator) return notFound('Creator not found')

  // Reject if there is already a PENDING request for this pair
  const existing = await db.partnershipRequest.findFirst({
    where: { agencyClerkId, creatorId, status: 'PENDING' },
  })
  if (existing) return err('A pending partnership request already exists for this creator', 409)

  const request = await db.partnershipRequest.create({
    data: { agencyClerkId, creatorId, message },
    include: { creator: { select: { id: true, name: true, handle: true, avatarUrl: true } } },
  })

  // Fire-and-forget: notify creator of the partnership request
  void renderEmailToHtml(
    React.createElement(PartnershipRequestEmail, {
      creatorName: creator.name,
      agencyName: agencyClerkId,
    })
  ).then((html) =>
    sendEmailJob.trigger({
      to: `${creator.clerkId}@placeholder.dev`,
      subject: 'Partnership request from an agency',
      html,
    })
  )

  return created(request)
}
