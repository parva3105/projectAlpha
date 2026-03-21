# Backend Spec — Brand Deal Manager (Revamp)

## When This Gets Built

Phase 2. Not needed for Phase 1 (UI Shell).

All routes are versioned at `/api/v1/`. All responses follow the `{ data, error }` contract.

---

## Response Shape

```ts
// Success
{ data: T, error: null }

// Error
{ data: null, error: string }
```

**HTTP Status codes:**
| Status | Meaning |
|---|---|
| `200` | Success |
| `201` | Created |
| `400` | Bad request — Zod validation failed |
| `401` | Not authenticated (no Clerk session) |
| `403` | Wrong role |
| `404` | Resource not found |
| `422` | Unprocessable — business rule violation |

**Response helpers** (`lib/api-response.ts`):
```ts
ok(data)           → 200 { data, error: null }
created(data)      → 201 { data, error: null }
err(msg, status)   → { data: null, error: msg }
unauthorized()     → 401
forbidden()        → 403
notFound()         → 404
badRequest(msg)    → 400
unprocessable(msg) → 422
```

---

## Auth Pattern

**Phase 2:** All endpoints use a hardcoded test userId:
```ts
const agencyClerkId = "test_agency_001"  // remove in Phase 3
```

**Phase 3:** Replace with:
```ts
const { userId } = await auth()
if (!userId) return unauthorized()
```

Auth guard helper (`lib/auth.ts`):
```ts
requireAgencyAuth()     → { ok, userId } | unauthorized/forbidden response
requireCreatorAuth()    → { ok, userId } | unauthorized/forbidden response
requireBrandAuth()      → { ok, userId } | unauthorized/forbidden response
```

---

## Prisma Models

### Creator
```prisma
model Creator {
  id             String   @id @default(cuid())
  clerkId        String   @unique
  name           String
  handle         String   @unique
  bio            String?
  avatarUrl      String?
  platforms      String[]
  nicheTags      String[]
  followerCount  Int?
  engagementRate Float?
  isPublic       Boolean  @default(false)
  agencyClerkId  String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

### Brand
```prisma
model Brand {
  id        String   @id @default(cuid())
  name      String
  website   String?
  logoUrl   String?
  createdAt DateTime @default(now())
}
```

### Deal
```prisma
model Deal {
  id             String        @id @default(cuid())
  agencyClerkId  String
  brandId        String
  creatorId      String?
  briefId        String?
  title          String
  stage          DealStage     @default(BRIEF_RECEIVED)
  dealValue      Decimal       @db.Decimal(10, 2)
  commissionPct  Decimal       @db.Decimal(5, 2)
  creatorPayout  Decimal       @db.Decimal(10, 2)
  deadline       DateTime
  contractStatus ContractStatus @default(NOT_SENT)
  contractUrl    String?
  paymentStatus  PaymentStatus  @default(PENDING)
  notes          String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}
```

### ContentSubmission
```prisma
model ContentSubmission {
  id          String           @id @default(cuid())
  dealId      String
  creatorId   String
  round       Int              @default(1)
  url         String?
  fileKey     String?
  status      SubmissionStatus @default(PENDING)
  feedback    String?
  submittedAt DateTime         @default(now())
  reviewedAt  DateTime?
}
```

### Brief
```prisma
model Brief {
  id                 String      @id @default(cuid())
  brandManagerClerkId String
  agencyClerkId      String
  creatorId          String?
  title              String
  description        String
  budget             Decimal     @db.Decimal(10, 2)
  platform           String
  niche              String
  status             BriefStatus @default(NEW)
  createdAt          DateTime    @default(now())
}
```

### PartnershipRequest
```prisma
model PartnershipRequest {
  id            String            @id @default(cuid())
  agencyClerkId String
  creatorId     String
  message       String?
  status        PartnershipStatus @default(PENDING)
  createdAt     DateTime          @default(now())
}
```

---

## Enums

```ts
enum DealStage {
  BRIEF_RECEIVED
  CREATOR_ASSIGNED
  CONTRACT_SENT
  IN_PRODUCTION
  PENDING_APPROVAL   // system-controlled
  LIVE               // system-controlled
  PAYMENT_PENDING
  CLOSED
}

enum ContractStatus { NOT_SENT, SENT, SIGNED }
enum PaymentStatus  { PENDING, RECEIVED }
enum SubmissionStatus { PENDING, APPROVED, CHANGES_REQUESTED }
enum BriefStatus    { NEW, REVIEWED, CONVERTED, DECLINED }
enum PartnershipStatus { PENDING, ACCEPTED, DECLINED }
```

---

## Zod Schemas (`lib/validations/`)

### `deal.ts`
```ts
CreateDealSchema = z.object({
  title:         z.string().min(1),
  brandId:       z.string(),
  creatorId:     z.string().optional(),
  platform:      z.enum(PLATFORMS),
  dealValue:     z.number().positive(),   // dollars, converted to cents on server
  commissionPct: z.number().min(0).max(100),
  deadline:      z.string().datetime(),
  notes:         z.string().optional(),
})

