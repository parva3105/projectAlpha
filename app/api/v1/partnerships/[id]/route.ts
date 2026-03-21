import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, badRequest, notFound, unprocessable } from '@/lib/api-response'
import { getAgencyClerkId } from '@/lib/auth-helpers' // TODO(phase3): replace with real Clerk auth()
import { ReviewPartnershipSchema } from '@/lib/validations/partnership'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const agencyClerkId = getAgencyClerkId() // TODO(phase3): replace with real Clerk auth()

  const partnershipRequest = await db.partnershipRequest.findFirst({
    where: { id, agencyClerkId },
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
        where: { id: partnershipRequest.creatorId },
        data: { agencyClerkId },
      }),
    ])
    return ok(updated)
  }

  // DECLINED
  const updated = await db.partnershipRequest.update({
    where: { id },
    data: { status: 'DECLINED' },
  })
  return ok(updated)
}
