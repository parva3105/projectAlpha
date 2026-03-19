# Decision log — Brand Deal Manager
_Append only. Never delete entries._

---

## 2026-03-18 — Framework: Next.js 16 App Router
**Decision**: Use Next.js 16 with App Router.
**Reason**: Multi-page routing needed, SSR for SEO on public creator directory (/discover, /creators/:handle), Server Components reduce client bundle, streaming support.
**Alternatives considered**: Remix (good but smaller ecosystem), SPA + separate API (overkill for MVP team size).

---

## 2026-03-18 — Database: Neon + Prisma
**Decision**: Neon serverless Postgres with Prisma ORM.
**Reason**: Neon's GitHub integration gives each PR its own database branch (isolated test state). Prisma gives type-safe queries. Both available in Vercel Marketplace for easy provisioning.
**Alternatives considered**: PlanetScale (MySQL — not Postgres), Supabase (more opinionated, less portable).

---

## 2026-03-18 — Auth: Clerk
**Decision**: Clerk for authentication with 3 roles via publicMetadata.
**Reason**: Handles email/password + future OAuth in one library. publicMetadata supports role-based routing cleanly. Vercel Marketplace. Faster than building auth from scratch for MVP.
**Role field**: `publicMetadata.role` = `'agency' | 'creator' | 'brand_manager'`

---

## 2026-03-18 — File storage: split Vercel Blob + Cloudflare R2
**Decision**: Vercel Blob for small files (avatars ≤5MB, contracts ≤25MB). Cloudflare R2 for content submissions (≤500MB).
**Reason**: R2 has zero egress cost and supports TUS resumable uploads — essential for large video content on mobile connections. Blob is simpler for small files with no resumability needed.

---

## 2026-03-18 — Email: async via Trigger.dev + Resend
**Decision**: Never send email synchronously from Route Handlers. All emails triggered via Trigger.dev background jobs with retry logic.
**Reason**: Synchronous email in an API handler blocks the response and loses the email on failure. Trigger.dev gives retry (maxAttempts: 3), observability, and cron scheduling for the deadline reminder job.

---

## 2026-03-18 — Stage auto-transitions (two stages are system-driven)
**Decision**: PENDING_APPROVAL and LIVE stages are set automatically by the system, not manually by the agency.
**Reason**: These transitions are tied to specific events (content submitted, content approved) and should be deterministic. Allowing manual advance to these stages would create inconsistent state.
**Rule**: All other stage transitions are manual agency actions. Forward skipping allowed. Backward only via Reopen (one step).

---

## 2026-03-18 — Creator payout: always calculated, never input
**Decision**: creatorPayout is stored on the Deal record but always derived from dealValue × (1 − commissionPct). It is never accepted as user input.
**Reason**: Prevents data inconsistency. The commission percentage is the source of truth. Storing the calculated value is a convenience for queries.

---

## 2026-03-19 — Role routing: redirect wrong-role to their home, not /login
**Decision**: When an authenticated user accesses a route for the wrong role, redirect them to their own role's home page (e.g. agency visiting /creator/deals → /dashboard), not to /login.
**Reason**: Less confusing UX. The user is logged in — logging them out to /login is disorienting. Sending them "home" makes it clear they landed in the wrong area.
**Exception**: Unauthenticated users always go to /login.

---

## 2026-03-19 — Sign-up role assignment via session.reload()
**Decision**: After sign-up, set publicMetadata.role via API route, then redirect to /signup/complete where client calls `session.reload()` to force JWT refresh before routing to role home.
**Reason**: Clerk JWT TTL is short (~60s) but not zero. The role claim may not be in the current JWT immediately after `updateUserMetadata`. `session.reload()` is the Clerk-idiomatic way to force a fresh token, avoiding a visible re-login step.

---

## 2026-03-19 — Prisma version: 5.x not 6.x
**Decision**: Use Prisma 5.22.0 instead of Prisma 6.x.
**Reason**: Node.js v20.11.1 is installed on the dev machine. Prisma 6 requires Node.js 20.19+, 22.12+, or 24+. Prisma 5 is production-stable, fully featured, and supports Node.js 20.x without issue.
**When to revisit**: When Node.js is upgraded to 22 LTS or higher, migrate to Prisma 6 via `npx @prisma/migrate upgrade`.

---

## 2026-03-18 — API versioning: /api/v1/
**Decision**: All Route Handlers live at /api/v1/. Web app uses Server Actions that call these endpoints internally. Future mobile app (React Native / Expo) calls the same endpoints.
**Reason**: Avoids an API rewrite when the mobile app is built. Versioning from day one costs nothing and prevents painful migrations.

---

## 2026-03-18 — Repo layout: lift app to root
**Decision**: Moved brand-deal-manager/ to repo root instead of fixing working-directory in all workflows.
**WHY**: Single-app repos belong at root. Subdirectory layout required working-directory hacks in every workflow step, Vercel root directory config, and confused the project structure map. Root layout is the Vercel standard and eliminates all of these issues.

---

## 2026-03-18 — CI/CD workflow strategy (Option C)
**Decision**: Deleted staging.yml. CI/CD is now: ci.yml (PR quality gate) + prod.yml (push to main -> Vercel --prod + Prisma migrate).
**WHY**: Vercel provides preview deployment URLs natively for every PR and branch push. A separate staging workflow is redundant for this single-app setup and adds maintenance overhead without benefit.