UpdateDealSchema = CreateDealSchema.partial().extend({
  contractStatus: z.enum(['NOT_SENT','SENT','SIGNED']).optional(),
  paymentStatus:  z.enum(['PENDING','RECEIVED']).optional(),
})

AdvanceStageSchema = z.object({
  targetStage: DealStageEnum,
})
```

### `brand.ts`
```ts
CreateBrandSchema = z.object({
  name:    z.string().min(1),
  website: z.string().url().optional(),
})
```

### `roster.ts`
```ts
AddCreatorToRosterSchema = z.object({
  name:           z.string().min(1),
  handle:         z.string().min(1),
  bio:            z.string().optional(),
  platforms:      z.array(z.string()).min(1),
  nicheTags:      z.array(z.string()).optional(),
  followerCount:  z.number().optional(),
  engagementRate: z.number().optional(),
})
```

### `brief.ts`
```ts
CreateBriefSchema = z.object({
  agencyClerkId: z.string(),
  creatorId:     z.string().optional(),
  title:         z.string().min(1),
  description:   z.string().min(1),
  budget:        z.number().positive(),
  platform:      z.enum(PLATFORMS),
  niche:         z.string().min(1),
})

UpdateBriefSchema = z.object({
  status: z.enum(['REVIEWED', 'CONVERTED', 'DECLINED']),
})
```

### `submission.ts`
```ts
CreateSubmissionSchema = z.object({
  url:     z.string().url().optional(),
  fileKey: z.string().optional(),
}).refine(d => d.url || d.fileKey, "url or fileKey required")

ReviewSubmissionSchema = z.object({
  action:   z.enum(['APPROVE', 'REQUEST_CHANGES']),
  feedback: z.string().optional(),
}).refine(d => d.action !== 'REQUEST_CHANGES' || d.feedback, "feedback required")
```

---

## API Endpoints

---

### Auth

#### `GET /api/v1/auth/complete`
Post-signup Clerk callback. Reads `userId` from Clerk, sets role in publicMetadata, redirects to `/signup/complete`.

#### `POST /api/v1/auth/set-role`
Sets role when signing in via SSO without role-specific page.

```ts
Body: { role: 'agency' | 'creator' | 'brand_manager' }
Response: { data: { role }, error: null }
```

---

### Deals

#### `GET /api/v1/deals`
List all deals for the authenticated agency.

```
Query params:
  stage?:       DealStage
  creatorId?:   string
  brandId?:     string
  overdueOnly?: boolean

Response: { data: Deal[], error: null }
```

#### `POST /api/v1/deals`
Create a new deal.

```
Body: CreateDealInput
Server-computes: creatorPayout = dealValue × (1 − commissionPct/100)
Response: { data: Deal, error: null }  → 201
```

#### `GET /api/v1/deals/[id]`
Get single deal with brand, creator, and submissions.

```
Response: { data: Deal & { brand, creator, submissions }, error: null }
```

#### `PATCH /api/v1/deals/[id]`
Update deal fields (title, brand, creator, value, commission, deadline, contractStatus, paymentStatus, notes).
Recalculates `creatorPayout` if dealValue or commissionPct changes.

#### `DELETE /api/v1/deals/[id]`
Delete a deal. Only allowed on BRIEF_RECEIVED stage (no creator assigned).

#### `POST /api/v1/deals/[id]/stage`
Advance deal to a target stage.

```
Body: { targetStage: DealStage }
Validates: isValidAdvance(current, target) — no backward movement
Rejects: PENDING_APPROVAL, LIVE (system-controlled)
Response: { data: Deal, error: null }
```

#### `POST /api/v1/deals/[id]/reopen`
Move deal one stage backward.

```
Validates: cannot reopen from BRIEF_RECEIVED
Response: { data: Deal, error: null }
```

#### `GET /api/v1/deals/[id]/submissions`
List all content submissions for a deal.

```
Response: { data: ContentSubmission[], error: null }
```

#### `POST /api/v1/deals/[id]/submissions`
Creator submits content. Validates creator is assigned to deal.

```
Body: CreateSubmissionInput (url or fileKey)
Side-effect: auto-advances deal to PENDING_APPROVAL
Response: { data: ContentSubmission, error: null }  → 201
```

#### `PATCH /api/v1/deals/[id]/submissions/[submissionId]`
Agency reviews a submission.

```
Body: { action: 'APPROVE' | 'REQUEST_CHANGES', feedback?: string }
APPROVE:          sets status APPROVED, auto-advances deal to LIVE
REQUEST_CHANGES:  sets status CHANGES_REQUESTED, feedback required
Response: { data: ContentSubmission, error: null }
```

---

### Brands

#### `GET /api/v1/brands`
List all brands (global, not agency-scoped in MVP).

```
Response: { data: Brand[], error: null }
```

#### `POST /api/v1/brands`
Create a new brand.

```
Body: CreateBrandInput
Response: { data: Brand, error: null }  → 201
```

#### `GET /api/v1/brands/[id]`
Get brand with deals filtered to the authenticated agency.

```
Response: { data: Brand & { deals: Deal[] }, error: null }
```

#### `PATCH /api/v1/brands/[id]`
Update brand name or website.

---

### Roster & Creators

#### `GET /api/v1/roster`
List creators rostered to the authenticated agency.

```
Response: { data: Creator[], error: null }
```

#### `POST /api/v1/roster`
Manually add a creator (no Clerk account). Generates `clerkId = "roster_" + randomUUID()`.

```
Body: AddCreatorToRosterInput
Response: { data: Creator, error: null }  → 201
```

#### `GET /api/v1/creators`
Public creator directory — no auth required.

```
Query params:
  platform?:        string
  niche?:           string
  minFollowers?:    number
  maxFollowers?:    number
  minEngagement?:   number
  q?:               string (free-text, trigram search on name + handle)
  page?:            number (default: 1)
  pageSize?:        number (default: 50)

