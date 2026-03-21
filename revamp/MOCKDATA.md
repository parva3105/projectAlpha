# Mock Data — Brand Deal Manager (Phase 1)

## Purpose

Phase 1 pages import from `lib/mock/` instead of fetching from an API.
Each mock file exports typed arrays that match the final Prisma model shape exactly.

**Key rule:** When Phase 2 arrives, mock imports are replaced with `fetch()` calls.
No component changes needed — the data shape is identical.

---

## Mock Agency Context

All agency-scoped mock data belongs to:
```ts
const MOCK_AGENCY_ID = "test_agency_001"
```

---

## `lib/mock/creators.ts`

```ts
export type MockCreator = {
  id: string
  clerkId: string
  name: string
  handle: string
  bio: string | null
  avatarUrl: string | null
  platforms: string[]
  nicheTags: string[]
  followerCount: number | null
  engagementRate: number | null
  isPublic: boolean
  agencyClerkId: string | null
  createdAt: string
}

export const mockCreators: MockCreator[] = [
  {
    id: "creator_001",
    clerkId: "clerk_creator_001",
    name: "Aria Chen",
    handle: "aria.chen",
    bio: "Lifestyle & wellness creator based in NYC. Turning everyday moments into inspiration.",
    avatarUrl: null,
    platforms: ["Instagram", "TikTok"],
    nicheTags: ["Wellness", "Lifestyle", "Fitness"],
    followerCount: 185000,
    engagementRate: 4.2,
    isPublic: true,
    agencyClerkId: "test_agency_001",
    createdAt: "2026-01-10T09:00:00Z",
  },
  {
    id: "creator_002",
    clerkId: "clerk_creator_002",
    name: "Marcus Webb",
    handle: "marcuswebb",
    bio: "Tech reviews, unboxings, and the honest take you didn't know you needed.",
    avatarUrl: null,
    platforms: ["YouTube", "Twitter"],
    nicheTags: ["Tech", "Gadgets", "Reviews"],
    followerCount: 430000,
    engagementRate: 3.1,
    isPublic: true,
    agencyClerkId: "test_agency_001",
    createdAt: "2026-01-15T09:00:00Z",
  },
  {
    id: "creator_003",
    clerkId: "clerk_creator_003",
    name: "Dani Flores",
    handle: "dani.flores",
    bio: "Food & travel. If it tastes good or has a good view, I'm there.",
    avatarUrl: null,
    platforms: ["Instagram", "YouTube"],
    nicheTags: ["Food", "Travel", "Lifestyle"],
    followerCount: 92000,
    engagementRate: 5.8,
    isPublic: true,
    agencyClerkId: "test_agency_001",
    createdAt: "2026-02-01T09:00:00Z",
  },
  {
    id: "creator_004",
    clerkId: "clerk_creator_004",
    name: "Jordan Park",
    handle: "jordanpark",
    bio: "Fashion-forward, unapologetically me. Styling tips for real people.",
    avatarUrl: null,
    platforms: ["Instagram", "TikTok", "Pinterest"],
    nicheTags: ["Fashion", "Style", "Beauty"],
    followerCount: 670000,
    engagementRate: 2.9,
    isPublic: true,
    agencyClerkId: null,
    createdAt: "2026-02-10T09:00:00Z",
  },
  {
    id: "creator_005",
    clerkId: "roster_abc123",
    name: "Sam Rivera",
    handle: "samrivera",
    bio: "Finance & investing made simple. Building wealth one video at a time.",
    avatarUrl: null,
    platforms: ["YouTube", "LinkedIn"],
    nicheTags: ["Finance", "Investing", "Business"],
    followerCount: 210000,
    engagementRate: 6.1,
    isPublic: false,
    agencyClerkId: "test_agency_001",
    createdAt: "2026-03-01T09:00:00Z",
  },
]

// Roster creators = those assigned to test_agency_001
export const mockRoster = mockCreators.filter(
  (c) => c.agencyClerkId === "test_agency_001"
)
```

---

## `lib/mock/brands.ts`

