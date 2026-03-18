# CLAUDE.md — Brand Deal Manager

## Product overview
Brand Deal Manager is a web application for talent agencies managing influencer brand deals. It provides a Kanban deal pipeline, creator roster management, a public creator discovery directory, a brief submission channel for brand managers, and a creator portal for submitting content and tracking payments. The product eliminates administrative overhead — spreadsheets, email threads, manual commission tracking — without replacing agency judgment.

**Three user roles**: Agency Account Manager (primary), Creator / Influencer (secondary), Brand Manager (tertiary).

---

## Tech stack
- **Framework**: Next.js 16 (App Router) — deployed on Vercel
- **UI**: shadcn/ui + Tailwind CSS + Geist Sans/Mono fonts
- **Database**: Neon (Postgres 16) via Prisma ORM
- **Auth**: Clerk (3 roles via public metadata: `agency` | `creator` | `brand_manager`)
- **File storage (small)**: Vercel Blob — avatars (≤5MB), contracts (≤25MB)
- **File storage (large)**: Cloudflare R2 — content submissions (≤500MB), resumable TUS uploads
- **Email**: Resend + React Email templates
- **Job queue**: Trigger.dev — email retry, hourly deadline reminder cron
- **Validation**: Zod on all API inputs
- **Drag and drop**: dnd-kit (Kanban board)
- **Rate limiting**: Upstash Rate Limit on auth and upload endpoints
- **API**: Versioned REST at `/api/v1/...` — callable from web and future mobile app

---

## Project structure
/
├── app/
│   ├── (public)/           # SSR public routes — /discover, /creators/:handle, /agencies, /login, /signup
│   ├── (agency)/           # Auth-protected agency routes — /dashboard, /deals, /roster, /briefs, /brands
│   ├── (creator)/          # Auth-protected creator routes — /creator/deals, /profile
│   ├── (brand)/            # Auth-protected brand manager routes — /briefs/new
│   └── api/v1/             # Versioned Route Handlers
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── kanban/             # Kanban board (use client)
│   ├── creator/            # Creator profile, directory card
│   ├── deals/              # Deal card, detail sections A-D
│   └── forms/              # Reusable form components
├── lib/
│   ├── db.ts               # Prisma client singleton
│   ├── auth.ts             # Clerk helpers
│   ├── validations/        # Zod schemas
│   └── utils.ts
├── jobs/                   # Trigger.dev job definitions
│   ├── send-email.ts
│   └── deadline-reminders.ts
├── emails/                 # React Email templates (11 total)
├── prisma/
│   └── schema.prisma
├── proxy.ts                # Clerk middleware — auth + role routing
└── docs/
├── STAGING.md
└── API.md

---

## Agent roles and file ownership

| Agent | Owns | Never touches |
|---|---|---|
| **Orchestrator** | `.claude/memory/*`, PR creation, log updates | Product code |
| **Backend agent** | `app/api/v1/**`, `lib/**`, `jobs/**`, `emails/**` | `app/(public)`, `app/(agency)`, `app/(creator)`, `app/(brand)`, `components/**` |
| **Frontend agent** | `app/(public)/**`, `app/(agency)/**`, `app/(creator)/**`, `app/(brand)/**`, `components/**` | `app/api/v1/**`, `jobs/**`, `prisma/**` |
| **Database agent** | `prisma/schema.prisma`, `prisma/migrations/**` | All app code |
| **DevOps agent** | `infra/**`, `.github/workflows/**`, `proxy.ts`, `.env.example` | All app code |

---

## Mandatory log protocol (every agent, every task)

Before marking any task complete, the active agent MUST:
1. Append to `.claude/memory/iterations.md` — what changed, date, and why
2. Append to `.claude/memory/decisions.md` — if any architectural or technology decision was made
3. Append to `.claude/memory/requests.md` — if any new requirement or edge case was discovered

No PR may be opened until all three have been checked.

---

## Git rules
- Branch naming: `feat/*`, `fix/*`, `chore/*`, `refactor/*`
- One task = one branch (use git worktrees for parallel agent work)
- Never push directly to `main`
- All PRs created via `/ship` command
- Commit messages follow Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`
- PR title must reference the milestone: e.g. `feat(M2): add kanban drag-and-drop`

---

## Testing rules
- Write tests before implementation (TDD)
- Backend: `pytest` for all API route handlers and business logic
- Frontend: `vitest` for components, `playwright` for critical user flows
- No PR opened unless `npm run test` passes locally
- Three smoke tests must pass on every PR targeting `main` (see `.claude/memory/roadmap.md` M8)

---

## Code standards
- TypeScript strict mode — no `any`, no `as unknown`
- All API routes return `{ data, error }` — consistent shape
- All API inputs validated with Zod schemas in `lib/validations/`
- Default to Server Components — only add `'use client'` for interactivity
- All new API endpoints documented in `docs/API.md`
- All monetary values in USD cents (Decimal, stored via Prisma `@db.Decimal(10,2)`)
- Creator payout is always calculated: `dealValue × (1 − commissionPct)` — never manually entered

---

## Deal pipeline — stage rules (critical)
| Stage | Trigger | Direction |
|---|---|---|
| Brief Received | Deal created, no creator | System |
| Creator Assigned | Agency sets `creatorId` | Manual forward |
| Contract Sent | Agency sets `contractStatus → Sent` | Manual forward |
| In Production | Agency sets `contractStatus → Signed` | Manual forward |
| Pending Approval | Creator submits ContentSubmission | **Auto (system)** |
| Live | Agency approves ContentSubmission | **Auto (system)** |
| Payment Pending | Agency manual advance | Manual forward |
| Closed | Agency sets `paymentStatus → Received` | Manual forward |

Forward skipping allowed. Backward only via explicit Reopen action (one step at a time).

---

## Context loading (start of every session)
Before beginning any work, read in this order:
1. `.claude/memory/memory.md` — current project state
2. `.claude/memory/roadmap.md` — active milestone and next tasks
3. `.claude/memory/requests.md` — top-priority open items
4. `.claude/memory/decisions.md` — recent decisions that affect your work

If deploying to staging, also read: `docs/STAGING.md`

---

## What is explicitly out of scope (MVP)
Do not build, suggest, or scope any of the following:
- Smart creator matching / recommendation engine
- Contract generation or e-signature
- In-app notification centre (email only in MVP)
- Analytics or reporting dashboard
- Multi-agency support
- Native mobile app
- Social platform API sync
- Brand manager ↔ creator direct messaging