import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, badRequest, notFound, unprocessable } from '@/lib/api-response'
import { getAgencyClerkId } from '@/lib/auth-helpers' // TODO(phase3): replace with real Clerk auth()
import { ReviewSubmissionSchema } from '@/lib/validations/submission'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sid: string }> }
) {
  const { id, sid } = await params
  const agencyClerkId = getAgencyClerkId() // TODO(phase3): replace with real Clerk auth()

  const deal = await db.deal.findFirst({ where: { id, agencyClerkId } })
  if (!deal) return notFound()

  const submission = await db.contentSubmission.findFirst({ where: { id: sid, dealId: id } })
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
    return ok(updatedSubmission)
  }

  // CHANGES_REQUESTED — feedback is required (validated by Zod)
  const updatedSubmission = await db.contentSubmission.update({
    where: { id: sid },
    data: { status: 'CHANGES_REQUESTED', feedback, reviewedAt: new Date() },
  })

  return ok(updatedSubmission)
}
