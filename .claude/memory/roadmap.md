# Product roadmap — Brand Deal Manager
_Last updated: 2026-03-19_

---

## Milestone summary

| # | Name | Est. duration | Status |
|---|---|---|---|
| M1 | Foundation | 2–3 days | ✅ Complete |
| M2 | Agency Deal Pipeline | 5–7 days | ✅ Complete |
| M3 | Creator Portal + Content Approval | 3–4 days | 🔲 Not started |
| M4 | File Uploads | 3–4 days | 🔲 Not started |
| M5 | Discovery Layer | 4–5 days | 🔲 Not started |
| M6 | Brand Manager Layer | 3–4 days | 🔲 Not started |
| M7 | Email Notifications + Background Jobs | 3–4 days | 🔲 Not started |
| M8 | Polish + Launch Prep | 3–4 days | 🔲 Not started |
| **Total** | | **~26–35 days** | |

---

## Dependency graph

```
M1 (Foundation)
  └── M2 (Deal Pipeline)
        ├── M3 (Creator Portal)        ← depends on M2
        │     └── M4 (File Uploads)   ← depends on M3
        └── M5 (Discovery Layer)      ← depends on M2
              └── M6 (Brand Manager)  ← depends on M5

M7 (Notifications) ← depends on M3 + M5 + M6 (all event triggers must exist)
M8 (Polish)        ← depends on all milestones complete
```

---

## Pre-M3 — Regression fixes (2026-03-19)
- [🔄 PR Open] **PR #8** `fix/pre-m3-proxy-loop` — proxy.ts redirect loop guard for stale JWT
- [🔄 PR Open] **PR #9** `fix/pre-m3-landing-auth` — landing page, /signup role picker, branded auth layouts
- ⚠️ REQUIRED MANUAL STEP: Clerk dashboard → Configure → Sessions → Customize session token → add `{ "metadata": "{{user.public_metadata}}" }` → Save

---

## Pre-M1 — Completed refactors
- Completed pre-M2 refactor: app lifted to repo root (refactor/lift-to-root PR)

---

## M1 — Foundation ✅ COMPLETE (2026-03-19)
**Goal**: Project runs locally. Three roles can log in and land on the right page.
**Deliverable**: Three users (one per role) can sign up, log in, and see a blank dashboard appropriate to their role.

- [x] Scaffold Next.js 16 project (`npx create-next-app@latest`)
- [x] Install and configure shadcn/ui + Tailwind + Geist fonts
- [x] Set up Neon database + Prisma schema (full schema from tech stack doc)
- [x] Run initial migration, confirm all tables exist
- [x] Add pg_trgm extension and trigram indexes (Creator name, handle, nicheTags)
- [x] Install and configure Clerk (3 roles via publicMetadata)
- [x] `proxy.ts` — role-based redirects (agency → `/dashboard`, creator → `/creator/deals`, brand → `/briefs/new`)
- [x] Skeleton layout per role (sidebar nav, header, empty content area)
- [x] `/signup/agency`, `/signup/creator`, `/signup/brand` — each sets correct role in metadata
- [x] `/login` page
- [x] Deploy to Vercel, confirm auth flow works end-to-end
- [x] Playwright e2e tests — 15/15 green against https://project-alpha-rho.vercel.app

---

## M2 — Agency Deal Pipeline ✅ COMPLETE (2026-03-19)
**Goal**: Agency can create deals and move them through the full pipeline.
**Deliverable**: Agency can create deals, assign manually-entered creators, move through pipeline, track payment.

- [x] `/dashboard` — Kanban board with 8 stage columns — PR #6
- [x] Deal card component (title, brand, creator, deadline, value, overdue indicator) — PR #6
- [x] `/deals/new` — create deal form (Zod validation) — PR #5
- [x] Brand inline-creation from deal form — PR #5
- [x] `/deals/:id` — Deal detail (Section A: Brief, B: Contract, C: Content placeholder, D: Payment) — PR #5
- [x] Manual stage advancement (button-based) — PR #5
- [x] Stage validation (no backward movement except Reopen) — PR #3
- [x] Reopen action (one step back) — PR #3
- [x] Overdue indicator logic (past deadline + not Live/Closed) — PR #3 + #6
- [x] Kanban drag-and-drop with dnd-kit (replaces buttons) — PR #6
- [x] Dashboard filters: platform, creator, brand, overdue only — PR #6
- [x] `/brands` and `/brands/:id` pages — PR #4
- [x] `/roster` page (agency manually adds creators) — PR #4

---

## M3 — Creator Portal + Content Approval
**Goal**: Creator can see deals, submit content, receive feedback.
**Deliverable**: Full content approval loop works end-to-end.

- [ ] `/creator/deals` — list of assigned deals (scoped to logged-in creator)
- [ ] `/creator/deals/:id` — scoped deal detail (brief, contract status, payout, payment status)
- [ ] Content submission form (URL input only, no file upload yet)
- [ ] Submission auto-advances deal to PENDING_APPROVAL
- [ ] Agency Content Approval section goes live (Approve / Request Changes)
- [ ] Approve → auto-advances to LIVE, creator payout confirmed
- [ ] Request Changes → requires feedback text, creator can resubmit (round N+1)
- [ ] Submission history (all rounds, feedback visible to creator)
- [ ] Submission form hidden outside IN_PRODUCTION / PENDING_APPROVAL

---

## M4 — File Uploads
**Goal**: Real files attached. Contracts via Vercel Blob. Content via Cloudflare R2.
**Deliverable**: Contracts and content stored as real files, not URLs.