---

## 2026-03-19 — Vercel CLI as deployment strategy for M1
**Decision**: Use `vercel deploy --prod` via CLI for immediate production deploys when env vars change; rely on `prod.yml` CI/CD for all subsequent milestone merges.
**Reason**: `NEXT_PUBLIC_*` vars are baked at build time. When env vars are added to Vercel after the last deploy, a fresh build is required to bake them in. `vercel deploy --prod` is the fastest path for a one-off refresh without waiting for a CI/CD merge.
**Going forward**: Once all env vars are stable, `prod.yml` (triggered on merge to master) handles all production deploys — no manual `vercel deploy` needed.

---

## 2026-03-19 — e2e test scope (M1): page availability + redirect, not Clerk automation
**Decision**: M1 e2e tests cover page availability (HTTP status not 500) and unauthenticated redirect behaviour only. Full Clerk sign-up automation (email verification codes) is deferred to M8 with Clerk test mode.
**Reason**: Email verification codes from Clerk cannot be intercepted in a standard Playwright test. Testing the rendered `<SignUp>` widget in detail requires Clerk's test mode (E2E testing mode), which is scoped to M8 when the full smoke test suite is built.

---

## 2026-03-19 — Auth guard pattern: result object, not exceptions
**Decision**: `requireAgencyAuth()` returns `{ ok: boolean, userId?, error? }` rather than throwing an exception or returning a NextResponse directly.
**Reason**: Route handlers call this at the top and can branch cleanly. Throwing from a helper makes error handling less explicit. Returning a NextResponse from the helper would couple the helper to HTTP, making it untestable.

---

## 2026-03-19 — Deal model has no platform field; platform lives on Creator and Brief
**Decision**: `platform` is not stored on Deal. It is on `Creator.platforms[]` (array) and `Brief.platform` (string). Removed `platform` from `CreateDealSchema` and `UpdateDealSchema` after inspecting the Prisma schema.
**Reason**: Schema is the source of truth. Adding a field to the schema that doesn't exist in the DB would cause runtime Prisma errors.

---

## 2026-03-19 — Brand model has no notes field
**Decision**: `notes` omitted from `CreateBrandSchema`. The Brand model only has `id`, `name`, `website`, `logoUrl`.
**Reason**: Schema is the source of truth.

---

## 2026-03-19 — Creator.email field does not exist in MVP schema
**Decision**: `AddCreatorToRosterSchema` accepts `email` for validation/future-proofing, but it is not persisted. Creator model has no email field. Logged as REQ-M2-001.
**Reason**: Schema is the source of truth. Adding an email field to the model is a database agent concern — deferred to a future migration.

---

## 2026-03-19 — Roster creator placeholder clerkId uses crypto.randomUUID()
**Decision**: Manually-added creators (no Clerk account) get `clerkId = "roster_" + crypto.randomUUID()`. No external cuid library is needed.
**Reason**: `crypto.randomUUID()` is available in Node 16+ and all Next.js runtimes (edge and Node). Avoids adding a dependency for a simple ID generation case.

---

## 2026-03-19 — Vitest version pinned to ^1.6.1 (not v4)
**Decision**: Use `vitest@^1.6.1` instead of the latest v4.x.
**Reason**: Vitest v4 uses rolldown which requires `node:util.styleText` — only available in Node 20.16+. The dev machine runs Node 20.11.1. Vitest v1 is stable and fully compatible.

---

## 2026-03-19 — Proxy loop guard for stale JWT
**Decision**: Redirect to /signup/complete is skipped when the current request path is already /signup/complete.
**Reason**: JWT staleness (role claim missing from token) is handled client-side by session.reload() in the /signup/complete page component. Redirecting again from proxy would cause a visible loop. Keeps proxy.ts free of external API calls.

---

## 2026-03-18 — Out of scope for MVP (locked decisions)
The following were evaluated and explicitly excluded from MVP. Do not reopen without a new decision entry:
- Smart creator matching / recommendation engine
- Contract generation and e-signature
- In-app notification centre
- Analytics / reporting dashboard
- Multi-agency support
- Native mobile app
- Social platform API sync for follower/engagement data
- Brand manager ↔ creator direct messaging
---

## 2026-03-19 — Server-side fetch pattern for RSC pages
**Decision**: Agency RSC pages that need authenticated data use server-side `fetch()` with the request's cookie header forwarded, rather than calling Prisma directly from the page.
**Reason**: Keeps pages consistent with the `{ data, error }` API contract; makes the same API callable from mobile clients in the future; avoids importing Prisma in page files (which are in the frontend agent's domain). Host is inferred from the `host` request header; protocol is derived from whether the host is localhost.
**Alternatives considered**: Direct Prisma calls in RSC (simpler but couples pages to DB); import server actions (good alternative, deferred to M3 when we have a mutations layer).

---

## 2026-03-19 — jsdom version pinned to v24 for Node 20.11.1 compatibility
**Decision**: Downgraded jsdom from v29 (installed by default) to v24 in devDependencies.
**Reason**: jsdom v29 requires Node >=20.19.0; the project runs on Node 20.11.1. v24 is compatible and supports all required testing features.
**Alternatives considered**: Upgrade Node (blocked — system constraint); skip component tests in jsdom (violates TDD mandate).
