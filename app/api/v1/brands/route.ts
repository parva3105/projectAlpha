import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, created, badRequest, unprocessable } from '@/lib/api-response'
import { CreateBrandSchema } from '@/lib/validations/brand'

export async function GET() {
  const brands = await db.brand.findMany({ orderBy: { name: 'asc' } })
  return ok(brands)
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return badRequest('Invalid JSON body')
  }

  const parse = CreateBrandSchema.safeParse(body)
  if (!parse.success) return unprocessable(parse.error.issues[0]?.message ?? 'Validation error')

  const brand = await db.brand.create({ data: parse.data })
  return created(brand)
}