Response: { data: { creators: Creator[], total: number }, error: null }
```

Only returns creators where `isPublic = true`.

#### `GET /api/v1/creators/[handle]`
Public creator profile — no auth required.

```
Response: { data: Creator, error: null }
Returns 404 if isPublic = false
```

---

### Briefs

#### `GET /api/v1/briefs`
Agency inbox — list briefs submitted to authenticated agency.

```
Query params:
  status?: BriefStatus

Response: { data: Brief[], error: null }
```

#### `POST /api/v1/briefs`
Brand manager submits a brief.

```
Body: CreateBriefInput
Response: { data: Brief, error: null }  → 201
```

#### `GET /api/v1/briefs/[id]`
Get brief detail. Agency sees their briefs; brand manager sees their own.

#### `PATCH /api/v1/briefs/[id]`
Agency updates brief status.

```
Body: { status: 'REVIEWED' | 'CONVERTED' | 'DECLINED' }
CONVERTED: also creates a Deal (pre-filled from brief data) — returns { brief, deal }
```

---

### Partnerships

#### `POST /api/v1/partnerships`
Agency sends a partnership request to a creator.

```
Body: { creatorId: string, message?: string }
Validates: no existing PENDING request from same agency to same creator
Response: { data: PartnershipRequest, error: null }  → 201
```

#### `PATCH /api/v1/partnerships/[id]`
Creator accepts or declines a request.

```
Body: { action: 'ACCEPT' | 'DECLINE' }
ACCEPT: sets status ACCEPTED + sets creator.agencyClerkId = agency's clerkId
DECLINE: sets status DECLINED
Response: { data: PartnershipRequest, error: null }
```

---

## Stage Logic (`lib/stage-transitions.ts`)

```ts
const STAGE_ORDER = [
  'BRIEF_RECEIVED',
  'CREATOR_ASSIGNED',
  'CONTRACT_SENT',
  'IN_PRODUCTION',
  'PENDING_APPROVAL',  // system only
  'LIVE',              // system only
  'PAYMENT_PENDING',
  'CLOSED',
]

const SYSTEM_CONTROLLED_STAGES = ['PENDING_APPROVAL', 'LIVE']

function isValidAdvance(from: DealStage, to: DealStage): boolean
// True if `to` is after `from` in STAGE_ORDER AND `to` is not system-controlled

function getPreviousStage(stage: DealStage): DealStage | null
// Returns stage before current, or null if BRIEF_RECEIVED
```

---

## Email Events (Phase 3)

All triggered via Trigger.dev background jobs. Never sent synchronously.

| Event | Recipient | Trigger |
|---|---|---|
| DEAL_ASSIGNED | Creator | Agency sets creatorId on deal |
| CONTRACT_AVAILABLE | Creator | contractStatus → SENT |
| CONTENT_SUBMITTED | Agency | Creator submits ContentSubmission |
| CHANGES_REQUESTED | Creator | Agency requests changes |
| CONTENT_APPROVED | Creator | Agency approves submission |
| PAYMENT_RECEIVED | Creator | paymentStatus → RECEIVED |
| DEADLINE_WARNING | Agency | Cron: 48h before deadline, deal not LIVE/CLOSED |
| PARTNERSHIP_REQUEST | Creator | Agency sends partnership request |
| PARTNERSHIP_ACCEPTED | Agency | Creator accepts |
| PARTNERSHIP_DECLINED | Agency | Creator declines |
| NEW_BRIEF | Agency | Brand manager submits brief |
