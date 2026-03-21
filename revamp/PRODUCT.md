# Product Specification — Brand Deal Manager

## What We're Building

A web application for talent agencies managing influencer brand deals. It replaces spreadsheets and email threads with a structured pipeline, creator directory, and payment tracking.

**Core problem it solves**: An agency managing 20+ creators across 50+ active deals has no single place to see deal status, creator assignments, content approvals, and payment state. This app is that place.

---

## Three User Roles

### Agency Account Manager (Primary User)
The agency owns the account. They create deals, assign creators, track pipeline, approve content, and manage payments.

**What they can see:**
- Full deal pipeline with financial details (deal value, commission %, creator payout)
- All creators on their roster
- All brands they work with
- All briefs submitted by brand managers
- Internal notes on deals

**What they cannot see:**
- Other agencies' data (single-agency MVP)

---

### Creator / Influencer (Secondary User)
A creator managed by the agency. They see their assigned work, submit content, and track payment status.

**What they can see:**
- Their own assigned deals (brief description, deadline, their payout amount)
- Contract status on each deal
- Their own content submissions + agency feedback
- Their payment status

**What they CANNOT see:**
- Commission percentage
- Full deal value (only their payout)
- Other creators on the roster
- Agency internal notes
- Any deal not assigned to them

---

### Brand Manager (Tertiary User)
Represents an advertiser company. They browse creator profiles and submit briefs to agencies.

**What they can see:**
- Public creator directory (`/discover`)
- Public creator profiles
- Their own submitted briefs + status

**What they CANNOT see:**
- Deal financials
- Commission rates
- Agency internal operations
- Other brands' briefs

---

## Feature List

### Phase 1 — Agency Deal Pipeline
- Kanban board with 8 pipeline stages
- Create deals (with brand, creator, value, commission, deadline)
- Deal detail view (brief, contract, content, payment sections)
- Manual stage advancement + drag-and-drop
- Creator roster management
- Brand management

### Phase 2 — Creator Portal
- Creator sees their assigned deals
- Creator submits content (URL input, then file upload)
- Submission auto-advances deal to PENDING_APPROVAL
- Agency approves or requests changes
- Submission history per deal

### Phase 3 — Discovery Layer
- Creator builds public profile (bio, platforms, niche tags, avatar)
- Public creator directory with filters
- Agency sends partnership requests
- Creator accepts/declines

### Phase 4 — Brand Manager Layer
- Brand manager submits briefs to agencies
- Agency converts brief to deal in one click
- Brief inbox with status tracking

### Phase 5 — Notifications (email)
- 11 email events via Resend + Trigger.dev background jobs
- Deadline reminder cron (48h warning)

---

## Deal Pipeline — 8 Stages

| Stage | Trigger | Who Controls |
|---|---|---|
| Brief Received | Deal created, no creator assigned | System |
| Creator Assigned | Agency sets creatorId | Agency (manual) |
| Contract Sent | Agency sets contractStatus → Sent | Agency (manual) |
| In Production | Agency sets contractStatus → Signed | Agency (manual) |
| Pending Approval | Creator submits ContentSubmission | **System (auto)** |
| Live | Agency approves ContentSubmission | **System (auto)** |
| Payment Pending | Agency manual advance | Agency (manual) |
| Closed | Agency sets paymentStatus → Received | Agency (manual) |

**Rules:**
- Forward skipping is allowed (e.g., Brief Received → In Production)
- Backward movement only via Reopen action (one step at a time)
- PENDING_APPROVAL and LIVE are system-controlled — cannot be manually set

---

## Key Business Rules

1. **Creator payout is always calculated**: `payout = dealValue × (1 − commissionPct / 100)` — never manually entered
2. **All monetary values in USD cents** stored as `Decimal(10,2)` in Postgres
3. **Creator never sees commission %** — only their payout amount
4. **Email only for notifications** — no in-app notification centre in MVP
5. **Single-agency scope** — one agency per account in MVP
6. **Content submission advances stage automatically** — no manual intervention needed

---

## Out of Scope (MVP)

Do not build, suggest, or scope any of the following:

- Smart creator matching / AI recommendation engine
- Contract generation or e-signature
- In-app notification centre (email only)
- Analytics or reporting dashboard
- Multi-agency support
- Native mobile app
- Social platform API sync (follower/engagement data)
- Brand manager ↔ creator direct messaging
- Custom email domain (use Resend shared sender in MVP)

---

## Success Criteria

MVP is successful when:
1. An agency can create a deal → assign a creator → track it through all 8 stages → mark payment received
2. A creator can log in → see their assigned deals → submit content → see agency feedback
3. A brand manager can browse creators → submit a brief → agency converts it to a deal
4. All 11 email notifications fire on the correct events
5. The app runs without errors on mobile (responsive)
