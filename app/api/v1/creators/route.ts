import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const platform     = searchParams.get('platform')    ?? undefined
  const niche        = searchParams.get('niche')       ?? undefined
  const q            = searchParams.get('q')           ?? undefined
  const minFollowers = searchParams.get('minFollowers') ? Number(searchParams.get('minFollowers')) : undefined
  const maxFollowers = searchParams.get('maxFollowers') ? Number(searchParams.get('maxFollowers')) : undefined
  const minEngagement = searchParams.get('minEngagement') ? Number(searchParams.get('minEngagement')) : undefined
  const page     = Math.max(1, Number(searchParams.get('page')     ?? 1))
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') ?? 50)))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { isPublic: true }

  if (platform) where.platforms = { has: platform }
  if (niche)    where.nicheTags = { has: niche }
  if (minFollowers !== undefined) where.followerCount = { ...where.followerCount, gte: minFollowers }
  if (maxFollowers !== undefined) where.followerCount = { ...where.followerCount, lte: maxFollowers }
  if (minEngagement !== undefined) where.engagementRate = { gte: minEngagement }
  if (q) {
    where.OR = [
      { name:   { contains: q, mode: 'insensitive' } },
      { handle: { contains: q, mode: 'insensitive' } },
    ]
  }

  const [creators, total] = await db.$transaction([
    db.creator.findMany({
      where,
      orderBy: { followerCount: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.creator.count({ where }),
  ])

  return ok({
    creators: creators.map(serializeCreator),
    pagination: { page, pageSize, total, pages: Math.ceil(total / pageSize) },
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeCreator(c: any) {
  return {
    ...c,
    engagementRate: c.engagementRate != null ? Number(c.engagementRate) : null,
  }
}