```ts
export type MockBrand = {
  id: string
  name: string
  website: string | null
  logoUrl: string | null
  createdAt: string
}

export const mockBrands: MockBrand[] = [
  {
    id: "brand_001",
    name: "Lumina Beauty",
    website: "https://luminabeauty.com",
    logoUrl: null,
    createdAt: "2026-01-05T09:00:00Z",
  },
  {
    id: "brand_002",
    name: "PeakFit Gear",
    website: "https://peakfitgear.com",
    logoUrl: null,
    createdAt: "2026-01-20T09:00:00Z",
  },
  {
    id: "brand_003",
    name: "Novu Tech",
    website: "https://novutech.io",
    logoUrl: null,
    createdAt: "2026-02-05T09:00:00Z",
  },
  {
    id: "brand_004",
    name: "Harvest & Co",
    website: null,
    logoUrl: null,
    createdAt: "2026-02-18T09:00:00Z",
  },
]
```

---

## `lib/mock/deals.ts`

One deal per pipeline stage so the Kanban board shows all 8 columns populated.

```ts
export type MockDeal = {
  id: string
  agencyClerkId: string
  brandId: string
  creatorId: string | null
  briefId: string | null
  title: string
  stage: string
  dealValue: number         // dollars (not cents) for display simplicity in Phase 1
  commissionPct: number
  creatorPayout: number     // calculated
  deadline: string
  contractStatus: string
  contractUrl: string | null
  paymentStatus: string
  notes: string | null
  createdAt: string
  // Joined relations (populated for display)
  brand: { id: string; name: string; website: string | null }
  creator: { id: string; name: string; handle: string } | null
}

export const mockDeals: MockDeal[] = [
  {
    id: "deal_001",
    agencyClerkId: "test_agency_001",
    brandId: "brand_001",
    creatorId: null,
    briefId: null,
    title: "Spring Skincare Launch",
    stage: "BRIEF_RECEIVED",
    dealValue: 3500,
    commissionPct: 20,
    creatorPayout: 2800,
    deadline: "2026-04-15T00:00:00Z",
    contractStatus: "NOT_SENT",
    contractUrl: null,
    paymentStatus: "PENDING",
    notes: "Brand wants 3 Instagram posts and 1 Reel.",
    createdAt: "2026-03-10T09:00:00Z",
    brand: { id: "brand_001", name: "Lumina Beauty", website: "https://luminabeauty.com" },
    creator: null,
  },
  {
    id: "deal_002",
    agencyClerkId: "test_agency_001",
    brandId: "brand_002",
    creatorId: "creator_001",
    briefId: null,
    title: "Summer Fitness Campaign",
    stage: "CREATOR_ASSIGNED",
    dealValue: 5000,
    commissionPct: 15,
    creatorPayout: 4250,
    deadline: "2026-05-01T00:00:00Z",
    contractStatus: "NOT_SENT",
    contractUrl: null,
    paymentStatus: "PENDING",
    notes: "2 TikTok videos, 1 Instagram story series.",
    createdAt: "2026-03-08T09:00:00Z",
    brand: { id: "brand_002", name: "PeakFit Gear", website: "https://peakfitgear.com" },
    creator: { id: "creator_001", name: "Aria Chen", handle: "aria.chen" },
  },
  {
    id: "deal_003",
    agencyClerkId: "test_agency_001",
    brandId: "brand_003",
    creatorId: "creator_002",
    briefId: null,
    title: "Novu Laptop Pro Review",
    stage: "CONTRACT_SENT",
    dealValue: 8000,
    commissionPct: 20,
    creatorPayout: 6400,
    deadline: "2026-04-20T00:00:00Z",
    contractStatus: "SENT",
    contractUrl: null,
    paymentStatus: "PENDING",
    notes: "Long-form YouTube review + 2 Twitter threads.",
    createdAt: "2026-03-05T09:00:00Z",
    brand: { id: "brand_003", name: "Novu Tech", website: "https://novutech.io" },
    creator: { id: "creator_002", name: "Marcus Webb", handle: "marcuswebb" },
  },
  {
    id: "deal_004",
    agencyClerkId: "test_agency_001",
    brandId: "brand_001",
    creatorId: "creator_003",
    briefId: null,
    title: "Glow Serum Unboxing",
    stage: "IN_PRODUCTION",
    dealValue: 2200,
    commissionPct: 25,
    creatorPayout: 1650,
    deadline: "2026-04-10T00:00:00Z",
    contractStatus: "SIGNED",
    contractUrl: null,
    paymentStatus: "PENDING",
    notes: "Short-form Instagram + YouTube Shorts.",
    createdAt: "2026-03-01T09:00:00Z",
    brand: { id: "brand_001", name: "Lumina Beauty", website: "https://luminabeauty.com" },
    creator: { id: "creator_003", name: "Dani Flores", handle: "dani.flores" },
  },
  {
    id: "deal_005",
    agencyClerkId: "test_agency_001",
    brandId: "brand_002",
    creatorId: "creator_005",
    briefId: null,
    title: "PeakFit Protein Series",
    stage: "PENDING_APPROVAL",
    dealValue: 4500,
    commissionPct: 20,
    creatorPayout: 3600,
    deadline: "2026-03-25T00:00:00Z",
    contractStatus: "SIGNED",
    contractUrl: null,
    paymentStatus: "PENDING",
    notes: "3 YouTube Shorts, finance + fitness crossover angle.",
    createdAt: "2026-02-20T09:00:00Z",
    brand: { id: "brand_002", name: "PeakFit Gear", website: "https://peakfitgear.com" },
    creator: { id: "creator_005", name: "Sam Rivera", handle: "samrivera" },
  },
  {
    id: "deal_006",
    agencyClerkId: "test_agency_001",
    brandId: "brand_004",
    creatorId: "creator_003",
    briefId: null,
    title: "Harvest Table Feature",
    stage: "LIVE",
    dealValue: 1800,
    commissionPct: 20,
    creatorPayout: 1440,
    deadline: "2026-03-10T00:00:00Z",
    contractStatus: "SIGNED",
    contractUrl: null,
    paymentStatus: "PENDING",
    notes: "Farm-to-table recipe post + Instagram stories.",
    createdAt: "2026-02-10T09:00:00Z",
    brand: { id: "brand_004", name: "Harvest & Co", website: null },
    creator: { id: "creator_003", name: "Dani Flores", handle: "dani.flores" },
  },
  {
    id: "deal_007",
    agencyClerkId: "test_agency_001",
    brandId: "brand_003",
    creatorId: "creator_002",
    briefId: null,
    title: "Novu Wireless Earbuds Drop",
    stage: "PAYMENT_PENDING",
    dealValue: 6000,
    commissionPct: 20,
    creatorPayout: 4800,
    deadline: "2026-03-01T00:00:00Z",
    contractStatus: "SIGNED",
    contractUrl: null,
    paymentStatus: "PENDING",
    notes: "YouTube video + Twitter thread series.",
    createdAt: "2026-01-25T09:00:00Z",
    brand: { id: "brand_003", name: "Novu Tech", website: "https://novutech.io" },
    creator: { id: "creator_002", name: "Marcus Webb", handle: "marcuswebb" },
  },
  {
    id: "deal_008",
    agencyClerkId: "test_agency_001",
    brandId: "brand_001",
    creatorId: "creator_001",
    briefId: null,
    title: "Holiday Gift Set Campaign",
    stage: "CLOSED",
    dealValue: 7500,
    commissionPct: 15,
    creatorPayout: 6375,
    deadline: "2025-12-20T00:00:00Z",
    contractStatus: "SIGNED",
    contractUrl: null,
    paymentStatus: "RECEIVED",
    notes: "Holiday series — 4 Instagram posts over 2 weeks.",
    createdAt: "2025-11-15T09:00:00Z",
    brand: { id: "brand_001", name: "Lumina Beauty", website: "https://luminabeauty.com" },
    creator: { id: "creator_001", name: "Aria Chen", handle: "aria.chen" },
  },
]
```

