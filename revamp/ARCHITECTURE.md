# Architecture — Brand Deal Manager (Revamp)

## Core Philosophy

**Frontend and backend are built in separate, sequential phases.**

Phase 1 builds the complete UI with no backend dependency. Phase 2 wires in the real API. Phase 3 adds auth. Each phase is independently runnable and testable.

This means:
- Pages use typed mock data in Phase 1 — same shape as Prisma models
- Phase 2 replaces mock imports with `fetch()` calls — no component rewrites
- Phase 3 wraps routes with auth guards — no layout rewrites

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server Components, streaming, file-system routing |
| UI | shadcn/ui + Tailwind CSS v4 | Component primitives, Geist design tokens |
| Fonts | Geist Sans + Geist Mono | Vercel standard — variable, zero layout shift |
| Forms | React Hook Form + Zod | Type-safe, works without backend in Phase 1 |
| Drag & Drop | dnd-kit | Kanban board — Sortable + DragOverlay |
| Database | Neon (Postgres 16) via Prisma 5 | Serverless Postgres, GitHub integration for CI |
| ORM | Prisma 5.x | Type-safe queries, migration system |
| Auth | Clerk | 3 roles via publicMetadata, proxy.ts routing |
| File Storage (small) | Vercel Blob | Avatars ≤5MB, contracts ≤25MB |
| File Storage (large) | Cloudflare R2 | Content submissions ≤500MB, TUS resumable |
| Email | Resend + React Email | Transactional email, MVP uses shared sender |
| Background Jobs | Trigger.dev | Email retry, deadline reminder cron |
| Rate Limiting | Upstash Rate Limit | Auth + upload endpoints |
| Notifications | Sonner | In-app toast notifications |

---

## Folder Structure

```
/
├── app/
│   ├── (public)/               # Public routes — accessible without auth
│   │   ├── page.tsx            # Landing page  (/)
│   │   ├── discover/           # Creator directory (/discover)
│   │   ├── creators/[handle]/  # Creator profile (/creators/:handle)
│   │   ├── agencies/           # Agency listing (/agencies)
│   │   ├── login/              # Clerk login (/login)       [Phase 3]
│   │   └── signup/             # Role picker + Clerk signup [Phase 3]
│   │
│   ├── (agency)/               # Agency-scoped routes (auth-protected in Phase 3)
│   │   ├── layout.tsx          # Agency sidebar + header layout
│   │   ├── dashboard/          # Kanban pipeline (/dashboard)
│   │   ├── deals/
│   │   │   ├── page.tsx        # Deal list (/deals)
│   │   │   ├── new/            # Create deal (/deals/new)
│   │   │   └── [id]/           # Deal detail (/deals/:id)
│   │   ├── roster/             # Creator roster (/roster)
│   │   ├── brands/
│   │   │   ├── page.tsx        # Brands table (/brands)
│   │   │   └── [id]/           # Brand detail (/brands/:id)
│   │   └── briefs/
│   │       ├── page.tsx        # Brief inbox (/briefs)
│   │       └── [id]/           # Brief detail (/briefs/:id)
│   │
│   ├── (creator)/              # Creator-scoped routes (auth-protected in Phase 3)
│   │   ├── layout.tsx          # Creator sidebar + header layout
│   │   ├── creator/
│   │   │   ├── deals/
│   │   │   │   ├── page.tsx    # My deals (/creator/deals)
│   │   │   │   └── [id]/       # Deal detail (/creator/deals/:id)
│   │   │   └── profile/        # Profile editor (/creator/profile)
│   │
│   ├── (brand)/                # Brand manager routes (auth-protected in Phase 3)
│   │   ├── layout.tsx          # Brand sidebar + header layout
│   │   └── briefs/
│   │       └── new/            # Submit brief (/briefs/new)
│   │
│   └── api/v1/                 # REST API (all Phase 2+)
│       ├── auth/
│       ├── deals/[id]/
│       ├── brands/[id]/
│       ├── roster/
│       ├── creators/[handle]/
│       ├── briefs/[id]/
│       └── partnerships/[id]/
│
├── components/
│   ├── ui/                     # shadcn/ui primitives (Button, Card, Badge, etc.)
│   ├── layout/                 # Sidebar, Header, RoleSwitcher (Phase 1 dev tool)
│   ├── kanban/                 # KanbanBoard, KanbanColumn, DealCard, DealDraggable, Filters
│   ├── deals/                  # DealDetail, StageControlPanel, SubmissionHistory
│   ├── creator/                # CreatorCard, CreatorProfileEditor, CreatorDealCard
│   ├── brands/                 # BrandsTable, BrandDetail, AddBrandDialog
│   ├── roster/                 # RosterTable, AddCreatorSheet, AddCreatorForm
│   ├── briefs/                 # BriefsTable, BriefDetail, SubmitBriefForm
│   ├── forms/                  # Shared form components (DealNewForm, InlineBrandForm)
│   └── auth/                   # AuthLayout, SignupRolePicker [Phase 3]
│
├── lib/
│   ├── mock/                   # Phase 1 — typed mock data fixtures
│   │   ├── deals.ts
│   │   ├── creators.ts
│   │   ├── brands.ts
│   │   ├── briefs.ts
│   │   └── submissions.ts
│   ├── validations/            # Zod schemas (deal, brand, roster, brief)
│   ├── db.ts                   # Prisma client singleton [Phase 2]
│   ├── auth.ts                 # Clerk auth helpers [Phase 3]
│   ├── stage-transitions.ts    # Stage logic (server)
│   ├── stage-transitions.client.ts  # Stage logic (client-safe)
│   ├── overdue.ts              # Overdue check (server)
│   ├── overdue.client.ts       # Overdue check (client-safe)
│   ├── api-response.ts         # ok() / err() response helpers [Phase 2]
│   ├── button-variants.ts      # CVA button styles
│   └── utils.ts                # cn() + shared utils
│
├── prisma/
│   ├── schema.prisma           # 6 models, 6 enums, trigram indexes
│   └── migrations/
│
├── jobs/                       # Trigger.dev jobs [Phase 2+]
│   ├── send-email.ts
│   └── deadline-reminders.ts
│
├── emails/                     # React Email templates [Phase 2+]
│
├── proxy.ts                    # Clerk middleware — auth + role routing [Phase 3]
└── revamp/                     # This planning directory
```

