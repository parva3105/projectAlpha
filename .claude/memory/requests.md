# Request log — Brand Deal Manager
_Backlog of features, fixes, and open questions. Append new items. Mark resolved items with [DONE] + PR reference._

---

## Open — Pre-M1

### REQ-001: Provision all external services
**Type**: Setup
**Priority**: P0 — blocks M1
**What**: Create accounts and projects for Vercel, Neon, Clerk, Cloudflare R2, Resend, Trigger.dev, Upstash Redis, GitHub
**Notes**: See `.claude/memory/memory.md` checklist. All env vars go in `.env.local` (copied from `.env.example`).

### REQ-002: Confirm sending domain for Resend
**Type**: Setup
**Priority**: P0 — blocks M7
**What**: Verify a sending domain in Resend dashboard. Email sent from `noreply@[domain]`. Domain choice TBD.

### REQ-003: Neon GitHub integration
**Type**: Setup
**Priority**: P1 — needed for M8 CI
**What**: Install Neon GitHub app to enable per-PR database branches. Required for isolated CI testing in M8.

---

## Open — Post-MVP (future iterations)

### REQ-F01: Contract generation from templates
**Type**: Feature — Iteration 2
**What**: Generate contract PDF from deal fields, send for e-signature.

### REQ-F02: In-app notification centre
**Type**: Feature — Iteration 2
**What**: Bell icon with unread count. Currently email-only.

### REQ-F03: Basic reporting dashboard
**Type**: Feature — Iteration 2
**What**: Agency: deals closed, total commission, creator performance summary.

### REQ-F04: Agency public profile page
**Type**: Feature — Iteration 2
**What**: /agencies/:id showing bio, creator count, active deals.

### REQ-F05: OAuth login (Google)
**Type**: Feature — Iteration 3
**What**: Clerk already supports this — just needs enabling + testing.

### REQ-F06: Native mobile app (React Native / Expo)
**Type**: Feature — Iteration 3
**What**: API layer (/api/v1/) already designed to support this. Clerk has React Native SDK.