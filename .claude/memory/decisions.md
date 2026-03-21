# Decision log — Brand Deal Manager
_Append only. Never delete entries._

---

## 2026-03-21 — revamp/phase-3: Superadmin role design
**Decision**: Added `superadmin` as a 4th valid role in Clerk `publicMetadata`. Superadmin bypasses all `proxy.ts` role-based routing. `requireAgencyAuth()` / `requireCreatorAuth()` / `requireBrandAuth()` return fixed test IDs (`test_agency_001` etc.) instead of `forbidden()` when role is `superadmin`. Perspective cookie (`active_perspective`) controls which portal UI renders and which home route `RoleSwitcher` navigates to. `RoleSwitcher` renders `null` for non-superadmin users — invisible to real users.
**Reason**: Single dev/QA account for testing all 3 role perspectives without logging in/out. Never visible to real agency/creator/brand users.

## 2026-03-21 — revamp/phase-3: lib/auth.ts replaces lib/auth-helpers.ts
**Decision**: `auth-helpers.ts` (hardcoded test IDs) deleted. `lib/auth.ts` is the canonical auth module for all API routes. All routes use the `requireXAuth()` pattern: returns `{ ok: true, userId }` or `{ ok: false, response }`. Caller returns `authResult.response` immediately on failure.
**Reason**: Phase 2 deliberately deferred real auth; Phase 3 activates it. The pattern is consistent and type-safe — no exceptions thrown, no Response thrown, just a discriminated union.

## 2026-03-21 — revamp/phase-3: Email sends are always async via Trigger.dev
**Decision**: Never `await` email sends in API route hot paths. Always use `void sendEmailJob.trigger(...)` (fire-and-forget). Creator email recipient uses `${creatorClerkId}@placeholder.dev` for MVP (Creator model has no `email` field per REQ-M2-001).
**Reason**: Email delivery latency must not block API responses. Placeholder email is acceptable for MVP since Resend will bounce silently; real email lookup via Clerk API is a post-MVP improvement.

---

## 2026-03-20 — revamp/phase-2: Hardcoded auth IDs (no Clerk)
**Decision**: Phase 2 uses hardcoded `test_agency_001`, `test_brand_001`, `test_creator_001` ClerkIDs in `lib/auth-helpers.ts`. No Clerk imports anywhere in Phase 2 code.
**Reason**: Eliminates auth service dependency during backend integration sprint; allows full API + DB testing without live Clerk session. All functions are tagged `// TODO(phase3): replace with real Clerk auth()`.
**Alternatives considered**: Mock Clerk session (rejected — more complex, still blocks headless testing).

---

## 2026-03-20 — revamp/phase-2: Monetary convention (cents stored, dollars returned)
**Decision**: DB stores all monetary values as `Decimal(10,2)` in cents (e.g., $35 → `3500`). API responses divide by 100 before returning (dollars). `creatorPayout` is always server-computed: `Math.round(dealValueCents * (1 - commissionPct/100))`.
**Reason**: Standard financial precision practice; existing frontend components expect dollar values (e.g., `deal.dealValue.toLocaleString()`); no frontend display changes needed.
**Alternatives considered**: Store and return cents everywhere (rejected — requires frontend display changes).

---

## 2026-03-20 — revamp/phase-2: Brief→Deal conversion placeholder brand
**Decision**: `PATCH /briefs/[id]` with `status: CONVERTED` creates a Deal with a placeholder "Unassigned" brand if no `brandId` is present on the brief. Agency is expected to update `brandId` after conversion.
**Reason**: DB `Deal.brandId` is a required FK. Brief has no `brandId` field. Placeholder avoids blocking the conversion workflow.
**Alternatives considered**: Make `Deal.brandId` nullable (rejected — too many downstream changes to schema + components).

---

## 2026-03-20 — revamp/phase-1: Mock data over real API calls
**Decision**: Phase 1 uses static mock data in `lib/mock/` with no API calls, no Clerk, no Prisma.
**Reason**: Allows rapid UI iteration without backend service dependencies; all values use dollars (not cents) for Phase 1 display simplicity; Prisma enums replaced with string literals throughout client code.
**Alternatives considered**: Keeping live API calls (rejected — Phase 1 is a clean-slate revamp, not patching M2 code).

