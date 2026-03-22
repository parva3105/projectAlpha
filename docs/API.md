# API Reference — Brand Deal Manager

All endpoints live under `/api/v1/`. All responses have the shape:

```json
{ "data": <T> | null, "error": <string> | null }
```

All endpoints require Clerk authentication with role `agency` unless noted otherwise.

**Auth error codes**
- `401 Unauthenticated` — no valid Clerk session
- `403 Forbidden` — authenticated but role is not `agency`

---

## Auth

### GET /api/v1/auth/complete

Called after Clerk sign-up via `forceRedirectUrl`. Sets `publicMetadata.role` and redirects to `/signup/complete`.

**Query params**: `role` — one of `agency | creator | brand_manager`
**Auth**: None (public — called immediately after sign-up)
**Response**: 302 redirect to `/signup/complete`

---

## Deals

### GET /api/v1/deals

Returns all deals owned by the authenticated agency.

**Auth**: Agency only

**Query params** (all optional):

| Param | Type | Description |
|---|---|---|
| `stage` | `DealStage` | Filter by stage enum value |
| `creatorId` | `string` | Filter by assigned creator ID |
| `brandId` | `string` | Filter by brand ID |
| `overdueOnly` | `boolean` | When `true`, return only deals past their deadline in active stages |

**Response 200**:
```json
{
  "data": [
    {
      "id": "clx...",
      "title": "Nike Summer Campaign",
      "stage": "IN_PRODUCTION",
      "dealValue": "1500.00",
      "commissionPct": "20.00",
      "creatorPayout": "1200.00",
      "deadline": "2026-06-01T00:00:00.000Z",
      "brand": { "id": "...", "name": "Nike" },
      "creator": { "id": "...", "name": "Jane Doe", "handle": "janedoe" }
    }
  ],
  "error": null
}
```

---

### POST /api/v1/deals

Creates a new deal at stage `BRIEF_RECEIVED`. `creatorPayout` is always calculated server-side.

**Auth**: Agency only

**Request body**:

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | Deal title |
| `brandId` | `string` | Yes | ID of an existing Brand |
| `creatorId` | `string` | No | ID of an existing Creator |
| `dealValue` | `number` | Yes | Deal value in USD dollars (e.g. `1500.00`) |
| `commissionPct` | `number` | Yes | Agency commission percentage 0–100 (e.g. `20`) |
| `deadline` | `string` | No | ISO 8601 date string (e.g. `"2026-06-01"`) |
| `notes` | `string` | No | Internal agency notes (never exposed to creator/brand) |

**Response 201**: Created deal object (same shape as GET item, includes brand + creator)

**Error codes**:
- `400` — Validation error, brand not found, or creator not found
- `401` / `403` — Auth errors

---

### GET /api/v1/deals/[id]

Returns a single deal with all relations.

**Auth**: Agency only (must own the deal)

**Response 200**: Deal object including `brand`, `creator`, and `submissions[]`

**Error codes**:
- `404` — Deal not found or not owned by caller

---

### PATCH /api/v1/deals/[id]

Updates deal fields. All fields optional. `creatorPayout` is recalculated automatically if `dealValue` or `commissionPct` changes.

**Auth**: Agency only (must own the deal)

**Request body** (all optional):

| Field | Type | Description |
|---|---|---|
| `title` | `string` | Deal title |
| `brandId` | `string` | Brand ID |
| `creatorId` | `string \| null` | Creator ID (`null` to unassign) |
| `dealValue` | `number` | Deal value in USD dollars |
| `commissionPct` | `number` | Commission percentage 0–100 |
| `deadline` | `string \| null` | ISO 8601 date or `null` to clear |
| `notes` | `string \| null` | Internal notes or `null` to clear |
| `contractStatus` | `PENDING \| SENT \| SIGNED` | Contract status |
| `paymentStatus` | `PENDING \| RECEIVED` | Payment status |

**Response 200**: Updated deal object

**Error codes**:
- `400` — Validation error or referenced entity not found
- `404` — Deal not found

---

### DELETE /api/v1/deals/[id]

Hard deletes a deal and all its submissions (cascade).

**Auth**: Agency only (must own the deal)

**Response 200**:
```json
{ "data": { "deleted": true }, "error": null }
```

**Error codes**:
- `404` — Deal not found

---

### POST /api/v1/deals/[id]/stage

Advances a deal to a target stage. Forward-only. Cannot manually set `PENDING_APPROVAL` or `LIVE` (system-controlled).

**Auth**: Agency only (must own the deal)

**Request body**:

| Field | Type | Required | Description |
|---|---|---|---|
| `targetStage` | `DealStage` | Yes | Target stage — must be after current stage |

**Valid DealStage values** (in order):
`BRIEF_RECEIVED` → `CREATOR_ASSIGNED` → `CONTRACT_SENT` → `IN_PRODUCTION` → `PENDING_APPROVAL` → `LIVE` → `PAYMENT_PENDING` → `CLOSED`

