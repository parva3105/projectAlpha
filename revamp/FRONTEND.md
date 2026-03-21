# Frontend Spec — Brand Deal Manager (Revamp)

## Conventions

- **Server Components by default** — add `'use client'` only for interactivity (forms, drag-drop, filters)
- **Geist Sans** for all UI text, **Geist Mono** for IDs, dollar amounts, handles, timestamps
- **Dark mode** as the default — zinc/slate palette, single accent color
- **shadcn/ui** for all UI primitives — never raw HTML buttons/inputs
- All monetary values display as `$X,XXX.XX` (formatted from cents)
- All dates display as `MMM D, YYYY` (e.g., "Apr 15, 2026")

---

## Dev Tool: RoleSwitcher

**Phase 1 only** — stripped in Phase 3.

A dropdown in the top-right of the header that lets you switch between:
- `agency` → shows agency sidebar + agency routes
- `creator` → shows creator sidebar + creator routes
- `brand_manager` → shows brand sidebar + brand routes

Role stored in `localStorage`. Read via a `useRole()` context hook. The three role-group layouts read from this context to decide what to render.

---

## Layouts

### Agency Layout (`app/(agency)/layout.tsx`)
```
┌─────────────────────────────────────────────┐
│  ┌──────┐  ┌────────────────────────────┐   │
│  │Sidebar│  │ Header (role label + user) │   │
│  │      │  ├────────────────────────────┤   │
│  │ Nav  │  │                            │   │
│  │items │  │   Page content (scrollable)│   │
│  │      │  │                            │   │
│  │      │  │                            │   │
│  └──────┘  └────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Sidebar nav items:**
- Dashboard (`/dashboard`) — LayoutDashboard icon
- Deals (`/deals`) — FileText icon
- Roster (`/roster`) — Users icon
- Brands (`/brands`) — Building2 icon
- Briefs (`/briefs`) — Inbox icon

**Header:** Shows "Agency" label, `RoleSwitcher` (Phase 1), user avatar placeholder.

---

### Creator Layout (`app/(creator)/layout.tsx`)
**Sidebar nav items:**
- My Deals (`/creator/deals`) — FileText icon
- Profile (`/creator/profile`) — User icon

**Header:** Shows "Creator Portal" label, `RoleSwitcher` (Phase 1).

---

### Brand Layout (`app/(brand)/layout.tsx`)
**Sidebar nav items:**
- Submit Brief (`/briefs/new`) — PenLine icon
- My Briefs (`/brand/briefs`) — Inbox icon

**Header:** Shows "Brand Portal" label, `RoleSwitcher` (Phase 1).

---

## Page Specs

---

### `/` — Landing Page

**Component:** `app/(public)/page.tsx` (Server Component)
**Mock data:** None (static)

**Sections:**
1. **Hero** — Product name, one-line tagline, two CTA buttons (Get Started → `/signup`, View Demo → `/discover`)
2. **How it works** — 3-step flow (Create Deal → Assign Creator → Approve & Pay)
3. **Role cards** — 3 cards (Agency, Creator, Brand Manager) each with icon, description, and "Get started" link
4. **Footer** — product name + tagline

---

### `/discover` — Creator Directory

**Component:** `app/(public)/discover/page.tsx` (Server Component + client filter)
**Mock data:** `lib/mock/creators.ts` (8 creators)

**Layout:**
```
┌─ Filter sidebar ──┐  ┌─ Creator grid ────────────────────────────┐
│ Platform          │  │  ┌──────┐  ┌──────┐  ┌──────┐           │
│ Niche             │  │  │Card  │  │Card  │  │Card  │           │
│ Followers range   │  │  └──────┘  └──────┘  └──────┘           │
│ Engagement rate   │  │  ...                                      │
│ [Clear filters]   │  │  [Load more]                              │
└───────────────────┘  └───────────────────────────────────────────┘
```

**CreatorCard component** (`components/creator/CreatorCard.tsx`):
- Avatar (placeholder initials if no image)
- Display name + `@handle` in Geist Mono
- Platform badges (Instagram, TikTok, YouTube, etc.)
- Top 3 niche tags
- Follower count (formatted: `125K`, `1.2M`)
- Engagement rate (`3.4%`)
- Link → `/creators/:handle`

**Filters** (client-side on mock data in Phase 1, API query params in Phase 2):
- Platform: multi-select checkboxes
- Niche: text search / tag filter
- Followers: range slider (0 → 10M+)
- Engagement: min % input
- Free-text search (name / handle)

---

### `/creators/[handle]` — Creator Profile

**Component:** `app/(public)/creators/[handle]/page.tsx` (Server Component)
**Mock data:** find by handle in `lib/mock/creators.ts`

**Sections:**
1. **Header** — Large avatar, name, handle, bio, platform badges, niche tags
2. **Stats** — Follower count, engagement rate, primary platform
3. **Agency CTA** (visible to agency role only in Phase 3):
   - "Send Partnership Request" button → opens modal with optional message field
4. **Public info** — What the creator shares publicly

---

### `/agencies` — Agency Listing

**Component:** `app/(public)/agencies/page.tsx` (Server Component)
**Mock data:** 2–3 hardcoded mock agencies

Simple list of agency cards (name, tagline, creator count). Links to agency profile (future feature — not built in MVP).

---

### `/dashboard` — Agency Kanban Board

**Component:** `app/(agency)/dashboard/page.tsx` (Server Component shell)
**Client component:** `components/kanban/KanbanBoard.tsx`
**Mock data:** `lib/mock/deals.ts` (8 deals, one per stage)

**KanbanBoard:**
- Horizontal scroll container
- 8 columns (one per DealStage)
- Each column: stage label, deal count badge, droppable zone
- DealCard draggable between columns
- Drag uses dnd-kit `DragOverlay` for smooth UX

**DealCard** (`components/kanban/DealCard.tsx`):
```
┌─────────────────────────────────┐
│ Overdue badge (if applicable)   │
│ Deal title                      │
│ Brand name                      │
│ Creator name (if assigned)      │
│ Deadline · $Value               │
└─────────────────────────────────┘
```

**KanbanFilters** (`components/kanban/KanbanFilters.tsx`):
- Platform dropdown
- Creator dropdown
- Brand dropdown
- "Overdue only" toggle
- All filters are client-side in Phase 1

---

### `/deals` — Deal List

**Component:** `app/(agency)/deals/page.tsx` (Server Component)
**Mock data:** `lib/mock/deals.ts`

Table view of all deals:
| Column | Notes |
|---|---|
| Title | Link → `/deals/:id` |
| Brand | Brand name |
| Creator | Name or "Unassigned" |
| Stage | Colored badge |
| Deadline | Red if overdue |
| Value | Formatted USD |
| Payout | Formatted USD |

**Actions:** "New Deal" button → `/deals/new`
**Filters:** Stage dropdown, overdue toggle
**Empty state:** "No deals yet. Create your first deal."

---

### `/deals/new` — Create Deal Form

**Component:** `app/(agency)/deals/new/page.tsx` + `components/forms/DealNewForm.tsx` (Client)
**Mock data:** brands + creators from `lib/mock/`

**Form fields:**
| Field | Type | Notes |
|---|---|---|
| Title | Text input | Required |
| Brand | Select + inline create | Required — shows brand list, "Create new" option opens dialog |
| Creator | Select (optional) | Optional — shows roster creators |
| Platform | Select (enum) | Instagram, TikTok, YouTube, Twitter, LinkedIn, Pinterest, Other |
| Deal Value | Number input (dollars) | Required — stored as cents |
| Commission % | Number input | Required — 0–100 |
| Creator Payout | Read-only display | Auto-calculated: dealValue × (1 − commissionPct/100) |
| Deadline | Date input | Required |
| Notes | Textarea | Optional |

**On submit (Phase 1):** Toast "Deal created" + redirect to `/deals`
**On submit (Phase 2):** `POST /api/v1/deals`

---

### `/deals/[id]` — Deal Detail

**Component:** `app/(agency)/deals/[id]/page.tsx` + `components/deals/DealDetail.tsx` (Client)
**Mock data:** find by id in `lib/mock/deals.ts`

**Section A — Brief**
- Deal title, platform badge, deadline, overdue indicator
- Brand info (name, website link)
- Creator info (name, handle) or "Not assigned"
- Notes

**Section B — Contract**
- Contract status badge (Not Sent / Sent / Signed)
- "Mark Sent" / "Mark Signed" action buttons
- Contract file upload placeholder (Phase 4)

**Section C — Content**
- Submission history table: round, submitted date, status badge, feedback (if any)
- Agency approval actions (Approve / Request Changes) — appear when deal is PENDING_APPROVAL
- Request Changes → requires feedback text input
- Latest round submission URL displayed

**Section D — Payment**
- Creator payout amount (Geist Mono)
- Payment status badge (Pending / Received)
- "Mark Payment Received" button

**Stage Control Panel** (`components/deals/StageControlPanel.tsx`):
- Current stage highlighted
- "Advance to [next stage]" button (disabled for system-controlled stages)
- "Reopen" button (moves one stage back)
- Stage history (phase 2+)

---

### `/roster` — Creator Roster

**Component:** `app/(agency)/roster/page.tsx` + `components/roster/RosterTable.tsx` (Client)
**Mock data:** `lib/mock/creators.ts`

**Table columns:**
| Column |
|---|
| Avatar + Name |
| Handle (Geist Mono) |
| Primary Platform |
| Niche Tags (first 3) |
| Follower Count |
| Active Deals count |

**Actions:** "Add Creator" button → opens `AddCreatorSheet`

**AddCreatorSheet** (`components/roster/AddCreatorSheet.tsx`):
- Slide-in sheet from right
- Fields: Name, Handle, Bio, Platforms (multi-select), Niche Tags, Follower Count, Engagement Rate
- On submit (Phase 1): adds to local mock list + toast

**Empty state:** "Your roster is empty. Add your first creator."

---

### `/brands` — Brands Table

**Component:** `app/(agency)/brands/page.tsx` + `components/brands/BrandsTable.tsx` (Client)
**Mock data:** `lib/mock/brands.ts`

**Table columns:** Name, Website, Open Deals (count), Total Deal Value
**Actions:** "Add Brand" button → opens `AddBrandDialog`
**Empty state:** "No brands yet."

---

### `/brands/[id]` — Brand Detail

**Component:** `app/(agency)/brands/[id]/page.tsx` (Server Component)
**Mock data:** find brand + filter deals by brandId from `lib/mock/`

**Sections:**
1. Brand info card (name, website, logo placeholder)
2. Associated deals table (title, creator, stage badge, value, deadline)

---

### `/briefs` — Brief Inbox

**Component:** `app/(agency)/briefs/page.tsx` + `components/briefs/BriefsTable.tsx` (Client)
**Mock data:** `lib/mock/briefs.ts`

**Table columns:** Title, Brand Manager, Platform, Budget, Niche, Status badge, Received date
**Filters:** Status (New / Reviewed / Converted / Declined)
**Empty state:** "No briefs yet."

---

### `/briefs/[id]` — Brief Detail

**Component:** `app/(agency)/briefs/[id]/page.tsx` + `components/briefs/BriefDetail.tsx` (Client)
**Mock data:** find by id in `lib/mock/briefs.ts`

**Sections:**
1. Brief info (title, description, platform, niche, budget)
2. Submitted by (brand manager name, company)
3. Requested creator (if specified)
4. Action bar:
   - "Convert to Deal" → navigates to `/deals/new?briefId=...` with data pre-filled
   - "Mark Reviewed" → updates status badge
   - "Decline" → updates status badge + confirmation dialog

---

### `/creator/deals` — My Deals

**Component:** `app/(creator)/creator/deals/page.tsx` (Server Component)
**Mock data:** filter `lib/mock/deals.ts` by `creatorId === "mock_creator_001"`

**List of deal cards:**
- Brand name + deal title
- Stage badge
- Deadline
- My payout (not deal value, not commission)
- Link → `/creator/deals/:id`

**Empty state:** "No deals assigned to you yet."

---

### `/creator/deals/[id]` — Creator Deal Detail

**Component:** `app/(creator)/creator/deals/[id]/page.tsx` (Server Component + client form)
**Mock data:** find by id, filtered to creator's deals

**What the creator sees:**
- Deal title + brand name + platform
- Brief description (notes from agency)
- Deadline
- Contract status (read-only badge — Sent / Signed)
- My payout amount (Geist Mono, large)
- Payment status badge

**Content submission section:**
- Submission history (round, date, status, feedback)
- Submission form (URL input): visible only when stage is IN_PRODUCTION or PENDING_APPROVAL
- On submit → updates local state (Phase 1) / POST to API (Phase 2)

---

### `/creator/profile` — Profile Editor

**Component:** `app/(creator)/creator/profile/page.tsx` + client form
**Mock data:** single creator from `lib/mock/creators.ts`

**Fields:**
- Avatar upload (placeholder in Phase 1)
- Display name
- Handle (read-only after set)
- Bio (textarea)
- Platforms (multi-select: Instagram, TikTok, YouTube, Twitter, LinkedIn, Pinterest)
- Niche tags (tag input, add/remove)
- Follower count
- Engagement rate (%)
- Public / Private toggle (controls `/discover` visibility)

**On save (Phase 1):** Toast "Profile saved"

---

### `/briefs/new` — Submit Brief (Brand Manager)

**Component:** `app/(brand)/briefs/new/page.tsx` + `components/briefs/SubmitBriefForm.tsx` (Client)
**Mock data:** mock agencies list for agency selector

**Fields:**
| Field | Type |
|---|---|
| Title | Text input |
| Description | Textarea |
| Platform | Select (enum) |
| Niche | Text input |
| Budget | Number (USD) |
| Agency | Select (from mock list) |
| Creator | Optional select (from discover) |

**On submit (Phase 1):** Success screen: "Brief submitted! The agency will review it soon."

---

## Components Index

| Component | Location | Type | Used By |
|---|---|---|---|
| Sidebar | `components/layout/Sidebar.tsx` | Client | All layouts |
| Header | `components/layout/Header.tsx` | Client | All layouts |
| RoleSwitcher | `components/layout/RoleSwitcher.tsx` | Client | Header (Phase 1 only) |
| KanbanBoard | `components/kanban/KanbanBoard.tsx` | Client | /dashboard |
| KanbanColumn | `components/kanban/KanbanColumn.tsx` | Client | KanbanBoard |
| KanbanFilters | `components/kanban/KanbanFilters.tsx` | Client | KanbanBoard |
| DealCard | `components/kanban/DealCard.tsx` | Client | KanbanColumn |
| DealDraggable | `components/kanban/DealDraggable.tsx` | Client | KanbanColumn |
| DealDetail | `components/deals/DealDetail.tsx` | Client | /deals/[id] |
| StageControlPanel | `components/deals/StageControlPanel.tsx` | Client | DealDetail |
| SubmissionHistory | `components/deals/SubmissionHistory.tsx` | Client | DealDetail, /creator/deals/[id] |
| DealNewForm | `components/forms/DealNewForm.tsx` | Client | /deals/new |
| InlineBrandForm | `components/forms/InlineBrandForm.tsx` | Client | DealNewForm |
| CreatorCard | `components/creator/CreatorCard.tsx` | Server | /discover |
| CreatorProfileEditor | `components/creator/CreatorProfileEditor.tsx` | Client | /creator/profile |
| RosterTable | `components/roster/RosterTable.tsx` | Client | /roster |
| AddCreatorSheet | `components/roster/AddCreatorSheet.tsx` | Client | /roster |
| BrandsTable | `components/brands/BrandsTable.tsx` | Client | /brands |
| AddBrandDialog | `components/brands/AddBrandDialog.tsx` | Client | /brands |
| BrandDetail | `components/brands/BrandDetail.tsx` | Server | /brands/[id] |
| BriefsTable | `components/briefs/BriefsTable.tsx` | Client | /briefs |
| BriefDetail | `components/briefs/BriefDetail.tsx` | Client | /briefs/[id] |
| SubmitBriefForm | `components/briefs/SubmitBriefForm.tsx` | Client | /briefs/new |
