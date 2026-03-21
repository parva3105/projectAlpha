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