---

## `lib/mock/submissions.ts`

```ts
export type MockSubmission = {
  id: string
  dealId: string
  creatorId: string
  round: number
  url: string | null
  fileKey: string | null
  status: string
  feedback: string | null
  submittedAt: string
  reviewedAt: string | null
}

export const mockSubmissions: MockSubmission[] = [
  {
    id: "sub_001",
    dealId: "deal_005",
    creatorId: "creator_005",
    round: 1,
    url: "https://youtube.com/shorts/abc123",
    fileKey: null,
    status: "PENDING",
    feedback: null,
    submittedAt: "2026-03-18T14:00:00Z",
    reviewedAt: null,
  },
  {
    id: "sub_002",
    dealId: "deal_004",
    creatorId: "creator_003",
    round: 1,
    url: "https://instagram.com/p/xyz789",
    fileKey: null,
    status: "CHANGES_REQUESTED",
    feedback: "Great energy! Can you re-film with the product more visible in frame?",
    submittedAt: "2026-03-12T10:00:00Z",
    reviewedAt: "2026-03-13T09:00:00Z",
  },
  {
    id: "sub_003",
    dealId: "deal_004",
    creatorId: "creator_003",
    round: 2,
    url: "https://instagram.com/p/abc456",
    fileKey: null,
    status: "APPROVED",
    feedback: null,
    submittedAt: "2026-03-15T11:00:00Z",
    reviewedAt: "2026-03-16T09:00:00Z",
  },
]
```

