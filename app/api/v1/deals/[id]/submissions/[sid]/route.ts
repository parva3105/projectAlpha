import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, badRequest, notFound, unprocessable } from '@/lib/api-response'
import { requireAgencyAuth } from '@/lib/auth'
import { ReviewSubmissionSchema } from '@/lib/validations/submission'
import { sendEmailJob } from '@/jobs/send-email'
import { renderEmailToHtml } from '@/lib/email'
import ChangesRequestedEmail from '@/emails/changes-requested'
import ContentApprovedEmail from '@/emails/content-approved'
import React from 'react'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sid: string }> }
) {
  const { id, sid } = await params
  const authResult = await requireAgencyAuth()
  if (!authResult.ok) return authResult.response
  const { userId: agencyClerkId } = authResult

  const deal = await db.deal.findFirst({ where: { id, agencyClerkId } })
  if (!deal) return notFound()

  const submission = await db.contentSubmission.findFirst({
    where: { id: sid, dealId: id },
    include: { creator: { select: { id: true, name: true, clerkId: true } } },
  })
  if (!submission) return notFound()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return badRequest('Invalid JSON body')
  }

  const parse = ReviewSubmissionSchema.safeParse(body)
  if (!parse.success) return unprocessable(parse.error.issues[0]?.message ?? 'Validation error')

  const { status, feedback } = parse.data

  if (status === 'APPROVED') {
    const [updatedSubmission] = await db.$transaction([
      db.contentSubmission.update({
        where: { id: sid },
        data: { status: 'APPROVED', reviewedAt: new Date() },
      }),
      // Auto-advance deal to LIVE
      db.deal.update({
        where: { id },
        data: { stage: 'LIVE' },
      }),
    ])

    // Fire-and-forget: notify creator that content was approved
    const creatorName = submission.creator?.name ?? 'Creator'
    const creatorClerkId = submission.creator?.clerkId ?? 'unknown'
    void renderEmailToHtml(
      React.createElement(ContentApprovedEmail, {
        dealTitle: deal.title,
        creatorName,
      })
    ).then((html) =>
      sendEmailJob.trigger({
        to: `${creatorClerkId}@placeholder.dev`,
        subject: `Your content was approved: ${deal.title}`,
        html,
      })
    )

    return ok(updatedSubmission)
  }

  // CHANGES_REQUESTED — feedback is required (validated by Zod)
  const updatedSubmission = await db.contentSubmission.update({
    where: { id: sid },
    data: { status: 'CHANGES_REQUESTED', feedback, reviewedAt: new Date() },
  })

  // Fire-and-forget: notify creator that changes were requested
  const creatorName = submission.creator?.name ?? 'Creator'
  const creatorClerkId = submission.creator?.clerkId ?? 'unknown'
  void renderEmailToHtml(
    React.createElement(ChangesRequestedEmail, {
      dealTitle: deal.title,
      creatorName,
      feedback: feedback ?? undefined,
    })
  ).then((html) =>
    sendEmailJob.trigger({
      to: `${creatorClerkId}@placeholder.dev`,
      subject: `Changes requested on your submission: ${deal.title}`,
      html,
    })
  )

  return ok(updatedSubmission)
}
