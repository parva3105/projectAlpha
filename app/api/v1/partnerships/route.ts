import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { created, badRequest, notFound, unprocessable, err } from '@/lib/api-response'
import { getAgencyClerkId } from '@/lib/auth-helpers' // TODO(phase3): replace with real Clerk auth()
import { CreatePartnershipSchema } from '@/lib/validations/partnership'

export async function POST(req: NextRequest) {
  const agencyClerkId = getAgencyClerkId() // TODO(phase3): replace with real Clerk auth()

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

  return created(request)
}
