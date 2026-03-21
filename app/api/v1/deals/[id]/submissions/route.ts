import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, created, badRequest, notFound, unprocessable } from '@/lib/api-response'
import { getCreatorClerkId } from '@/lib/auth-helpers' // TODO(phase3): replace with real Clerk auth()
import { CreateSubmissionSchema } from '@/lib/validations/submission'

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

  const deal = await db.deal.findUnique({ where: { id } })
  if (!deal) return notFound()

  // Resolve the creator by their Clerk ID
  const creatorClerkId = getCreatorClerkId() // TODO(phase3): replace with real Clerk auth()
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

  return created(submission)
}