---

## Phase Separation

### How Phase 1 → Phase 2 transition works

Every page that shows data follows the same pattern:

**Phase 1 (mock):**
```ts
// app/(agency)/brands/page.tsx
import { mockBrands } from "@/lib/mock/brands"

export default function BrandsPage() {
  const brands = mockBrands  // ← static import
  return <BrandsTable brands={brands} />
}
```

**Phase 2 (real data):**
```ts
// app/(agency)/brands/page.tsx
export default async function BrandsPage() {
  const res = await fetch("/api/v1/brands", { cache: "no-store" })
  const { data: brands } = await res.json()
  return <BrandsTable brands={brands} />
}
```

The component (`BrandsTable`) doesn't change at all. Only the page-level data source changes.

---

### Phase 1 Auth Stub

In Phase 1, there's no Clerk. Instead, a `RoleSwitcher` dev tool in the header lets you toggle between roles. The current role is stored in `localStorage` and read by a context provider. This is stripped out in Phase 3 and replaced with real Clerk auth.

**RoleSwitcher (dev only):**
```
[Agency ▼] in header dropdown → switches sidebar nav + available routes
```

---

### Phase 3 Auth integration

`proxy.ts` wraps all role-protected routes. Each page's server fetch calls gain the Clerk userId from `auth()`. No component changes — only the data source gets the real userId.

---

## API Contract

All API routes return a consistent shape:

```ts
// Success
{ data: T, error: null }

// Error
{ data: null, error: string }
```

HTTP status codes:
- `200` — success
- `400` — bad request (Zod validation failure)
- `401` — not authenticated
- `403` — wrong role
- `404` — not found
- `422` — unprocessable (business rule violation)

---

## Key Constraints

- **TypeScript strict mode** — no `any`, no `as unknown`
- **Server Components by default** — `'use client'` only for interactivity
- **All monetary values in USD cents** as `Decimal(10,2)` in Postgres
- **Creator payout always calculated server-side** — never user input
- **All API inputs validated with Zod** — schemas in `lib/validations/`
- **Versioned API at `/api/v1/`** — supports future mobile client
- **Prisma 5.x** (not 6.x) — Node 20.11.1 compatibility
- **Vitest 1.x with happy-dom** — Node 20.11.1 jsdom compatibility
