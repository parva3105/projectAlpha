# Roadmap — Brand Deal Manager (Revamp)

_Last updated: 2026-03-20_

---

## Milestone Overview

| Phase | Name | What Gets Built | Goal |
|---|---|---|---|
| **Phase 1** | UI Shell | All pages + components with mock data | Fully clickable prototype |
| **Phase 2** | Backend Integration | API routes + Prisma + real data | Forms persist, pages show real data |
| **Phase 3** | Auth + Polish | Clerk auth, role routing, smoke tests | Production-ready |

---

## Phase 1 — UI Shell

> **No database. No Clerk. No API calls.**
> All data comes from `lib/mock/` typed fixtures.
> A `RoleSwitcher` in the header lets you toggle between agency / creator / brand views.

### P1-1: Project Foundation
- [ ] Scaffold clean Next.js 16 app (or adapt existing)
- [ ] Install shadcn/ui + configure Tailwind v4 + Geist fonts
- [ ] Set up `lib/mock/` with all fixture files (see MOCKDATA.md)
- [ ] Build `RoleSwitcher` dev tool (localStorage-based role context)
- [ ] Build shared layout shell: `components/layout/Sidebar`, `Header`
- [ ] Three role layouts: `(agency)/layout.tsx`, `(creator)/layout.tsx`, `(brand)/layout.tsx`
- [ ] Confirm `npm run dev` runs cleanly

### P1-2: Agency — Core Pages
- [ ] `/dashboard` — Kanban board with mock deals across all 8 stages
  - KanbanBoard, KanbanColumn, DealCard components
  - Drag-and-drop between columns (dnd-kit) — updates local state only
  - KanbanFilters: platform, creator, brand, overdue toggle
- [ ] `/deals` — Deal list table with filters + "New Deal" button
- [ ] `/deals/new` — Create deal form
  - Title, brand (select), creator (optional select), platform (enum), deal value, commission %, deadline, notes
  - Live payout calculation: `dealValue × (1 − commissionPct/100)`
  - On submit → adds to mock list + redirects to `/deals/{id}` (or `/dashboard`)
  - Inline brand creation modal
- [ ] `/deals/[id]` — Deal detail with 4 sections:
  - Section A: Brief info (title, brand, platform, deadline, notes)
  - Section B: Contract (status badge, upload placeholder)
  - Section C: Content (submissions list, submission form, approval actions)
  - Section D: Payment (payout amount, payment status)
  - Stage control panel (advance / reopen buttons)

### P1-3: Agency — Supporting Pages
- [ ] `/roster` — Creator roster table (name, handle, platform, niche tags)
  - Add Creator sheet (name, handle, platform fields)
  - Empty state
- [ ] `/brands` — Brands table (name, website, deal count)
  - Add Brand dialog
  - Empty state
- [ ] `/brands/[id]` — Brand detail (info + associated deals table)
- [ ] `/briefs` — Brief inbox table (title, brand manager, platform, budget, status badge)
  - Filter by status
  - Empty state
- [ ] `/briefs/[id]` — Brief detail
  - Full brief info
  - Action buttons: Convert to Deal, Decline, Mark Reviewed
  - Convert → navigates to `/deals/new` with brief data pre-filled

### P1-4: Creator Portal
- [ ] `/creator/deals` — My deals list (assigned to mock creator)
  - Deal card: brand name, title, deadline, payout, stage badge
  - Empty state
- [ ] `/creator/deals/[id]` — Creator deal detail
  - Brief description
  - Contract status (read-only)
  - My payout amount (no commission %)
  - Content submission form (URL input)
  - Submission history (round, status, feedback)
  - Payment status
- [ ] `/creator/profile` — Profile editor
  - Bio, display name, handle
  - Platforms (multi-select)
  - Niche tags (multi-input)
  - Follower count, engagement rate
  - Public/private toggle
  - Avatar upload placeholder

### P1-5: Brand Manager Portal
- [ ] `/briefs/new` — Submit brief form
  - Title, description, budget, platform, niche
  - Agency selector
  - Creator (optional)
  - On submit → confirms + shows success state

### P1-6: Discovery Layer
- [ ] `/discover` — Public creator directory
  - Grid of CreatorCard components (mock creators)
  - Filters: platform, niche, follower range, engagement rate
  - Free-text search (client-side filter on mock data)
  - Pagination (show first 12, load more)
- [ ] `/creators/[handle]` — Public creator profile
  - Avatar, name, handle, bio
  - Platform badges
  - Niche tags
  - Follower count, engagement rate
  - Agency CTA: "Send Partnership Request" modal (Phase 2+ real action)
- [ ] `/agencies` — Simple agency listing (mock 2–3 agencies)
- [ ] `/` — Landing page
  - Hero section
  - 3 benefit blocks
  - 3 role cards (Agency, Creator, Brand Manager) with CTAs

### P1-7: Phase 1 Verification
- [ ] All 18 routes render without errors (`npm run dev`)
- [ ] Kanban shows 8 mock deals across all 8 stages
- [ ] Drag-and-drop moves cards between columns (local state)
- [ ] Deal detail shows all 4 sections with mock data
- [ ] Creator portal shows assigned mock deals with submission form
- [ ] Discover page shows mock creator cards with working filters
- [ ] Role switcher toggles between agency / creator / brand views correctly

