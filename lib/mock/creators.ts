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
  updatedAt: string
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
    updatedAt: "2026-01-10T09:00:00Z",
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
    updatedAt: "2026-01-15T09:00:00Z",
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
    updatedAt: "2026-02-01T09:00:00Z",
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
    updatedAt: "2026-02-10T09:00:00Z",
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
    updatedAt: "2026-03-01T09:00:00Z",
  },
]

export const mockRoster = mockCreators.filter(
  (c) => c.agencyClerkId === "test_agency_001"
)
