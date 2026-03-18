---
name: api-design
description: Read this skill before building, modifying, or reviewing any Route Handler in app/api/v1/**. Covers response shape, Zod validation pattern, auth guards, rate limiting, email trigger IDs, deal stage transition rules, and endpoint inventory.
---

# API design — Brand Deal Manager

## Response shape (non-negotiable)

Every Route Handler returns this exact shape. No exceptions.

```ts
// Success
return Response.json({ data: result, error: null }, { status: 200 })

// Client error
return Response.json({ data: null, error: { message: "Deal not found", code: "NOT_FOUND" } }, { status: 404 })

// Validation error
return Response.json({ data: null, error: { message: "Validation failed", code: "VALIDATION_ERROR", fields: zodError.flatten().fieldErrors } }, { status: 422 })

// Auth error
return Response.json({ data: null, error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, { status: 401 })

// Server error
return Response.json({ data: null, error: { message: "Internal server error", code: "SERVER_ERROR" } }, { status: 500 })
```

Never return a bare string, a bare object, or throw an unhandled error to the client.

---

## Route Handler structure (follow this order every time)

```ts
import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { ratelimit } from '@/lib/ratelimit' // only on rate-limited endpoints

export async function POST(req: NextRequest) {
  // 1. Auth check
  const { userId, sessionClaims } = await auth()
  if (!userId) {
    return Response.json({ data: null, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } }, { status: 401 })
  }
  const role = sessionClaims?.metadata?.role

  // 2. Role guard (only if endpoint is role-specific)
  if (role !== 'agency') {
    return Response.json({ data: null, error: { message: 'Forbidden', code: 'FORBIDDEN' } }, { status: 403 })
  }

  // 3. Rate limit check (only on rate-limited endpoints)
  const { success } = await ratelimit.limit(userId)
  if (!success) {
    return Response.json({ data: null, error: { message: 'Too many requests', code: 'RATE_LIMITED' } }, { status: 429 })
  }

  // 4. Parse and validate body
  const body = await req.json()
  const parsed = CreateDealSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({
      data: null,
      error: { message: 'Validation failed', code: 'VALIDATION_ERROR', fields: parsed.error.flatten().fieldErrors }
    }, { status: 422 })
  }

  // 5. Business logic + DB
  try {
    const result = await db.deal.create({ data: parsed.data })
    return Response.json({ data: result, error: null }, { status: 201 })
  } catch (err) {
    console.error(err)
    return Response.json({ data: null, error: { message: 'Internal server error', code: 'SERVER_ERROR' } }, { status: 500 })
  }
}
```

---

## Zod validation rules

- Every POST and PATCH body has a named Zod schema in `lib/validations/`
- Schema file names match the resource: `lib/validations/deals.ts`, `lib/validations/briefs.ts`, etc.
- Never inline a schema inside a Route Handler — always import from `lib/validations/`
- Use `.safeParse()` not `.parse()` — never throw a Zod error to the client
- Strip unknown fields with `.strict()` on create schemas
- Use `.partial()` on update schemas — all fields optional on PATCH

```ts
// lib/validations/deals.ts
export const CreateDealSchema = z.object({
  title: z.string().min(1).max(255),
  brandId: z.string().cuid(),
  platform: z.enum(['INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'X_TWITTER', 'LINKEDIN', 'SNAPCHAT', 'PINTEREST', 'OTHER']),
  deliverableType: z.enum(['POST', 'REEL', 'STORY', 'SHORT_VIDEO', 'LONG_VIDEO', 'THREAD', 'BLOG_POST', 'PODCAST_MENTION', 'OTHER']),
  deliverableCount: z.number().int().positive(),
  briefText: z.string().min(1),
  deadline: z.string().datetime(),
  dealValue: z.number().positive(),
  commissionPct: z.number().min(0).max(1), // 0.20 = 20%
  creatorId: z.string().cuid().optional(),
  contractFileUrl: z.string().url().optional(),
  briefId: z.string().cuid().optional(),
}).strict()

export const UpdateDealSchema = CreateDealSchema.partial()
```

---

## Auth and role guards

Three roles: `agency` | `creator` | `brand_manager`

Role is read from Clerk session claims: `sessionClaims?.metadata?.role`

| Endpoint group | Allowed roles |
|---|---|
| `/api/v1/deals/**` | `agency` only |
| `/api/v1/briefs` GET | `agency` only |
| `/api/v1/briefs` POST | `brand_manager` only |
| `/api/v1/briefs/:id` PATCH | `agency` only |
| `/api/v1/roster` | `agency` only |
| `/api/v1/creators` GET | public (no auth required) |
| `/api/v1/creators/:id` GET | public (no auth required) |
| `/api/v1/partnerships` POST | `agency` only |
| `/api/v1/partnerships/:id/accept` POST | `creator` only |
| `/api/v1/partnerships/:id/decline` POST | `creator` only |
| `/api/v1/uploads/contract` POST | `agency` only |
| `/api/v1/uploads/content` POST | `creator` only |
| `/api/v1/uploads/avatar` POST | `creator` only |

Always verify the caller owns the resource before returning or mutating it. For example, a creator requesting `/api/v1/deals/:id` must have `deal.creatorId === creator.id` — never return another creator's deal.

---

## Rate limiting

Applied via Upstash. Import from `lib/ratelimit.ts`.

| Endpoint | Limit |
|---|---|
| `/api/v1/uploads/*` | 10 requests / 10s sliding window |
| `/api/v1/partnerships` POST | 10 requests / 10s sliding window |
| `/signup/*` | 5 requests / 60s sliding window |

All other endpoints: no rate limit in MVP.

```ts
// lib/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export const strictRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '60 s'),
})
```

---

## Deal stage transition rules (enforce in every stage-related endpoint)

| Stage | How it's set | Who triggers it |
|---|---|---|
| `BRIEF_RECEIVED` | On deal creation, no creator assigned | System |
| `CREATOR_ASSIGNED` | On deal creation or PATCH with creatorId | Agency (manual) |
| `CONTRACT_SENT` | When contractStatus set to SENT | Agency (manual) |
| `IN_PRODUCTION` | When contractStatus set to SIGNED | Agency (manual) |
| `PENDING_APPROVAL` | When creator submits a ContentSubmission | **System auto — never manual** |
| `LIVE` | When agency approves a ContentSubmission | **System auto — never manual** |
| `PAYMENT_PENDING` | Agency manual advance | Agency (manual) |
| `CLOSED` | When paymentStatus set to RECEIVED | Agency (manual) |

**Forward skipping**: allowed. Agency can skip stages (e.g. skip CONTRACT_SENT if no contract needed).

**Backward movement**: blocked except via explicit Reopen action. Reopen steps back exactly one stage. Validate this in `PATCH /api/v1/deals/:id/stage`.

**creatorPayout is always calculated server-side** — never accept it from the request body:
```ts
const creatorPayout = dealValue * (1 - commissionPct)
```

**Content submission precondition**: creator may only call `POST /api/v1/deals/:id/submissions` when `deal.stage === 'IN_PRODUCTION' || deal.stage === 'PENDING_APPROVAL'`. Return 422 otherwise.

---

## Email triggers (fire after the relevant DB write succeeds)

Never send email synchronously. Always use:
```ts
import { sendEmailJob } from '@/jobs/send-email'
await sendEmailJob.trigger({ template: 'TEMPLATE_ID', to: recipientEmail, data: payload })
```

| Action | Template ID | Recipient |
|---|---|---|
| Creator assigned to deal | `DEAL_ASSIGNED` | creator.email |
| contractStatus set to SENT | `CONTRACT_AVAILABLE` | creator.email |
| ContentSubmission created | `CONTENT_SUBMITTED` | agency.email |
| Agency requests changes on submission | `CHANGES_REQUESTED` | creator.email |
| Agency approves submission | `CONTENT_APPROVED` | creator.email |
| paymentStatus set to RECEIVED | `PAYMENT_RECEIVED` | creator.email |
| Agency sends PartnershipRequest | `PARTNERSHIP_REQUEST` | creator.email |
| Creator accepts PartnershipRequest | `PARTNERSHIP_ACCEPTED` | agency.email |
| Creator declines PartnershipRequest | `PARTNERSHIP_DECLINED` | agency.email |
| Brand manager submits Brief | `NEW_BRIEF` | agency.email |
| Deadline 48h warning (cron only) | `DEADLINE_WARNING` | agency.email |

The `DEADLINE_WARNING` template is triggered only from `jobs/deadline-reminders.ts` — never from a Route Handler.

---

## Endpoint inventory

```
GET    /api/v1/deals                          Agency: list all deals (filters: platform, creatorId, brandId, overdue)
POST   /api/v1/deals                          Agency: create deal
GET    /api/v1/deals/:id                      Agency: get deal detail
PATCH  /api/v1/deals/:id                      Agency: update deal fields
DELETE /api/v1/deals/:id                      Agency: soft delete (future — not MVP)

PATCH  /api/v1/deals/:id/stage                Agency: advance or reopen stage
POST   /api/v1/deals/:id/submissions          Creator: submit content (URL or file URL)
POST   /api/v1/deals/:id/submissions/:sid/approve   Agency: approve submission → auto LIVE
POST   /api/v1/deals/:id/submissions/:sid/reject    Agency: request changes (feedback required)

GET    /api/v1/briefs                         Agency: inbox (filters: status)
POST   /api/v1/briefs                         Brand Manager: submit brief to agency
GET    /api/v1/briefs/:id                     Agency: brief detail
PATCH  /api/v1/briefs/:id                     Agency: convert / decline / mark reviewed

GET    /api/v1/roster                         Agency: list partnered creators
GET    /api/v1/creators                       Public: directory (filters: platform, nicheTags, followerRange, engagementMin, search)
GET    /api/v1/creators/:id                   Public: creator profile

POST   /api/v1/partnerships                   Agency: send partnership request to creator
POST   /api/v1/partnerships/:id/accept        Creator: accept request → added to roster
POST   /api/v1/partnerships/:id/decline       Creator: decline request

POST   /api/v1/uploads/contract               Agency: get signed Vercel Blob upload URL (max 25MB)
POST   /api/v1/uploads/content                Creator: get signed R2 upload URL (max 500MB, TUS)
POST   /api/v1/uploads/avatar                 Creator: get signed Vercel Blob upload URL (max 5MB)
```

---

## Creator directory query

Use raw SQL for the filtered directory — Prisma does not support trigram search natively.

```ts
const creators = await db.$queryRaw`
  SELECT * FROM "Creator"
  WHERE "isPublic" = true
    AND ($1::text IS NULL OR name % $1 OR handle % $1)
    AND ($2::text[] IS NULL OR "nicheTags" && $2)
    AND ($3::text[] IS NULL OR platforms && $3)
    AND ($4::int IS NULL OR "followerCount" >= $4)
    AND ($5::int IS NULL OR "followerCount" <= $5)
    AND ($6::float IS NULL OR "engagementRate" >= $6)
  ORDER BY "followerCount" DESC
  LIMIT 50 OFFSET $7
`
```

Requires `pg_trgm` extension and trigram indexes on `name`, `handle`, and `nicheTags`. Confirm these exist before running this query (see database agent — initial migration).

---

## Data visibility rules (enforce on every response)

**Creator calling any endpoint:**
- Must never receive: `commissionPct`, `dealValue`, `paymentNotes`, `notes` (agency internal notes)
- Must never receive another creator's data
- `creatorPayout` is visible to creator on their own deals

**Brand Manager calling any endpoint:**
- Must never receive: `dealValue`, `commissionPct`, `creatorPayout`, `paymentStatus`, `paymentNotes`
- Can only see: Brief data, creator public profiles, agency names

Always use Prisma `select` to return only the fields appropriate for the caller's role — never return the full model object to a non-agency caller.

---

## Document new endpoints

After adding any new endpoint, append it to `docs/API.md` in this format:

```
## POST /api/v1/partnerships
Role: agency
Body: { creatorId: string, message?: string }
Response: { data: PartnershipRequest, error: null }
Triggers: PARTNERSHIP_REQUEST email to creator
```