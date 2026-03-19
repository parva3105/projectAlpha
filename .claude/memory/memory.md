# Project memory — Brand Deal Manager
_Last updated: 2026-03-19_

## Current state
- Status: Pre-development. All external services provisioned. Ready to begin M1.
- Active milestone: M1 — Foundation (not yet started)
- Next.js app at repo root (lifted from brand-deal-manager/ subdirectory via refactor/lift-to-root PR)
- Vercel project: https://project-alpha-rho.vercel.app
- NOTE: Vercel Root Directory must be set to blank (repo root) in dashboard — was previously 'brand-deal-manager'
- GitHub repo: created
- Neon database: provisioned
- Clerk app: created
- GitHub repo: created

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