---

## 2026-03-20 — revamp/phase-1: geist npm package over next/font/google
**Decision**: Import Geist fonts via `geist/font/sans` and `geist/font/mono` (npm package), not `next/font/google`.
**Reason**: The `geist` package self-hosts fonts (no external requests), ships correct variable declarations (`--font-geist-sans`, `--font-geist-mono`), and is the Vercel-recommended pattern per official docs.
**Alternatives considered**: `next/font/google` (archive pattern) — still valid but requires network during build; self-hosting preferred.

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

## 2026-03-19 — jsdom version pinned to v24 for Node 20.11.1 compatibility ⚠️ SUPERSEDED
## 2026-03-19 — Landing page auth redirect (server-side)
**Decision**: auth() + redirect() in the Server Component at app/page.tsx.
**Reason**: Keeps proxy.ts free of per-page logic. Server Component redirect is instant — no client-side flash.

---

## 2026-03-19 — /signup hash detection for SSO compatibility
**Decision**: Lazy useState initializer reads window.location.hash on mount to detect Clerk SSO multi-step flows.
**Reason**: Clerk SSO multi-step (Google, phone verification) appends a hash fragment (#/continue, #/factor-one). Detecting the hash on the same /signup route preserves SSO compatibility without adding a new route. Role picker shown on direct visit (no hash). Lazy initializer pattern avoids useEffect and satisfies react-hooks/set-state-in-effect lint rule.

---

## 2026-03-19 — Button asChild not available in @base-ui/react/button
**Decision**: Use Link + buttonVariants() for anchor-styled buttons instead of Button asChild.
**Reason**: The project's shadcn/ui button.tsx uses @base-ui/react/button which does not expose an asChild prop. Radix-style asChild is not available. Resolved by applying buttonVariants() class to next/link directly.

---

## 2026-03-19 — jsdom version pinned to v24 for Node 20.11.1 compatibility
**Decision**: Downgraded jsdom from v29 (installed by default) to v24 in devDependencies.
**Reason**: jsdom v29 requires Node >=20.19.0; the project runs on Node 20.11.1. v24 is compatible and supports all required testing features.
**Alternatives considered**: Upgrade Node (blocked — system constraint); skip component tests in jsdom (violates TDD mandate).
**SUPERSEDED BY**: "happy-dom for all vitest environments" decision below — jsdom was later abandoned entirely in favour of happy-dom due to a transitive ESM conflict.

---

## 2026-03-19 — happy-dom for all vitest environments
**Decision**: All vitest `environmentMatchGlobs` entries use `"happy-dom"` instead of `"jsdom"`.
**Reason**: `jsdom@29` (installed as transitive dep despite the v24 pin) pulls in `html-encoding-sniffer@6` which does a synchronous `require()` of `@exodus/bytes` (pure-ESM only). This crashes the jsdom environment with an unhandled error that exits vitest with code 1 even when all tests pass — failing CI. `happy-dom` (already installed) has no such transitive dependency and is fully compatible with all existing tests.
**Effect**: Both `components/__tests__/**/*.test.tsx` and `app/**/*.test.tsx` use `happy-dom`. 100/100 tests pass, zero unhandled errors.

---

## 2026-03-19 — Proxy loop guard for stale JWT
**Decision**: In `proxy.ts`, before redirecting to `/signup/complete` when `role` is missing, check `req.nextUrl.pathname === "/signup/complete"` and return early if true.
**Reason**: When the Clerk session token claim (`{{ user.public_metadata }}`) is not configured in the Clerk dashboard, or when a JWT was issued before a role was assigned, `sessionClaims.metadata.role` is undefined. Without the guard, the proxy redirects to `/signup/complete` even when the user is already there — causing a visible redirect loop. The `/signup/complete` page handles staleness client-side via `session.reload()`.
**Constraint**: Never call external APIs from `proxy.ts` (it is Next.js middleware running on the edge). The guard is a pure pathname check with no I/O.

---

## 2026-03-19 — Landing page auth redirect (server-side)
**Decision**: Authenticated user redirect on `/` handled via `auth()` + `redirect()` inside the Server Component (`app/page.tsx`), not in `proxy.ts`.
**Reason**: Keeps proxy.ts free of per-page redirect logic. Server Component redirect is synchronous and instant — no client-side flash. Role read from `(sessionClaims?.metadata as { role?: string })?.role`.

---

## 2026-03-19 — /signup hash detection for Clerk SSO compatibility
**Decision**: `/signup/page.tsx` reads `window.location.hash` on mount to decide between showing the role picker (direct visit) or `<SignUp>` (Clerk SSO multi-step flow).
**Reason**: Clerk SSO flows (Google, phone verification) redirect back to `/signup` with a hash fragment (`#/continue`, `#/factor-one`). Detecting the hash on one route preserves SSO compatibility without adding a new route. Direct visits (no hash) show the pre-auth role picker.

---

## 2026-03-19 — Button asChild not available; use Link + buttonVariants()
**Decision**: For anchor-styled buttons (links that look like buttons), use `Link` from `next/link` with `buttonVariants()` class applied directly — not `<Button asChild>`.
**Reason**: The project's `components/ui/button.tsx` wraps `@base-ui/react/button`, which does not expose a Radix-style `asChild` prop. Applying `buttonVariants()` to a `Link` achieves the same visual result without the prop.

---

## 2026-03-20 — Phase 1 architectural decisions

### RoleSwitcher context architecture
Decision: RoleProvider wraps entire app in root layout. Sidebar accepts `role: Role` prop from each layout file (hardcoded per route group). RoleSwitcher reads/writes localStorage key "devRole" and calls router.push() to the role's home route on switch.
Why: Separates layout concerns (each route group knows its role) from the dev tool concern (RoleSwitcher just updates localStorage + redirects).

### Mock data uses dollars, not cents
Decision: Phase 1 mock data stores dealValue, creatorPayout as plain dollar numbers (not cents). Display format: $X,XXX or $X,XXX.XX.
Why: Simpler for UI-only phase. Phase 2 will switch to cents-as-integers matching Prisma schema.

### Archive component adaptation
Decision: Kanban, deal form, stage-control components ported from _archive/ with API calls removed. State management moved from server-sync to pure useState.
Why: Prevents rewriting working drag-and-drop logic. The adapation is minimal (remove fetch, add toast + state update).

### @base-ui/react vs Radix shadcn differences
Decision: This project's shadcn install uses @base-ui/react under the hood, not Radix. This means:
- `asChild` prop is not supported — use `render={<Component />}` pattern instead
- Select.onValueChange receives `string | null`, not `string`
Why: Found during P1-2/P1-3 implementation. All interactive components updated accordingly.

### Zod v4 form validation
Decision: For forms with number inputs, use plain react-hook-form register() instead of zod coerce.number() to avoid type mismatch with @hookform/resolvers in Zod v4.
Why: z.coerce.number() resolver type inference changed in Zod v4, causing TypeScript errors.

## 2026-03-21 — Creator placeholder email for all email triggers
**Decision**: All email sends to a creator use `${creatorClerkId}@placeholder.dev` as the recipient address. All email sends to an agency use `${agencyClerkId}@placeholder.dev`.
**Reason**: The Creator and Agency models have no `email` field in the MVP schema. Placeholder addresses ensure the trigger.dev job fires and can be tested end-to-end without a real email column. Real addresses require a schema migration (database agent concern).
**When to revisit**: Add `Creator.email` and `Agency.email` fields in a future migration, then update all `@placeholder.dev` references in route handlers.

---

## 2026-03-21 — partnerships/[id]/route.ts: creator auth, not agency auth
**Decision**: `PATCH /partnerships/[id]` uses `requireCreatorAuth()`. The creator looks up their own `Creator` record by `clerkId`, then verifies the partnership request belongs to them via `{ id, creatorId: creator.id }`.
**Reason**: Partnership accept/decline is a creator action, not an agency action. The original phase-2 stub used `agencyClerkId` to scope the lookup (incorrect — agencies create requests, creators respond to them). Corrected in phase-3 migration.
**Alternatives considered**: Keeping agency auth and adding a separate creator endpoint (rejected — unnecessary duplication; PATCH on the same resource by the responding party is RESTful).

---
