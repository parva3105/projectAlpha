import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, notFound } from '@/lib/api-response'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params

  const creator = await db.creator.findUnique({ where: { handle } })
  if (!creator || !creator.isPublic) return notFound()

  return ok({
    ...creator,
    engagementRate: creator.engagementRate != null ? Number(creator.engagementRate) : null,
  })
}
