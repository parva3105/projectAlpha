import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, badRequest, notFound, unprocessable } from '@/lib/api-response'
import { requireAgencyAuth } from '@/lib/auth'
import { UpdateBrandSchema } from '@/lib/validations/brand'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const authResult = await requireAgencyAuth()
  if (!authResult.ok) return authResult.response
  const { userId: agencyClerkId } = authResult

  const brand = await db.brand.findUnique({
    where: { id },
    include: {
      deals: {
        where: { agencyClerkId },
        include: {
          creator: { select: { id: true, name: true, handle: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!brand) return notFound()

  const data = {
    ...brand,
    deals: brand.deals.map((d) => ({
      ...d,
      dealValue: Number(d.dealValue) / 100,
      commissionPct: Number(d.commissionPct),
      creatorPayout: Number(d.creatorPayout) / 100,
    })),
  }

  return ok(data)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const authResult = await requireAgencyAuth()
  if (!authResult.ok) return authResult.response

  const existing = await db.brand.findUnique({ where: { id } })
  if (!existing) return notFound()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return badRequest('Invalid JSON body')
  }

  const parse = UpdateBrandSchema.safeParse(body)
  if (!parse.success) return unprocessable(parse.error.issues[0]?.message ?? 'Validation error')

  const brand = await db.brand.update({ where: { id }, data: parse.data })
  return ok(brand)
}