---

## Phase 2 — Backend Integration

> **No auth yet.** API routes use a hardcoded test `agencyClerkId` (`"test_agency_001"`).
> Replace mock imports with real `fetch()` calls.

### P2-1: Database Setup
- [ ] Configure Neon Postgres connection in `.env.local`
- [ ] Run `prisma migrate dev` (schema already defined)
- [ ] Confirm all 6 tables exist + trigram indexes
- [ ] Seed database with test data matching Phase 1 mock fixtures

### P2-2: Core API Routes
- [ ] `GET /api/v1/deals` + `POST /api/v1/deals`
- [ ] `GET /api/v1/deals/[id]` + `PATCH /api/v1/deals/[id]`
- [ ] `POST /api/v1/deals/[id]/stage`
- [ ] `POST /api/v1/deals/[id]/reopen`
- [ ] `GET /api/v1/deals/[id]/submissions` + `POST /api/v1/deals/[id]/submissions`
- [ ] `GET /api/v1/brands` + `POST /api/v1/brands`
- [ ] `GET /api/v1/brands/[id]`
- [ ] `GET /api/v1/roster` + `POST /api/v1/roster`
- [ ] `GET /api/v1/creators` (public, with filters)
- [ ] `GET /api/v1/creators/[handle]` (public)
- [ ] `GET /api/v1/briefs` + `POST /api/v1/briefs`
- [ ] `GET /api/v1/briefs/[id]` + `PATCH /api/v1/briefs/[id]`
- [ ] `POST /api/v1/partnerships`
- [ ] `PATCH /api/v1/partnerships/[id]`

### P2-3: Wire Pages to Real API
- [ ] Dashboard → `GET /api/v1/deals`
- [ ] Deal list → `GET /api/v1/deals`
- [ ] Deal detail → `GET /api/v1/deals/[id]`
- [ ] New deal form → `POST /api/v1/deals`
- [ ] Stage control → `POST /api/v1/deals/[id]/stage` + reopen
- [ ] Roster → `GET/POST /api/v1/roster`
- [ ] Brands → `GET/POST /api/v1/brands`
- [ ] Brand detail → `GET /api/v1/brands/[id]`
- [ ] Briefs → `GET/POST /api/v1/briefs`
- [ ] Brief detail actions → `PATCH /api/v1/briefs/[id]`
- [ ] Content submission → `POST /api/v1/deals/[id]/submissions`
- [ ] Creator discover → `GET /api/v1/creators`
- [ ] Creator profile → `GET /api/v1/creators/[handle]`

### P2-4: Phase 2 Verification
- [ ] All pages show real Prisma data
- [ ] Creating a deal persists and appears on Kanban
- [ ] Stage advancement persists
- [ ] Content submission auto-advances deal to PENDING_APPROVAL
- [ ] Approval auto-advances to LIVE + sets creator payout

---

## Phase 3 — Auth + Polish

### P3-1: Clerk Setup
- [ ] Install Clerk + configure app
- [ ] Set publicMetadata.role claim in Clerk dashboard
- [ ] Signup flows: `/signup/agency`, `/signup/creator`, `/signup/brand`
- [ ] `/login` page
- [ ] `/signup/complete` JWT reload page

### P3-2: Auth Guards
- [ ] `proxy.ts` — role-based routing (same as existing implementation)
- [ ] Replace hardcoded `"test_agency_001"` with real Clerk `userId` in all API routes
- [ ] Add `requireAgencyAuth()`, `requireCreatorAuth()`, `requireBrandAuth()` helpers
- [ ] Test all role-mismatch redirects work correctly

### P3-3: Email + Jobs
- [ ] Configure Trigger.dev + Resend
- [ ] Build 11 React Email templates
- [ ] Wire email triggers to API actions
- [ ] Deadline reminder cron job (hourly, 48h window)

### P3-4: Polish
- [ ] Empty states on all list views
- [ ] Loading skeletons on all data-fetching pages
- [ ] Error boundaries on all route groups
- [ ] Mobile responsive audit
- [ ] Rate limiting on sensitive endpoints (Upstash)
- [ ] Postgres query performance audit

### P3-5: Smoke Tests
- [ ] Playwright: agency creates deal → assigns creator → content submitted → approved → payment received
- [ ] Playwright: brand manager submits brief → agency converts to deal
- [ ] Playwright: creator self-registers → builds profile → agency partnership request → accepted → deal assigned

---

## Summary

| Phase | Routes Built | APIs Built | Auth | DB |
|---|---|---|---|---|
| Phase 1 | 18 pages | 0 | Stubbed (RoleSwitcher) | Mock fixtures |
| Phase 2 | 18 pages | 15 endpoints | Stubbed (hardcoded userId) | Real Neon/Prisma |
| Phase 3 | 18 pages + auth pages | 15 endpoints + auth | Real Clerk | Real Neon/Prisma |