Forward skipping is allowed (e.g. `BRIEF_RECEIVED` → `CONTRACT_SENT`).

**Response 200**: Updated deal object

**Error codes**:
- `400` — Invalid request body
- `404` — Deal not found
- `422` — `"Stage is system-controlled"` (attempting to set `PENDING_APPROVAL` or `LIVE`)
- `422` — Target is not after current stage

---

### POST /api/v1/deals/[id]/reopen

Moves a deal exactly one stage backward (Reopen action). Cannot reopen from `BRIEF_RECEIVED`.

**Auth**: Agency only (must own the deal)

**Request body**: None

**Response 200**: Updated deal object

**Error codes**:
- `404` — Deal not found
- `422` — Deal is already at `BRIEF_RECEIVED` (cannot go back further)

---

## Brands

### GET /api/v1/brands

Returns all brands (global — not scoped to agency).

**Auth**: Agency only

**Response 200**:
```json
{
  "data": [
    { "id": "...", "name": "Nike", "website": "https://nike.com", "logoUrl": null }
  ],
  "error": null
}
```

---

### POST /api/v1/brands

Creates a new brand.

**Auth**: Agency only

**Request body**:

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | Yes | Brand name |
| `website` | `string` | No | Must be a valid URL |

**Response 201**: Created brand object

**Error codes**:
- `400` — Validation error

---

### GET /api/v1/brands/[id]

Returns a brand with its associated deals (scoped to the authenticated agency).

**Auth**: Agency only

**Response 200**: Brand object including `deals[]` with creator info

**Error codes**:
- `404` — Brand not found

---

## Roster

### GET /api/v1/roster

Returns all creators rostered to the authenticated agency.

**Auth**: Agency only

**Response 200**:
```json
{
  "data": [
    {
      "id": "...",
      "name": "Jane Doe",
      "handle": "janedoe",
      "platforms": ["instagram"],
      "isPublic": false,
      "agencyClerkId": "user_..."
    }
  ],
  "error": null
}
```

---

### POST /api/v1/roster

Manually adds a creator to the agency roster. Used for creators who don't have a Clerk account (e.g. imported from a spreadsheet). A placeholder `clerkId` is generated automatically.

**Auth**: Agency only

**Request body**:

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | Yes | Creator's full name |
| `handle` | `string` | Yes | URL-safe handle (lowercase, alphanumeric, `_` or `-`). Must be globally unique. |
| `platform` | `string` | Yes | Primary platform (e.g. `"instagram"`) — stored in `platforms[]` array |
| `email` | `string` | No | Email address (validated but not persisted — Creator model has no email field in MVP) |

**Response 201**: Created creator object

**Error codes**:
- `400` — Validation error or handle already taken

---

## Creator Profile

### GET /api/v1/profile

Returns the Creator record for the authenticated creator.

**Auth**: Creator only (or superadmin acting as creator)
**Response 200**: Creator object
**Error codes**:
- `401` — Not authenticated
- `403` — Authenticated but not a creator
- `404` — No Creator record found for this Clerk user

---

### PATCH /api/v1/profile

Updates updatable fields on the authenticated creator's profile. `handle` is immutable and cannot be changed via this endpoint.

**Auth**: Creator only (or superadmin acting as creator)

**Request body** (all fields optional):

| Field | Type | Description |
|---|---|---|
| `name` | `string` | Display name |
| `bio` | `string \| null` | Creator bio |
| `platforms` | `string[]` | List of platforms (e.g. `["Instagram", "TikTok"]`) |
| `nicheTags` | `string[]` | List of niche tags |
| `followerCount` | `number \| null` | Total follower count |
| `engagementRate` | `number \| null` | Engagement rate as a percentage (0–100) |
| `isPublic` | `boolean` | Whether the profile appears in /discover |

**Response 200**: Updated creator object
**Error codes**:
- `400` — Invalid JSON
- `404` — Creator profile not found
- `422` — Validation error

---

## GET /api/v1/briefs — multi-role support

This endpoint supports two caller roles:

- **Agency**: Returns briefs filtered by `agencyClerkId` (briefs submitted to this agency)
- **Brand Manager**: Returns briefs filtered by `brandManagerClerkId` (briefs submitted by this brand manager)

The handler tries agency auth first; if the caller is authenticated but not an agency (403), it falls back to brand manager auth.

---

## Deal stage transition rules

| Stage | How it is set |
|---|---|
| `BRIEF_RECEIVED` | Automatically on deal creation |
| `CREATOR_ASSIGNED` | Manual agency action (POST /stage) |
| `CONTRACT_SENT` | Manual agency action (POST /stage) |
| `IN_PRODUCTION` | Manual agency action (POST /stage) |
| `PENDING_APPROVAL` | **System only** — set when creator submits a ContentSubmission |
| `LIVE` | **System only** — set when agency approves a ContentSubmission |
| `PAYMENT_PENDING` | Manual agency action (POST /stage) |
| `CLOSED` | Manual agency action (POST /stage) |

Forward skipping is allowed. Backward movement is one step at a time via POST /reopen.
