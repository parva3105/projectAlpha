# Project memory — Brand Deal Manager
_Last updated: 2026-03-19_

## Current state
- Status: **M1 COMPLETE ✅** — Ready to begin M2
- Active milestone: M2 — Agency Deal Pipeline
- Production URL: https://project-alpha-rho.vercel.app (deployed, all env vars baked in)
- Vercel Root Directory: blank (repo root) — confirmed correct
- Vercel CLI installed (`vercel` v50.33.1), project linked to parva3105s-projects/project-alpha
- GitHub repo: https://github.com/parva3105/projectAlpha
- Branch `feat/m1-e2e-tests` open — contains Playwright e2e suite (15/15 pass), CI fixes
- All env vars confirmed in Vercel production (21 vars)

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