---

## `lib/mock/briefs.ts`

```ts
export type MockBrief = {
  id: string
  brandManagerClerkId: string
  agencyClerkId: string
  creatorId: string | null
  title: string
  description: string
  budget: number
  platform: string
  niche: string
  status: string
  createdAt: string
  // For display
  brandManagerName: string
  brandManagerCompany: string
}

export const mockBriefs: MockBrief[] = [
  {
    id: "brief_001",
    brandManagerClerkId: "bm_clerk_001",
    agencyClerkId: "test_agency_001",
    creatorId: null,
    title: "Summer Hydration Campaign",
    description: "We're launching a new line of electrolyte drinks targeting fitness enthusiasts. Looking for 3 short-form videos and 5 Instagram posts across June.",
    budget: 12000,
    platform: "Instagram",
    niche: "Fitness",
    status: "NEW",
    createdAt: "2026-03-19T08:00:00Z",
    brandManagerName: "Rachel Kim",
    brandManagerCompany: "HydroBoost Labs",
  },
  {
    id: "brief_002",
    brandManagerClerkId: "bm_clerk_002",
    agencyClerkId: "test_agency_001",
    creatorId: "creator_002",
    title: "Smart Home Device Launch",
    description: "We need an authentic unboxing and review series for our new smart home hub. Target audience is tech-savvy homeowners 28–45.",
    budget: 8500,
    platform: "YouTube",
    niche: "Tech",
    status: "REVIEWED",
    createdAt: "2026-03-15T11:00:00Z",
    brandManagerName: "Tom Bradley",
    brandManagerCompany: "NestIQ",
  },
  {
    id: "brief_003",
    brandManagerClerkId: "bm_clerk_001",
    agencyClerkId: "test_agency_001",
    creatorId: null,
    title: "Spring Fashion Lookbook",
    description: "3-piece collection drop — we need a mix of Reels and static posts. Brand voice: effortless, sustainable, inclusive.",
    budget: 5000,
    platform: "Instagram",
    niche: "Fashion",
    status: "CONVERTED",
    createdAt: "2026-03-10T14:00:00Z",
    brandManagerName: "Rachel Kim",
    brandManagerCompany: "HydroBoost Labs",
  },
]
```

---

## Usage in Pages

```ts
// Phase 1 — direct import
import { mockDeals } from "@/lib/mock/deals"

export default function DashboardPage() {
  return <KanbanBoard deals={mockDeals} />
}
```

```ts
// Phase 2 — replace with fetch (component unchanged)
export default async function DashboardPage() {
  const res = await fetch("/api/v1/deals", { cache: "no-store" })
  const { data: deals } = await res.json()
  return <KanbanBoard deals={deals} />
}
```

The `MockDeal` type is intentionally identical to the Prisma + join response shape in Phase 2, so no type changes are needed when switching.
