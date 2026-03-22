/**
 * P1-2 Agency Core — component tests.
 * Covers: DealCard, SubmissionHistory, StageControlPanel, DealsTable (filter logic).
 * KanbanBoard and DealDetail require dnd-kit + sonner context — those are integration tested via e2e.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

// ── next/navigation mock ─────────────────────────────────────────────────────
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// ── next/link mock ───────────────────────────────────────────────────────────
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string
    children: React.ReactNode
    className?: string
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

// ── sonner mock ──────────────────────────────────────────────────────────────
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// ── Fixtures ─────────────────────────────────────────────────────────────────

const baseDeal = {
  id: 'deal_test',
  agencyClerkId: 'agency_001',
  brandId: 'brand_001',
  creatorId: 'creator_001',
  briefId: null,
  title: 'Test Deal Title',
  stage: 'IN_PRODUCTION',
  dealValue: 5000,
  commissionPct: 20,
  creatorPayout: 4000,
  deadline: '2099-12-31T00:00:00Z',
  contractStatus: 'SIGNED',
  contractUrl: null,
  paymentStatus: 'PENDING',
  notes: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  // platform kept for DealsTable (still typed MockDeal); DealCard no longer renders it
  platform: 'Instagram',
  brand: { id: 'brand_001', name: 'Acme Corp', website: 'https://acme.com' },
  creator: { id: 'creator_001', name: 'Jane Doe', handle: 'janedoe', avatarUrl: null },
}

const overdueDeal = {
  ...baseDeal,
  id: 'deal_overdue',
  deadline: '2020-01-01T00:00:00Z',
  stage: 'IN_PRODUCTION',
}

const noCreatorDeal = {
  ...baseDeal,
  id: 'deal_no_creator',
  creator: null,
  creatorId: null,
}

// ── DealCard ─────────────────────────────────────────────────────────────────

import { DealCard } from '@/components/kanban/DealCard'

describe('DealCard', () => {
  it('renders deal title', () => {
    render(<DealCard deal={baseDeal} />)
    expect(screen.getByText('Test Deal Title')).toBeTruthy()
  })

  it('renders brand name', () => {
    render(<DealCard deal={baseDeal} />)
    expect(screen.getByText('Acme Corp')).toBeTruthy()
  })

  it('renders creator name when assigned', () => {
    render(<DealCard deal={baseDeal} />)
    expect(screen.getByText('Jane Doe')).toBeTruthy()
  })

  it('renders "Unassigned" when no creator', () => {
    render(<DealCard deal={noCreatorDeal} />)
    expect(screen.getByText('Unassigned')).toBeTruthy()
  })

  it('renders deal value formatted', () => {
    render(<DealCard deal={baseDeal} />)
    expect(screen.getByText('$5,000.00')).toBeTruthy()
  })

  it('does NOT show Overdue badge when deadline is in the future', () => {
    render(<DealCard deal={baseDeal} />)
    expect(screen.queryByText('Overdue')).toBeNull()
  })

  it('shows Overdue badge when past deadline and not terminal stage', () => {
    render(<DealCard deal={overdueDeal} />)
    expect(screen.getByText('Overdue')).toBeTruthy()
  })

  it('wraps content in a link to /deals/[id]', () => {
    render(<DealCard deal={baseDeal} />)
    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe('/deals/deal_test')
  })
})

// ── SubmissionHistory ─────────────────────────────────────────────────────────

import { SubmissionHistory } from '@/components/deals/SubmissionHistory'

const submissions = [
  {
    id: 'sub_001',
    dealId: 'deal_test',
    creatorId: 'creator_001',
    round: 1,
    url: 'https://example.com/video1',
    fileKey: null,
    status: 'CHANGES_REQUESTED',
    feedback: 'Please reshoot the opening.',
    submittedAt: '2026-03-01T10:00:00Z',
    reviewedAt: '2026-03-02T09:00:00Z',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-02T09:00:00Z',
  },
  {
    id: 'sub_002',
    dealId: 'deal_test',
    creatorId: 'creator_001',
    round: 2,
    url: 'https://example.com/video2',
    fileKey: null,
    status: 'APPROVED',
    feedback: null,
    submittedAt: '2026-03-05T10:00:00Z',
    reviewedAt: '2026-03-06T09:00:00Z',
    createdAt: '2026-03-05T10:00:00Z',
    updatedAt: '2026-03-06T09:00:00Z',
  },
]

describe('SubmissionHistory', () => {
  it('renders "No submissions yet." when empty', () => {
    render(<SubmissionHistory submissions={[]} />)
    expect(screen.getByText('No submissions yet.')).toBeTruthy()
  })

  it('renders a row for each submission', () => {
    render(<SubmissionHistory submissions={submissions} />)
    expect(screen.getByText('#1')).toBeTruthy()
    expect(screen.getByText('#2')).toBeTruthy()
  })

  it('renders APPROVED status badge', () => {
    render(<SubmissionHistory submissions={submissions} />)
    expect(screen.getByText('Approved')).toBeTruthy()
  })

  it('renders CHANGES_REQUESTED status badge', () => {
    render(<SubmissionHistory submissions={submissions} />)
    expect(screen.getByText('Changes Requested')).toBeTruthy()
  })

  it('renders feedback text when present', () => {
    render(<SubmissionHistory submissions={submissions} />)
    expect(screen.getByText('Please reshoot the opening.')).toBeTruthy()
  })
})

// ── StageControlPanel ─────────────────────────────────────────────────────────

import { StageControlPanel } from '@/components/deals/StageControlPanel'

describe('StageControlPanel', () => {
  it('shows the current stage badge', () => {
    const onDealChange = vi.fn()
    render(<StageControlPanel deal={baseDeal} onDealChange={onDealChange} />)
    expect(screen.getByText('In Production')).toBeTruthy()
  })

  it('hides Reopen button at BRIEF_RECEIVED', () => {
    const deal = { ...baseDeal, stage: 'BRIEF_RECEIVED' }
    render(<StageControlPanel deal={deal} onDealChange={vi.fn()} />)
    expect(screen.queryByText(/Reopen/i)).toBeNull()
  })

  it('shows Reopen button when not at BRIEF_RECEIVED', () => {
    render(<StageControlPanel deal={baseDeal} onDealChange={vi.fn()} />)
    expect(screen.getByText(/Reopen/i)).toBeTruthy()
  })

  it('shows system-controlled notice when stage is PENDING_APPROVAL', () => {
    const deal = { ...baseDeal, stage: 'PENDING_APPROVAL' }
    render(<StageControlPanel deal={deal} onDealChange={vi.fn()} />)
    expect(screen.getByText(/system-controlled/i)).toBeTruthy()
  })

  it('does not show system-controlled notice on a manual stage', () => {
    render(<StageControlPanel deal={baseDeal} onDealChange={vi.fn()} />)
    expect(screen.queryByText(/system-controlled/i)).toBeNull()
  })

  it('does not offer PENDING_APPROVAL or LIVE in the advance dropdown', () => {
    render(<StageControlPanel deal={baseDeal} onDealChange={vi.fn()} />)
    // The select options for system-controlled stages should not appear as selectable options
    const select = screen.getByRole('combobox')
    const options = Array.from(select.querySelectorAll('option')).map(
      (o) => o.textContent
    )
    expect(options).not.toContain('Pending Approval')
    expect(options).not.toContain('Live')
  })
})

// ── DealsTable — filter logic ─────────────────────────────────────────────────

import { DealsTable } from '@/components/deals/DealsTable'
import { mockDeals } from '@/lib/mock/deals'

describe('DealsTable', () => {
  it('renders all deals by default', () => {
    render(<DealsTable initialDeals={mockDeals} />)
    // Every deal title should appear
    for (const deal of mockDeals) {
      expect(screen.getByText(deal.title)).toBeTruthy()
    }
  })

  it('renders "No deals found." when given an empty array', () => {
    render(<DealsTable initialDeals={[]} />)
    expect(screen.getByText('No deals found.')).toBeTruthy()
  })

  it('renders brand name for each deal', () => {
    render(<DealsTable initialDeals={[baseDeal]} />)
    expect(screen.getByText('Acme Corp')).toBeTruthy()
  })

  it('renders "Unassigned" for deals with no creator', () => {
    render(<DealsTable initialDeals={[noCreatorDeal]} />)
    expect(screen.getByText('Unassigned')).toBeTruthy()
  })

  it('renders deal value and payout formatted as dollars', () => {
    render(<DealsTable initialDeals={[baseDeal]} />)
    expect(screen.getByText('$5,000.00')).toBeTruthy()
    expect(screen.getByText('$4,000.00')).toBeTruthy()
  })

  it('links each deal title to /deals/[id]', () => {
    render(<DealsTable initialDeals={[baseDeal]} />)
    const link = screen.getByText('Test Deal Title').closest('a')
    expect(link?.getAttribute('href')).toBe('/deals/deal_test')
  })

  it('has a New Deal link', () => {
    render(<DealsTable initialDeals={[]} />)
    const newDealLink = screen.getByText('New Deal')
    expect(newDealLink).toBeTruthy()
  })

  it('renders both overdue and non-overdue deals before any filter', () => {
    const futureDeadlineDeal = {
      ...baseDeal,
      id: 'deal_future',
      title: 'Future Deadline Deal',
      deadline: '2099-12-31T00:00:00Z',
    }
    const pastDeadlineDeal = {
      ...baseDeal,
      id: 'deal_past',
      title: 'Past Deadline Deal',
      deadline: '2020-01-01T00:00:00Z',
    }
    render(<DealsTable initialDeals={[futureDeadlineDeal, pastDeadlineDeal]} />)
    expect(screen.getByText('Future Deadline Deal')).toBeTruthy()
    expect(screen.getByText('Past Deadline Deal')).toBeTruthy()
  })

  it('renders the overdue-only checkbox control', () => {
    render(<DealsTable initialDeals={mockDeals} />)
    expect(screen.getByText('Overdue only')).toBeTruthy()
    // base-ui Checkbox renders a span[role=checkbox]
    expect(screen.getByRole('checkbox')).toBeTruthy()
  })
})

// ── Dollar formatting check ───────────────────────────────────────────────────

describe('formatDollars (via DealCard)', () => {
  it('formats zero correctly', () => {
    const deal = { ...baseDeal, dealValue: 0 }
    render(<DealCard deal={deal} />)
    expect(screen.getByText('$0.00')).toBeTruthy()
  })

  it('formats large values with commas', () => {
    const deal = { ...baseDeal, dealValue: 12500 }
    render(<DealCard deal={deal} />)
    expect(screen.getByText('$12,500.00')).toBeTruthy()
  })
})
