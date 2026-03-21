import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, created, badRequest, notFound, unprocessable, err } from '@/lib/api-response'
import { requireCreatorAuth } from '@/lib/auth'
import { uploadRateLimit } from '@/lib/rate-limit'
import { CreateSubmissionSchema } from '@/lib/validations/submission'
import { sendEmailJob } from '@/jobs/send-email'
import { renderEmailToHtml } from '@/lib/email'
import ContentSubmittedEmail from '@/emails/content-submitted'
import React from 'react'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const deal = await db.deal.findUnique({ where: { id } })
  if (!deal) return notFound()

  const submissions = await db.contentSubmission.findMany({
    where: { dealId: id },
    include: { creator: { select: { id: true, name: true, handle: true, avatarUrl: true } } },
    orderBy: { round: 'asc' },
  })

  return ok(submissions)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const authResult = await requireCreatorAuth()
  if (!authResult.ok) return authResult.response
  const { userId: creatorClerkId } = authResult

  // Upload rate limiting: 5 submissions per minute per creator
  const { success } = await uploadRateLimit.limit(creatorClerkId)
  if (!success) return err('Rate limit exceeded. Please wait before submitting again.', 429)

  const deal = await db.deal.findUnique({ where: { id } })
  if (!deal) return notFound()

  // Resolve the creator by their Clerk ID
  const creator = await db.creator.findUnique({ where: { clerkId: creatorClerkId } })
  if (!creator) return notFound('Creator profile not found')

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return badRequest('Invalid JSON body')
  }

  const parse = CreateSubmissionSchema.safeParse(body)
  if (!parse.success) return unprocessable(parse.error.issues[0]?.message ?? 'Validation error')

  // Count existing rounds for this deal
  const lastSubmission = await db.contentSubmission.findFirst({
    where: { dealId: id },
    orderBy: { round: 'desc' },
  })
  const nextRound = (lastSubmission?.round ?? 0) + 1

  const [submission] = await db.$transaction([
    db.contentSubmission.create({
      data: {
        dealId: id,
        creatorId: creator.id,
        round: nextRound,
        url: parse.data.url,
        fileKey: parse.data.fileKey,
      },
      include: { creator: { select: { id: true, name: true, handle: true, avatarUrl: true } } },
    }),
    // Auto-advance deal to PENDING_APPROVAL
    db.deal.update({
      where: { id },
      data: { stage: 'PENDING_APPROVAL' },
    }),
  ])

  // Fire-and-forget: notify agency that content was submitted
  void renderEmailToHtml(
    React.createElement(ContentSubmittedEmail, {
      dealTitle: deal.title,
      creatorName: creator.name,
      round: nextRound,
    })
  ).then((html) =>
    sendEmailJob.trigger({
      to: `${deal.agencyClerkId}@placeholder.dev`,
      subject: `Content submitted for: ${deal.title}`,
      html,
    })
  )

  return created(submission)
}
