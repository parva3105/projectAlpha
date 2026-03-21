export type MockBrief = {
  id: string
  brandManagerClerkId: string
  agencyClerkId: string
  creatorId: string | null
  title: string
  description: string
  budget: number // dollars
  platform: string
  niche: string
  status: string // "NEW" | "REVIEWED" | "CONVERTED" | "DECLINED"
  createdAt: string
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
    description:
      "We're launching a new line of electrolyte drinks targeting fitness enthusiasts. Looking for 3 short-form videos and 5 Instagram posts across June.",
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
    description:
      "We need an authentic unboxing and review series for our new smart home hub. Target audience is tech-savvy homeowners 28–45.",
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
    description:
      "3-piece collection drop — we need a mix of Reels and static posts. Brand voice: effortless, sustainable, inclusive.",
    budget: 5000,
    platform: "Instagram",
    niche: "Fashion",
    status: "CONVERTED",
    createdAt: "2026-03-10T14:00:00Z",
    brandManagerName: "Rachel Kim",
    brandManagerCompany: "HydroBoost Labs",
  },
  {
    id: "brief_004",
    brandManagerClerkId: "bm_clerk_003",
    agencyClerkId: "test_agency_001",
    creatorId: null,
    title: "Gaming Peripheral Review Series",
    description:
      "Looking for a tech creator to review our new gaming mouse and keyboard. Competitive gaming audience.",
    budget: 3200,
    platform: "YouTube",
    niche: "Tech",
    status: "DECLINED",
    createdAt: "2026-03-08T10:00:00Z",
    brandManagerName: "Alex Nguyen",
    brandManagerCompany: "ProGear Inc",
  },
]