- [ ] Vercel Blob — contract upload in Section B (max 25MB)
- [ ] Cloudflare R2 bucket (project-alpha) + credentials configured
- [ ] `/api/v1/uploads/content` — returns signed R2 upload URL
- [ ] Client-side resumable upload to R2 via TUS (`tus-js-client`)
- [ ] Upload progress indicator on content submission form
- [ ] Content submission form: URL paste + file upload (both options)
- [ ] Avatar upload for creator profile (Vercel Blob, max 5MB) — prep for M5
- [ ] File size validation on all upload endpoints
- [ ] Rate limiting on all upload endpoints (Upstash)

---

## M5 — Discovery Layer
**Goal**: Creators buildable public profiles. Agencies can discover and recruit new creators.
**Deliverable**: Creators self-register and are discoverable. Agencies can recruit without phone calls.

- [ ] `/profile` — creator profile editor (all fields + avatar + visibility toggle)
- [ ] `/discover` — public creator directory (filters: platform, niche, follower range, engagement rate; free-text search)
- [ ] Creator card component (avatar, name, handle, platforms, top 3 niche tags, followers, engagement)
- [ ] Pagination (50 per page)
- [ ] `/creators/:handle` — public profile page
- [ ] Agency CTA: Send Partnership Request modal (optional message)
- [ ] PartnershipRequest flow: agency sends → creator notified → creator accepts/declines
- [ ] Creator accepts → added to agency roster
- [ ] Creator declines → request marked declined
- [ ] Roster shows pending requests in separate tab
- [ ] `/agencies` — simple public agency listing

---

## M6 — Brand Manager Layer
**Goal**: Brand managers can browse creators and submit briefs to agencies.
**Deliverable**: Brand managers submit briefs. Agencies receive and convert to deals in one click.

- [ ] Brand manager registration flow (`/signup/brand`) with company field
- [ ] Brand manager accesses `/discover` and `/creators/:handle` (browse + Submit Brief CTA)
- [ ] Submit Brief CTA on creator profile pre-fills niche + platform
- [ ] `/briefs/new` — full brief submission form (Zod validation)
- [ ] Agency selector dropdown
- [ ] Brief created with status NEW on submit
- [ ] `/briefs` — agency inbox (list with status badges + filters)
- [ ] `/briefs/:id` — detail + actions: Convert to Deal, Decline, Mark Reviewed
- [ ] Convert to Deal → pre-fills `/deals/new` with brief data
- [ ] Dashboard brief banner (count of NEW briefs, links to `/briefs`)

---

## M7 — Email Notifications + Background Jobs
**Goal**: All 11 email events fire reliably with retry. Deadline reminders run automatically.
**Deliverable**: Every key event sends an email. No email lost on transient failure.

> **Domain note**: MVP uses Resend shared sender (onboarding@resend.dev).
> Test recipients must be manually added as verified contacts in Resend dashboard
> before they can receive emails. Custom domain wired in post-MVP (see REQ-002).

- [ ] Trigger.dev local runner confirmed working (`npx trigger.dev@latest dev`)
- [ ] Resend API key confirmed, EMAIL_FROM=onboarding@resend.dev
- [ ] Add all test user emails as verified contacts in Resend dashboard before testing
- [ ] React Email base template (logo, footer, brand styling)
- [ ] 11 email templates:
  - [ ] DEAL_ASSIGNED → creator
  - [ ] CONTRACT_AVAILABLE → creator
  - [ ] CONTENT_SUBMITTED → agency
  - [ ] CHANGES_REQUESTED → creator
  - [ ] CONTENT_APPROVED → creator
  - [ ] PAYMENT_RECEIVED → creator
  - [ ] DEADLINE_WARNING → agency (48h cron)
  - [ ] PARTNERSHIP_REQUEST → creator
  - [ ] PARTNERSHIP_ACCEPTED → agency
  - [ ] PARTNERSHIP_DECLINED → agency
  - [ ] NEW_BRIEF → agency
- [ ] All email triggers wired to correct API actions
- [ ] Deadline reminder cron job (hourly, queries deals within 48h of deadline, not yet Live)
- [ ] End-to-end test all 11 email flows

---

## M8 — Polish + Launch Prep
**Goal**: Product feels complete. No rough edges. Ready for first real agency.
**Deliverable**: Stable, responsive, handles edge cases. Smoke tests pass.

- [ ] Empty states on all list views
- [ ] Loading skeletons on all data-fetching pages
- [ ] Error boundaries on all route groups
- [ ] Field-level form error messages (not just toasts)
- [ ] Mobile responsive audit on all pages
- [ ] Rate limiting on all sensitive /api/v1/ endpoints (Upstash)
- [ ] Postgres query performance audit (confirm all indexes in place)
- [ ] Neon GitHub integration (per-PR database branches in CI)
- [ ] Vercel preview URL confirmed on every PR
- [ ] Smoke test 1: agency creates deal → assigns creator → content submitted → approved → payment received
- [ ] Smoke test 2: brand manager submits brief → agency converts to deal
- [ ] Smoke test 3: creator self-registers → builds profile → agency sends partnership request → creator accepts → deal assigned

---

## Post-MVP — Iteration 2 (future)
- Contract generation from templates + e-signature
- In-app notification centre
- Basic reporting: deals closed, total commission, creator performance
- Agency public profile page
- Custom email domain (REQ-002) — verify domain in Resend, update EMAIL_FROM

## Post-MVP — Iteration 3 (future)
- Native mobile app (React Native / Expo) — API layer already supports this
- Push notifications
- OAuth login (Google) — Clerk already supports, just needs enabling
- Brand manager ↔ agency in-app messaging