import { describe, it, expect } from 'vitest'
import { isValidAdvance, getPreviousStage, STAGE_ORDER, SYSTEM_CONTROLLED } from '@/lib/stage-transitions'
import type { DealStage } from '@prisma/client'

describe('isValidAdvance', () => {
  it('allows valid forward advance', () => {
    expect(isValidAdvance('BRIEF_RECEIVED', 'CREATOR_ASSIGNED')).toBe(true)
    expect(isValidAdvance('CREATOR_ASSIGNED', 'CONTRACT_SENT')).toBe(true)
    expect(isValidAdvance('IN_PRODUCTION', 'PAYMENT_PENDING')).toBe(true)
  })

  it('allows forward skipping (non-adjacent)', () => {
    expect(isValidAdvance('BRIEF_RECEIVED', 'CONTRACT_SENT')).toBe(true)
    expect(isValidAdvance('BRIEF_RECEIVED', 'IN_PRODUCTION')).toBe(true)
  })

  it('rejects system-controlled target stages', () => {
    expect(isValidAdvance('IN_PRODUCTION', 'PENDING_APPROVAL')).toBe(false)
    expect(isValidAdvance('PENDING_APPROVAL', 'LIVE')).toBe(false)
  })

  it('rejects backward movement', () => {
    expect(isValidAdvance('CONTRACT_SENT', 'CREATOR_ASSIGNED')).toBe(false)
    expect(isValidAdvance('CLOSED', 'BRIEF_RECEIVED')).toBe(false)
  })

  it('rejects same stage', () => {
    expect(isValidAdvance('BRIEF_RECEIVED', 'BRIEF_RECEIVED')).toBe(false)
  })

  it('SYSTEM_CONTROLLED contains PENDING_APPROVAL and LIVE', () => {
    expect(SYSTEM_CONTROLLED).toContain('PENDING_APPROVAL' as DealStage)
    expect(SYSTEM_CONTROLLED).toContain('LIVE' as DealStage)
  })
})

describe('getPreviousStage', () => {
  it('returns the previous stage', () => {
    expect(getPreviousStage('CREATOR_ASSIGNED')).toBe('BRIEF_RECEIVED')
    expect(getPreviousStage('CONTRACT_SENT')).toBe('CREATOR_ASSIGNED')
    expect(getPreviousStage('CLOSED')).toBe('PAYMENT_PENDING')
  })

  it('returns null for first stage', () => {
    expect(getPreviousStage('BRIEF_RECEIVED')).toBe(null)
  })
})

describe('STAGE_ORDER', () => {
  it('has 8 stages in correct order', () => {
    expect(STAGE_ORDER).toHaveLength(8)
    expect(STAGE_ORDER[0]).toBe('BRIEF_RECEIVED')
    expect(STAGE_ORDER[7]).toBe('CLOSED')
  })
})
