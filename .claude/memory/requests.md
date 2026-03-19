# Request log — Brand Deal Manager
_Backlog of features, fixes, and open questions. Append new items. Mark resolved items with [DONE] + PR reference._

---

## Open — Pre-M1

### REQ-001: Install Neon GitHub integration
**Type**: Setup
**Priority**: P1 — needed for M8 CI
**What**: Install Neon GitHub app to enable per-PR database branches. Required for isolated CI testing in M8.
**How**: Neon dashboard → Integrations → GitHub → Install → select brand-deal-manager repo.

---

## Open — Post-MVP

### REQ-002: Custom sending domain for email
**Type**: Setup
**Priority**: P2 — not blocking MVP
**What**: Verify a custom domain in Resend so emails send from noreply@yourdomain.com
instead of onboarding@resend.dev. Requires purchasing a domain first.
**Current workaround**: Using Resend shared sender (onboarding@resend.dev). Any real user
who needs to receive emails must be manually added as a verified contact in the
Resend dashboard before they can receive anything.
**How to add a test recipient**: Resend dashboard → Contacts → Verified emails → Add email.
They receive a one-click verification link.
**When to do**: After MVP acceptance, before first paying customer onboarded at scale.

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