import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, created, badRequest, unprocessable } from '@/lib/api-response'
import { requireAgencyAuth, requireBrandAuth } from '@/lib/auth'
import { CreateBriefSchema } from '@/lib/validations/brief'
import { sendEmailJob } from '@/jobs/send-email'
import { renderEmailToHtml } from '@/lib/email'
import NewBriefEmail from '@/emails/new-brief'
import React from 'react'

export async function GET(req: NextRequest) {
  const authResult = await requireAgencyAuth()
  if (!authResult.ok) return authResult.response
  const { userId: agencyClerkId } = authResult

  const status = req.nextUrl.searchParams.get('status') ?? undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { agencyClerkId }
  if (status) where.status = status

  const briefs = await db.brief.findMany({
    where,
    include: { creator: { select: { id: true, name: true, handle: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return ok(briefs.map(serializeBrief))
}

export async function POST(req: NextRequest) {
  const authResult = await requireBrandAuth()
  if (!authResult.ok) return authResult.response
  const { userId: brandManagerClerkId } = authResult

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return badRequest('Invalid JSON body')
  }

  const parse = CreateBriefSchema.safeParse(body)
  if (!parse.success) return unprocessable(parse.error.issues[0]?.message ?? 'Validation error')

  const { budget, ...rest } = parse.data
  const budgetCents = budget != null ? Math.round(budget * 100) : undefined

  const brief = await db.brief.create({
    data: {
      ...rest,
      brandManagerClerkId,
      budget: budgetCents,
    },
    include: { creator: { select: { id: true, name: true, handle: true, avatarUrl: true } } },
  })

  // Fire-and-forget: notify agency that a new brief was submitted
  void renderEmailToHtml(
    React.createElement(NewBriefEmail, {
      brandName: brandManagerClerkId,
      campaignName: brief.title,
    })
  ).then((html) =>
    sendEmailJob.trigger({
      to: `${brief.agencyClerkId ?? 'agency'}@placeholder.dev`,
      subject: `New brief submitted: ${brief.title}`,
      html,
    })
  )

  return created(serializeBrief(brief))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeBrief(b: any) {
  return {
    ...b,
    budget: b.budget != null ? Number(b.budget) / 100 : null,
  }
}
