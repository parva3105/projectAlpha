export type MockSubmission = {
  id: string
  dealId: string
  creatorId: string
  round: number
  url: string | null
  fileKey: string | null
  status: string // "PENDING" | "APPROVED" | "CHANGES_REQUESTED"
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
    feedback:
      "Great energy! Can you re-film with the product more visible in frame?",
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
