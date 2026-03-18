# Project memory — Brand Deal Manager
_Last updated: 2026-03-18_

## Current state
- Status: Pre-development. Scaffolding phase.
- Active milestone: M1 — Foundation (not yet started)
- Vercel project: not yet created
- Neon database: not yet provisioned
- Clerk app: not yet created
- GitHub repo: not yet created

## Stack confirmed
- Next.js 16 App Router + TypeScript strict
- shadcn/ui + Tailwind CSS + Geist fonts
- Neon Postgres + Prisma ORM
- Clerk (3 roles: agency / creator / brand_manager)
- Vercel Blob (avatars ≤5MB, contracts ≤25MB)
- Cloudflare R2 (content submissions ≤500MB, TUS resumable)
- Resend + React Email (11 email templates)
- Trigger.dev (email jobs + hourly deadline cron)
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

## External services to provision before M1
- [ ] Vercel account + project
- [ ] Neon account + project (enable GitHub integration for PR branches)
- [ ] Clerk account + app (3 roles via publicMetadata)
- [ ] Cloudflare R2 bucket
- [ ] Resend account + verified sending domain
- [ ] Trigger.dev project
- [ ] Upstash Redis database
- [ ] GitHub repo created

## Update this file when
- A milestone is completed
- A new external service is provisioned
- A key product decision changes what we're building