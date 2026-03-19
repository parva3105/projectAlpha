# Iteration log — Brand Deal Manager
_Append only. One entry per session or PR. Never delete._

---

## 2026-03-19 — M2: Deal Pipeline API Routes
**Type**: Feature
**Milestone**: M2 — Agency Deal Pipeline
**Branch**: feat/m2-backend-api
**What changed**:
- Installed `zod@^4.3.6` (validation) and `vitest@^1.6.1` (compatible with Node 20.11.1)
- Added `test` and `test:watch` scripts to `package.json`
- Created `vitest.config.ts` with node environment and `@` alias
- Implemented `lib/auth.ts` — `requireAgencyAuth()` reads Clerk session claims (`metadata.role`) and returns typed result object; no exceptions thrown
- Created `lib/validations/deal.ts` — `CreateDealSchema`, `UpdateDealSchema`, `AdvanceStageSchema` with all Prisma enum mirrors; `platform` field omitted (not on Deal model)
- Created `lib/validations/brand.ts` — `CreateBrandSchema`, `UpdateBrandSchema`; `notes` field omitted (not on Brand model)
- Created `lib/validations/roster.ts` — `AddCreatorToRosterSchema` with handle regex validation
- Created `lib/stage-transitions.ts` — `STAGE_ORDER`, `SYSTEM_CONTROLLED_STAGES`, `isValidAdvance()`, `getPreviousStage()`
- Created `lib/overdue.ts` — `isOverdue()` — false for null deadline, LIVE stage, or CLOSED stage
- Created `lib/api-response.ts` — shared `ok()`, `err()`, `unauthorized()`, `forbidden()`, `notFound()`, `unprocessable()`, `badRequest()` helpers
- Created route handlers:
  - `app/api/v1/deals/route.ts` — GET (with stage/creatorId/brandId/overdueOnly filters) + POST
  - `app/api/v1/deals/[id]/route.ts` — GET + PATCH (recalculates creatorPayout) + DELETE
  - `app/api/v1/deals/[id]/stage/route.ts` — POST (advance stage, rejects system stages with 422)
  - `app/api/v1/deals/[id]/reopen/route.ts` — POST (one step back, rejects BRIEF_RECEIVED with 422)
  - `app/api/v1/brands/route.ts` — GET + POST
  - `app/api/v1/brands/[id]/route.ts` — GET with deals[]
  - `app/api/v1/roster/route.ts` — GET + POST (placeholder clerkId via crypto.randomUUID())
- Created 4 test files in `lib/__tests__/`:
  - `stage-transitions.test.ts` — 9 tests (STAGE_ORDER, isValidAdvance, getPreviousStage)
  - `overdue.test.ts` — 5 tests (all edge cases)
  - `deal-validation.test.ts` — 15 tests (CreateDealSchema, UpdateDealSchema, AdvanceStageSchema)
  - `stage-advance-business-logic.test.ts` — 10 tests (combined logic, reopen)
- All 39 tests pass: `npx vitest run` ✅
- `npm run typecheck` → zero errors ✅
- `npm run lint` → 0 errors, 2 warnings (expected underscore-prefix params) ✅
- Documented all 10 new endpoints in `docs/API.md`

---

## 2026-03-19 — Pre-PR cleanup (user commits, pre-M1 Task 3)
**Type**: Cleanup
**Commits**: `5973fa9` (Removed), `e97277c` (removed)
**What changed**:
- `.env.local` was accidentally committed to the repo, then removed in two sequential commits
- `.claude/launch.json` added (local VS Code/IDE launch config — gitignored going forward)
- `dev_output.txt` added (local dev scratch file — gitignored)
- These commits predate PR #1 merge; they are user cleanup actions, not milestone work

---

## 2026-03-19 — chore: ignore .claude/ in ESLint (part of PR #2)
**Type**: Chore
**Commit**: `90c1b8a`
**Milestone**: M1 — Foundation
**What changed**:
- Added `.claude/**` to `globalIgnores` in `eslint.config.mjs`
- Claude Code skill scripts under `.claude/skills/` use CommonJS `require()` which correctly triggered `@typescript-eslint/no-require-imports`; they are tooling, not product code
- Without this fix, `npm run lint` failed in the pre-PR checklist

---

