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

## 2026-03-18 — API versioning: /api/v1/
**Decision**: All Route Handlers live at /api/v1/. Web app uses Server Actions that call these endpoints internally. Future mobile app (React Native / Expo) calls the same endpoints.
**Reason**: Avoids an API rewrite when the mobile app is built. Versioning from day one costs nothing and prevents painful migrations.

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