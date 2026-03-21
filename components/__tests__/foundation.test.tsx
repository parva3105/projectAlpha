/**
 * Foundation tests for P1-1 — lib utilities and mock data integrity.
 * Components that depend on next/navigation are tested via mocks.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// ── lib/utils ─────────────────────────────────────────────────────────────

import { cn } from '@/lib/utils'

describe('cn()', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('deduplicates conflicting Tailwind classes (last wins)', () => {
    expect(cn('text-sm', 'text-lg')).toBe('text-lg')
  })

  it('handles falsy values without crashing', () => {
    expect(cn('foo', false, undefined, null, 'bar')).toBe('foo bar')
  })
})

// ── lib/stage-transitions.client ──────────────────────────────────────────

import {
  STAGE_ORDER,
  STAGE_LABELS,
  SYSTEM_CONTROLLED_STAGES,
  isValidAdvance,
  getPreviousStage,
  getNextStage,
} from '@/lib/stage-transitions.client'

describe('STAGE_ORDER', () => {
  it('has exactly 8 stages', () => {
    expect(STAGE_ORDER).toHaveLength(8)
  })

  it('starts with BRIEF_RECEIVED and ends with CLOSED', () => {
    expect(STAGE_ORDER[0]).toBe('BRIEF_RECEIVED')
    expect(STAGE_ORDER[STAGE_ORDER.length - 1]).toBe('CLOSED')
  })
})

describe('STAGE_LABELS', () => {
  it('has a label for every stage', () => {
    for (const stage of STAGE_ORDER) {
      expect(STAGE_LABELS[stage]).toBeTruthy()
    }
  })
})

describe('SYSTEM_CONTROLLED_STAGES', () => {
  it('includes PENDING_APPROVAL and LIVE', () => {
    expect(SYSTEM_CONTROLLED_STAGES).toContain('PENDING_APPROVAL')
    expect(SYSTEM_CONTROLLED_STAGES).toContain('LIVE')
  })
})

describe('isValidAdvance()', () => {
  it('returns true for a forward move', () => {
    expect(isValidAdvance('BRIEF_RECEIVED', 'CREATOR_ASSIGNED')).toBe(true)
  })

  it('returns true for a skip-forward move', () => {
    expect(isValidAdvance('BRIEF_RECEIVED', 'IN_PRODUCTION')).toBe(true)
  })

  it('returns false for a backward move', () => {
    expect(isValidAdvance('IN_PRODUCTION', 'CONTRACT_SENT')).toBe(false)
  })

  it('returns false for same stage', () => {
    expect(isValidAdvance('BRIEF_RECEIVED', 'BRIEF_RECEIVED')).toBe(false)
  })

  it('returns false for unknown stage', () => {
    expect(isValidAdvance('BRIEF_RECEIVED', 'UNKNOWN_STAGE')).toBe(false)
  })
})

describe('getPreviousStage()', () => {
  it('returns null for the first stage', () => {
    expect(getPreviousStage('BRIEF_RECEIVED')).toBeNull()
  })

  it('returns correct previous stage', () => {
    expect(getPreviousStage('CREATOR_ASSIGNED')).toBe('BRIEF_RECEIVED')
    expect(getPreviousStage('CLOSED')).toBe('PAYMENT_PENDING')
  })
})

describe('getNextStage()', () => {
  it('returns null for the last stage', () => {
    expect(getNextStage('CLOSED')).toBeNull()
  })

  it('returns correct next stage', () => {
    expect(getNextStage('BRIEF_RECEIVED')).toBe('CREATOR_ASSIGNED')
    expect(getNextStage('PAYMENT_PENDING')).toBe('CLOSED')
  })

  it('returns null for unknown stage', () => {
    expect(getNextStage('UNKNOWN')).toBeNull()
  })
})

// ── lib/overdue.client ────────────────────────────────────────────────────

import { isOverdue } from '@/lib/overdue.client'

describe('isOverdue()', () => {
  it('returns false when deadline is null', () => {
    expect(isOverdue({ deadline: null, stage: 'IN_PRODUCTION' })).toBe(false)
  })

  it('returns false when stage is LIVE', () => {
    expect(
      isOverdue({ deadline: '2020-01-01T00:00:00Z', stage: 'LIVE' })
    ).toBe(false)
  })

  it('returns false when stage is CLOSED', () => {
    expect(
      isOverdue({ deadline: '2020-01-01T00:00:00Z', stage: 'CLOSED' })
    ).toBe(false)
  })

  it('returns true when deadline is in the past and stage is active', () => {
    expect(
      isOverdue({ deadline: '2020-01-01T00:00:00Z', stage: 'IN_PRODUCTION' })
    ).toBe(true)
  })

  it('returns false when deadline is in the future', () => {
    const future = new Date(Date.now() + 86400000).toISOString()
    expect(isOverdue({ deadline: future, stage: 'IN_PRODUCTION' })).toBe(false)
  })
})

// ── lib/mock — shape integrity ────────────────────────────────────────────

import { mockCreators, mockRoster } from '@/lib/mock/creators'
import { mockBrands } from '@/lib/mock/brands'
import { mockDeals } from '@/lib/mock/deals'
import { mockSubmissions } from '@/lib/mock/submissions'
import { mockBriefs } from '@/lib/mock/briefs'

describe('mockCreators', () => {
  it('has 5 creators', () => {
    expect(mockCreators).toHaveLength(5)
  })

  it('each creator has required string fields', () => {
    for (const c of mockCreators) {
      expect(typeof c.id).toBe('string')
      expect(typeof c.name).toBe('string')
      expect(typeof c.handle).toBe('string')
      expect(Array.isArray(c.platforms)).toBe(true)
      expect(Array.isArray(c.nicheTags)).toBe(true)
    }
  })

  it('mockRoster only contains agency creators', () => {
    for (const c of mockRoster) {
      expect(c.agencyClerkId).toBe('test_agency_001')
    }
  })
})

describe('mockBrands', () => {
  it('has 4 brands', () => {
    expect(mockBrands).toHaveLength(4)
  })

  it('each brand has id and name', () => {
    for (const b of mockBrands) {
      expect(typeof b.id).toBe('string')
      expect(typeof b.name).toBe('string')
    }
  })
})

describe('mockDeals', () => {
  it('has 8 deals', () => {
    expect(mockDeals).toHaveLength(8)
  })

  it('every deal has a valid stage', () => {
    for (const d of mockDeals) {
      expect(STAGE_ORDER).toContain(d.stage)
    }
  })

  it('every deal has a brand object', () => {
    for (const d of mockDeals) {
      expect(typeof d.brand.name).toBe('string')
    }
  })

  it('creatorPayout is calculated correctly for all deals', () => {
    for (const d of mockDeals) {
      const expected = d.dealValue * (1 - d.commissionPct / 100)
      expect(d.creatorPayout).toBeCloseTo(expected, 1)
    }
  })

  it('one deal per stage exists across all 8 stages', () => {
    const stages = mockDeals.map((d) => d.stage)
    for (const stage of STAGE_ORDER) {
      expect(stages).toContain(stage)
    }
  })
})

describe('mockSubmissions', () => {
  it('has 3 submissions', () => {
    expect(mockSubmissions).toHaveLength(3)
  })

  it('each submission has a valid status', () => {
    const validStatuses = ['PENDING', 'APPROVED', 'CHANGES_REQUESTED']
    for (const s of mockSubmissions) {
      expect(validStatuses).toContain(s.status)
    }
  })
})

describe('mockBriefs', () => {
  it('has 4 briefs', () => {
    expect(mockBriefs).toHaveLength(4)
  })

  it('each brief has a valid status', () => {
    const validStatuses = ['NEW', 'REVIEWED', 'CONVERTED', 'DECLINED']
    for (const b of mockBriefs) {
      expect(validStatuses).toContain(b.status)
    }
  })
})

