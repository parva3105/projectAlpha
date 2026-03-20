# Request log — Brand Deal Manager
_Backlog of features, fixes, and open questions. Append new items. Mark resolved items with [DONE] + PR reference._

---

## Open — M2 (discovered during M2 backend implementation)

### REQ-M2-001: Creator model has no email field
**Type**: Gap / Future Enhancement
**Priority**: P2
**What**: `AddCreatorToRosterSchema` accepts `email` for completeness but cannot persist it — the `Creator` model in `prisma/schema.prisma` has no `email` column. If email is needed for manually-rostered creators, a migration must add `Creator.email String?`.
**Status**: Open — database agent to action in a future milestone if needed.

---

### REQ-M2-002: Brands are global (not agency-scoped) — may need scoping
**Type**: Design decision to revisit
**Priority**: P2
**What**: `GET /api/v1/brands` returns all brands regardless of which agency created them. This is consistent with the current schema (Brand has no `agencyClerkId`). If multi-agency support is ever added, brands would need to be agency-scoped.
**Status**: Acceptable for MVP (single-agency); log here to revisit if multi-agency lands.

---

## Open — M2

### REQ-003: Set Clerk session token claim before first sign-up
**Type**: Setup
**Priority**: P0 — blocks role routing if missing
**What**: In Clerk dashboard → Configure → Sessions → Customize session token → add:
  `{ "metadata": "{{user.public_metadata}}" }`
Without this, `proxy.ts` cannot read `sessionClaims.metadata.role` → all authenticated users land in a redirect loop to /signup/complete.
**Status**: Must be done before testing M2 (first real sign-up with role assignment).

---

## No new requests from fix/pre-m3-proxy-loop iteration.

---

## Open — M8 prerequisite

### REQ-001: Install Neon GitHub integration
**Type**: Setup
**Priority**: P1 — needed for M8 CI
**What**: Install Neon GitHub app to enable per-PR database branches. Required for isolated CI testing in M8.
**How**: Neon dashboard → Integrations → GitHub → Install → select brand-deal-manager repo.
**Note**: Not blocking M2–M7. Do before starting M8.

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
---

## Open — M2 (discovered during M2 Frontend C)

### REQ-M2-003: Brands list page lacks open deal count and total deal value
**Type**: Enhancement
**Priority**: P3
**What**: `GET /api/v1/brands` returns brands without deal aggregates. The BrandsTable renders openDealCount and totalDealValue as 0 for all rows. To show real aggregates, the API would need to include deal counts/sums per brand (or the frontend would need N+1 fetches per brand). The brand detail page (via GET /api/v1/brands/:id) includes full deals[].
**Status**: Acceptable for MVP. Backend agent to add aggregate fields to GET /api/v1/brands in a future iteration.

---

## No new requests from fix/pre-m3-landing-auth iteration.