## 2026-03-18 — refactor/lift-to-root
**Type**: Refactor / DevOps
**Branch**: refactor/lift-to-root
**What changed**:
- brand-deal-manager/ lifted to repo root via git mv (history preserved for all tracked files)
- brand-deal-manager/CLAUDE.md removed (root CLAUDE.md is authoritative)
- brand-deal-manager/.gitignore merged into root .gitignore (yarn, .pem entries appended); then removed
- brand-deal-manager/ directory not force-deleted — untracked files remain (node_modules/, prisma/, proxy.ts, next-env.d.ts, tsconfig.tsbuildinfo); these are gitignored
- Ghost dirs deleted: apps/ (apps/backend, apps/db, apps/frontend), discovery/
- infra/ was NOT deleted — infra/docker-compose.yml is a tracked file
- ci.yml fixed: added cache-dependency-path: package-lock.json; no working-directory needed (runs from root); test step uses --if-present flag since npm test script not yet defined
- prod.yml populated with 3-job pipeline: quality (typecheck+lint+build) → migrate (prisma migrate deploy against DATABASE_URL_UNPOOLED) → deploy (amondnet/vercel-action@v25 --prod)
- staging.yml deleted (Vercel native preview URLs replace it for every PR/branch push)
- Missing scaffold dirs created with .gitkeep: jobs/, emails/, components/kanban/, components/creator/, components/deals/, components/forms/, lib/validations/
- lib/auth.ts stub created (implementation deferred to M2)
- CLAUDE.md paths already correct at root (no brand-deal-manager/ prefixes present)
**REQUIRED MANUAL ACTION**: Vercel Dashboard -> Project -> Settings -> General -> Root Directory -> change from 'brand-deal-manager' to blank (repo root). Without this step, Vercel will try to build from the wrong directory and the deploy will fail.

---

## 2026-03-19 — M1 Task 4: Playwright e2e tests + CI fix
**Type**: Testing / DevOps
**Milestone**: M1 — Foundation
**Branch**: feat/m1-e2e-tests
**What changed**:
- Installed `@playwright/test@^1.58.2`; added `test:e2e` + `test:e2e:report` scripts to `package.json`
- Created `playwright.config.ts` at repo root — `baseURL` overridable via `PLAYWRIGHT_BASE_URL`; chromium only; retries: 1
- Created 5 spec files in `e2e/`:
  - `auth.unauthenticated.spec.ts` — protected routes redirect to /login (requires CLERK_SECRET_KEY in Vercel)
  - `public.routes.spec.ts` — /login, /discover, /agencies, / all accessible without auth ✅
  - `auth.signup.agency.spec.ts` — /signup/agency renders + main element visible ✅
  - `auth.signup.creator.spec.ts` — /signup/creator renders + main element visible ✅
  - `auth.signup.brand.spec.ts` — /signup/brand renders + main element visible ✅
