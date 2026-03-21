/**
 * Component tests for P1-3 through P1-6.
 * Covers: RosterTable, BrandsTable, BriefsTable, CreatorCard,
 *         CreatorDealDetail, CreatorProfileEditor.
 *
 * Note: Components using next/navigation or dialog primitives are
 * tested with mocks. shadcn components backed by @base-ui/react
 * are not easily rendered in happy-dom, so interaction tests focus
 * on what renders without opening dialogs.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import React from 'react'

// ── Next.js mocks ──────────────────────────────────────────────────────────
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
}))
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

// ── Mock data ──────────────────────────────────────────────────────────────
import { mockRoster, mockCreators } from '@/lib/mock/creators'
import { mockDeals } from '@/lib/mock/deals'
import { mockBrands } from '@/lib/mock/brands'
import { mockBriefs } from '@/lib/mock/briefs'
import { mockSubmissions } from '@/lib/mock/submissions'

// ── RosterTable ────────────────────────────────────────────────────────────
import { RosterTable } from '@/components/roster/RosterTable'

describe('RosterTable', () => {
  it('renders a row per roster creator', () => {
    render(<RosterTable initialCreators={mockRoster} deals={mockDeals} />)
    for (const creator of mockRoster) {
      expect(screen.getByText(creator.name)).toBeInTheDocument()
    }
  })

  it('shows formatted follower counts', () => {
    render(<RosterTable initialCreators={mockRoster} deals={mockDeals} />)
    // Aria Chen has 185000 → 185K
    expect(screen.getByText('185K')).toBeInTheDocument()
    // Marcus Webb has 430000 → 430K
    expect(screen.getByText('430K')).toBeInTheDocument()
  })

  it('shows handles in @handle format', () => {
    render(<RosterTable initialCreators={mockRoster} deals={mockDeals} />)
    expect(screen.getByText('@aria.chen')).toBeInTheDocument()
  })

  it('shows empty state when no creators', () => {
    render(<RosterTable initialCreators={[]} deals={[]} />)
    expect(
      screen.getByText(/your roster is empty/i)
    ).toBeInTheDocument()
  })

  it('shows Add Creator button', () => {
    render(<RosterTable initialCreators={mockRoster} deals={mockDeals} />)
    expect(screen.getByRole('button', { name: /add creator/i })).toBeInTheDocument()
  })

  it('shows first niche tags as badges', () => {
    render(<RosterTable initialCreators={mockRoster} deals={mockDeals} />)
    // Aria Chen has tags: Wellness, Fitness, Lifestyle
    expect(screen.getByText('Wellness')).toBeInTheDocument()
  })
})

// ── BrandsTable ────────────────────────────────────────────────────────────
import { BrandsTable } from '@/components/brands/BrandsTable'

describe('BrandsTable', () => {
  it('renders a row per brand', () => {
    render(<BrandsTable initialBrands={mockBrands} deals={mockDeals} />)
    for (const brand of mockBrands) {
      expect(screen.getByText(brand.name)).toBeInTheDocument()
    }
  })

  it('shows "—" for brand with no website', () => {
    render(<BrandsTable initialBrands={mockBrands} deals={mockDeals} />)
    // "Harvest & Co" has no website
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('shows Add Brand button', () => {
    render(<BrandsTable initialBrands={mockBrands} deals={mockDeals} />)
    expect(screen.getByRole('button', { name: /add brand/i })).toBeInTheDocument()
  })

  it('shows empty state when no brands', () => {
    render(<BrandsTable initialBrands={[]} deals={[]} />)
    expect(screen.getByText(/no brands yet/i)).toBeInTheDocument()
  })

  it('calculates total deal value correctly', () => {
    // brand_001 has deal_001 (3500), deal_004 (2200), deal_008 (7500)
    render(<BrandsTable initialBrands={mockBrands} deals={mockDeals} />)
    // Total for Lumina Beauty: 3500 + 2200 + 7500 = 13200
    expect(screen.getByText('$13,200')).toBeInTheDocument()
  })
})

// ── BriefsTable ────────────────────────────────────────────────────────────
import { BriefsTable } from '@/components/briefs/BriefsTable'

describe('BriefsTable', () => {
  it('renders all briefs by default', () => {
    render(<BriefsTable initialBriefs={mockBriefs} />)
    for (const brief of mockBriefs) {
      expect(screen.getByText(brief.title)).toBeInTheDocument()
    }
  })

  it('shows budget in formatted $X,XXX format', () => {
    render(<BriefsTable initialBriefs={mockBriefs} />)
    // brief_001 has budget 12000
    expect(screen.getByText('$12,000')).toBeInTheDocument()
  })

  it('shows submitted-by names', () => {
    render(<BriefsTable initialBriefs={mockBriefs} />)
    // Rachel Kim appears twice (briefs 001 and 003) — use getAllBy
    expect(screen.getAllByText('Rachel Kim').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Tom Bradley')).toBeInTheDocument()
  })

  it('shows empty state when no briefs provided', () => {
    render(<BriefsTable initialBriefs={[]} />)
    expect(screen.getByText(/no briefs yet/i)).toBeInTheDocument()
  })
})

// ── CreatorCard ────────────────────────────────────────────────────────────
import { CreatorCard } from '@/components/creator/CreatorCard'

describe('CreatorCard', () => {
  const creator = mockCreators[0] // Aria Chen

  it('renders creator name and handle', () => {
    render(<CreatorCard creator={creator} />)
    expect(screen.getByText('Aria Chen')).toBeInTheDocument()
    expect(screen.getByText('@aria.chen')).toBeInTheDocument()
  })

  it('links to /creators/:handle', () => {
    render(<CreatorCard creator={creator} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/creators/aria.chen')
  })

  it('renders platform badges', () => {
    render(<CreatorCard creator={creator} />)
    expect(screen.getByText('Instagram')).toBeInTheDocument()
    expect(screen.getByText('TikTok')).toBeInTheDocument()
  })

  it('renders formatted followers', () => {
    render(<CreatorCard creator={creator} />)
    expect(screen.getByText(/185K followers/)).toBeInTheDocument()
  })

  it('shows initials as avatar', () => {
    render(<CreatorCard creator={creator} />)
    expect(screen.getByText('AC')).toBeInTheDocument()
  })

  it('renders niche tags up to 3', () => {
    render(<CreatorCard creator={creator} />)
    // Aria has: Wellness, Lifestyle, Fitness — all 3 shown
    expect(screen.getByText('Wellness')).toBeInTheDocument()
    expect(screen.getByText('Lifestyle')).toBeInTheDocument()
    expect(screen.getByText('Fitness')).toBeInTheDocument()
  })
})

// ── CreatorDealDetail ──────────────────────────────────────────────────────
import { CreatorDealDetail } from '@/components/creator/CreatorDealDetail'

describe('CreatorDealDetail', () => {
  const deal = mockDeals.find(d => d.id === 'deal_002')! // Aria Chen's deal
  const submissions = mockSubmissions.filter(s => s.dealId === 'deal_002')

  it('renders deal title and brand name', () => {
    render(<CreatorDealDetail initialDeal={deal} initialSubmissions={submissions} />)
    expect(screen.getByText('Summer Fitness Campaign')).toBeInTheDocument()
    expect(screen.getByText('PeakFit Gear')).toBeInTheDocument()
  })

  it('renders creator payout prominently in font-mono', () => {
    render(<CreatorDealDetail initialDeal={deal} initialSubmissions={submissions} />)
    expect(screen.getByText('$4,250')).toBeInTheDocument()
  })

  it('NEVER renders dealValue or commissionPct directly', () => {
    render(<CreatorDealDetail initialDeal={deal} initialSubmissions={submissions} />)
    // dealValue is 5000, commissionPct is 15 — should not be visible as labels
    expect(screen.queryByText('Commission')).not.toBeInTheDocument()
    expect(screen.queryByText('Deal Value')).not.toBeInTheDocument()
    expect(screen.queryByText('15%')).not.toBeInTheDocument()
  })

  it('shows empty submission history text when no submissions', () => {
    render(<CreatorDealDetail initialDeal={deal} initialSubmissions={[]} />)
    expect(screen.getByText(/no submissions yet/i)).toBeInTheDocument()
  })

  it('does NOT show submission form for CLOSED deal', () => {
    const closedDeal = mockDeals.find(d => d.stage === 'CLOSED')!
    const closedSubs = mockSubmissions.filter(s => s.dealId === closedDeal.id)
    render(<CreatorDealDetail initialDeal={closedDeal} initialSubmissions={closedSubs} />)
    expect(screen.queryByText(/submit content/i)).not.toBeInTheDocument()
  })

  it('shows submission form for IN_PRODUCTION deal', () => {
    const inProdDeal = mockDeals.find(d => d.stage === 'IN_PRODUCTION')!
    const inProdSubs = mockSubmissions.filter(s => s.dealId === inProdDeal.id)
    render(<CreatorDealDetail initialDeal={inProdDeal} initialSubmissions={inProdSubs} />)
    // "Submit Content" appears as section heading and button — at least one match
    expect(screen.getAllByText(/submit content/i).length).toBeGreaterThanOrEqual(1)
  })
})

// ── CreatorProfileEditor ───────────────────────────────────────────────────
import { CreatorProfileEditor } from '@/components/creator/CreatorProfileEditor'

describe('CreatorProfileEditor', () => {
  const creator = mockCreators.find(c => c.id === 'creator_001')!

  it('renders creator name in input', () => {
    render(<CreatorProfileEditor initialCreator={creator} />)
    const input = screen.getByLabelText(/display name/i)
    expect(input).toHaveValue('Aria Chen')
  })

  it('renders handle as readonly', () => {
    render(<CreatorProfileEditor initialCreator={creator} />)
    const handleInput = screen.getByLabelText(/handle/i)
    expect(handleInput).toBeDisabled()
    expect(handleInput).toHaveValue('aria.chen')
  })

  it('renders existing niche tags as removable badges', () => {
    render(<CreatorProfileEditor initialCreator={creator} />)
    expect(screen.getByText('Wellness')).toBeInTheDocument()
    expect(screen.getByText('Lifestyle')).toBeInTheDocument()
    expect(screen.getByText('Fitness')).toBeInTheDocument()
  })

  it('shows Save Profile button', () => {
    render(<CreatorProfileEditor initialCreator={creator} />)
    expect(screen.getByRole('button', { name: /save profile/i })).toBeInTheDocument()
  })

  it('renders upload avatar placeholder text', () => {
    render(<CreatorProfileEditor initialCreator={creator} />)
    expect(screen.getByText(/upload avatar/i)).toBeInTheDocument()
  })

  it('renders initials avatar', () => {
    render(<CreatorProfileEditor initialCreator={creator} />)
    expect(screen.getByText('AC')).toBeInTheDocument()
  })
})
