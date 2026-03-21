# Project memory — Brand Deal Manager
_Last updated: 2026-03-20_

## Revamp (active)
- Branch: revamp/phase-1
- Approach: Frontend-first — UI shell with mock data → real API → auth
- Spec: /revamp/ directory (README, PRODUCT, ARCHITECTURE, ROADMAP, FRONTEND, BACKEND, MOCKDATA)
- Old M1+M2 code archived in _archive/
- Phase 1 complete: 2026-03-20 — all 18 routes with mock data, no DB, no Clerk

## Current state
- Status: **Phase 1 UI Shell complete — ready for Phase 2**
- Active milestone: Phase 2 — Backend Integration (replace mock data with real fetch() calls + Prisma)

## Pre-M3 fixes in progress — 2 PRs open
- **PR #8** `fix/pre-m3-proxy-loop` — proxy.ts redirect loop guard (stale JWT)
- **PR #9** `fix/pre-m3-landing-auth` — landing page + /signup role picker + branded auth layouts
- ⚠️ Both PRs must be merged AND the Clerk dashboard step completed before M3 begins
- Production URL: https://project-alpha-rho.vercel.app (deployed, all env vars baked in)
- Vercel Root Directory: blank (repo root) — confirmed correct
- GitHub repo: https://github.com/parva3105/projectAlpha
- All env vars confirmed in Vercel production (21 vars)

## M2 PRs — all merged ✅
- PR #3: Backend API routes, stage logic, roster (feat/m2-backend-api)
- PR #4: /brands, /brands/:id, /roster pages (feat/m2-secondary-pages)
- PR #5: /deals/new form, brand inline creation, /deals/:id detail (feat/m2-deal-pages)
- PR #6: Kanban board, deal card, drag-and-drop, filters (feat/m2-kanban-board)

## M1 deliverables — all complete ✅
- Next.js 16 + shadcn/ui + Geist fonts — scaffolded
- Neon + Prisma schema — migrated (6 models, 6 enums, trigram indexes)
- Clerk auth — 3 roles via publicMetadata, proxy.ts routing
- Skeleton layouts — agency, creator, brand_manager role groups
- Signup flows — /signup/agency, /signup/creator, /signup/brand with role assignment + session.reload()
- /login page — Clerk SignIn
- Playwright e2e tests — 15/15 green against production
- CI/CD — ci.yml (PR gate) + prod.yml (push to master → deploy) both trigger on main + master

## ⚠️ Before first real sign-up (M2 prerequisite)
Set Clerk session token claim in Clerk dashboard:
Configure → Sessions → Customize session token → `{ "metadata": "{{user.public_metadata}}" }`
Without this, all authenticated users loop to /signup/complete forever (see REQ-003).

## Stack confirmed
- Next.js 16 App Router + TypeScript strict
- shadcn/ui + Tailwind CSS + Geist fonts
- Neon Postgres + Prisma ORM
- Clerk (3 roles: agency / creator / brand_manager)
- Vercel Blob (avatars ≤5MB, contracts ≤25MB)
- Cloudflare R2 (content submissions ≤500MB, TUS resumable) — bucket: project-alpha
- Resend + React Email (11 email templates) — no custom domain for MVP, using onboarding@resend.dev
- Trigger.dev (email jobs + hourly deadline cron) — project ref: proj_rrpynkileknsdkbotnua
- Upstash Rate Limit (uploads, partnerships, signup)
- dnd-kit (Kanban board)

## Three user roles
- **Agency**: Full access — dashboard, deals, roster, briefs, discover (+ send partnership requests)
- **Creator**: /creator/*, /profile, /discover (browse only)
- **Brand Manager**: /discover, /creators/:handle (browse + submit brief), /briefs/new, /agencies

## Key product constraints
- Creator must never see: commission %, deal value, other creators, agency internal notes
- Brand Manager must never see: deal financials, commission, internal agency operations
- creatorPayout is always calculated server-side: dealValue × (1 − commissionPct)
- Email only for notifications — no in-app notification centre in MVP
- All monetary values in USD
- No custom email domain for MVP — recipients must be manually verified in Resend dashboard before they can receive emails (see REQ-002)

## External services — all provisioned ✅
- [x] Vercel account + project (https://project-alpha-rho.vercel.app)
- [x] Neon account + project (GitHub integration — install before M8 CI)
- [x] Clerk account + app (3 roles via publicMetadata — session token claim must be set)
- [x] Cloudflare R2 bucket (project-alpha — public access enabled)
- [x] Resend account (no custom domain — using onboarding@resend.dev, see REQ-002)
- [x] Trigger.dev project (proj_rrpynkileknsdkbotnua)
- [x] Upstash Redis database
- [x] GitHub repo created

## Clerk session token claim (critical — must be set before M1)
In Clerk dashboard → Configure → Sessions → Customize session token:
```json
{
  "metadata": "{{user.public_metadata}}"
}
```
Without this, proxy.ts cannot read the user role and all role-based routing breaks.

## Update this file when
- A milestone is completed (change status line + milestone status)
- A key product decision changes what we're building