- Fixed `ci.yml` + `prod.yml` to trigger on both `main` and `master` (repo initialized with master, not main)
- Installed Vercel CLI (`npm i -g vercel`), ran `vercel link` to connect to parva3105s-projects/project-alpha
- All 21 env vars confirmed present in Vercel production via `vercel env ls production` (added 8h prior)
- Root cause of redirect failures: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is baked at build time — production deployment predated the env vars being added → Clerk client couldn't initialize → middleware passed all requests through
- Fix: `vercel deploy --prod` triggered fresh production build with all env vars baked in → aliased to https://project-alpha-rho.vercel.app
- **Final test results: 15/15 pass ✅**
- playwright.config.ts updated: defaulted baseURL to production URL (https://project-alpha-rho.vercel.app/)
- .vercel/ added to .gitignore by vercel link
**PR**: https://github.com/parva3105/projectAlpha/pull/2
**Status**: M1 COMPLETE ✅

---

## 2026-03-19 — M1 Task 3: Clerk auth + role routing + skeleton layouts
**Type**: Feature
**Milestone**: M1 — Foundation
**What changed**:
- Installed `@clerk/nextjs@7.0.5` (Core 3 — async auth(), async clerkClient())
- `proxy.ts` at project root — `clerkMiddleware` with role-based routing:
  - Public routes: /, /discover, /creators/*, /agencies/*, /login/*, /signup/*, /api/v1/auth/complete
  - Agency routes: /dashboard, /deals, /roster, /brands, /briefs (inbox)
  - Creator routes: /creator/*, /profile
  - Brand routes: /briefs/new
  - Wrong role → redirected to their own home page (not /login)
  - Authenticated + no role → /signup/complete (mid-signup state guard)
- `app/layout.tsx` — wrapped with `<ClerkProvider>`
- `app/(public)/login/[[...rest]]/page.tsx` — Clerk `<SignIn />`
- `app/(public)/signup/agency/[[...rest]]/page.tsx` — `<SignUp forceRedirectUrl="/api/v1/auth/complete?role=agency" />`
- `app/(public)/signup/creator/[[...rest]]/page.tsx` — same, role=creator
- `app/(public)/signup/brand/[[...rest]]/page.tsx` — same, role=brand_manager
- `app/api/v1/auth/complete/route.ts` — sets `publicMetadata.role` via Clerk admin API, redirects to /signup/complete
- `app/(public)/signup/complete/page.tsx` — client component: calls `session.reload()` to force JWT refresh, then redirects to role home
- Skeleton layouts: `(agency)/layout.tsx`, `(creator)/layout.tsx`, `(brand)/layout.tsx` — sidebar nav + header + `<UserButton />`
- Placeholder pages: `/dashboard`, `/creator/deals`, `/briefs/new`
- `npm run typecheck` → zero errors ✅
**Critical pre-flight**: Clerk session token claim MUST be set in Clerk dashboard before testing:
  `Configure → Sessions → Customize session token → { "metadata": "{{user.public_metadata}}" }`
**Next**: M1 Task 4 — Deploy to Vercel, confirm end-to-end auth flow

---

## 2026-03-19 — M1 Task 2: Prisma schema + Neon migration
**Type**: Setup
**Milestone**: M1 — Foundation
**What changed**:
- Installed `prisma@^5` + `@prisma/client@^5` (Prisma 6 blocked on Node.js 20.11.1 — requires 20.19+; see decisions.md)
- Created `prisma/schema.prisma` with full schema: 6 models (Creator, Brand, Deal, ContentSubmission, Brief, PartnershipRequest), 6 enums (DealStage, ContractStatus, PaymentStatus, SubmissionStatus, BriefStatus, PartnershipStatus)
- `datasource db` uses `directUrl = env("DATABASE_URL_UNPOOLED")` for migrations
- Created `.env` (Prisma CLI reads this) + `.env.local` (Next.js runtime) — both gitignored via `.env*`
- Migration `20260319025118_init`: all 6 tables + enums created in Neon
- Migration `20260319025143_add_search_indexes`: `pg_trgm` extension + GIN indexes on Creator.name, Creator.handle, Creator.nicheTags, Creator.platforms
- `prisma migrate status` → "Database schema is up to date!" ✅
- Created `lib/db.ts` — Prisma singleton with hot-reload guard and dev-mode query logging
- `npm run typecheck` → zero errors ✅
**Next**: M1 Task 3 — Install Clerk, write proxy.ts, skeleton role layouts

---

## 2026-03-18 — M1 Task 1: Next.js scaffold + shadcn/ui init
**Type**: Setup
**Milestone**: M1 — Foundation
**What changed**:
- Scaffolded `brand-deal-manager/` via `create-next-app@16.2.0` (TypeScript strict, ESLint, Tailwind v4, App Router, `@/*` alias, Turbopack)
- Initialized shadcn/ui v4 (`npx shadcn@latest init -d`) — installed `components/ui/button.tsx`, `lib/utils.ts`, updated `globals.css`
- Geist Sans + Geist Mono already wired via `next/font/google`; verified literal font names in `@theme inline` (no circular `var(--font-*)` refs); font variables on `<html>`, not `<body>`
- Added `typecheck` script to `package.json` (`tsc --noEmit`)
- Set `turbopack.root: __dirname` in `next.config.ts` to silence workspace root detection warning
- Updated app metadata: title = "Brand Deal Manager"
- `npm run dev` → Ready in 1008ms on localhost:3000 ✅
- `npm run typecheck` → zero errors ✅
**Next**: M1 Task 2 — Prisma schema + Neon connection

---

## 2026-03-18 — Project scaffolding
**Type**: Setup
**Milestone**: Pre-M1
**What changed**:
- Created full project scaffolding: CLAUDE.md, .claude/agents/, .claude/commands/, .claude/memory/
- Defined 5 agent roles with file ownership boundaries
- Documented all architectural decisions in decisions.md
- Defined 8-milestone implementation plan (M1–M8, ~26–35 days total)
- No code written yet. All external services still to be provisioned.
**Next**: Provision external services (Vercel, Neon, Clerk, R2, Resend, Trigger.dev, Upstash), then begin M1.