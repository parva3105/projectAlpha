import { DealStage } from '@prisma/client'

export const STAGE_ORDER: DealStage[] = [
  'BRIEF_RECEIVED',
  'CREATOR_ASSIGNED',
  'CONTRACT_SENT',
  'IN_PRODUCTION',
  'PENDING_APPROVAL',
  'LIVE',
  'PAYMENT_PENDING',
  'CLOSED',
]

export const SYSTEM_CONTROLLED: DealStage[] = ['PENDING_APPROVAL', 'LIVE']

/**
 * Returns true if advancing from `from` to `to` is a valid manual transition.
 * Forward skipping is allowed. PENDING_APPROVAL and LIVE are system-only.
 */
export function isValidAdvance(from: DealStage, to: DealStage): boolean {
  return (
    STAGE_ORDER.indexOf(to) > STAGE_ORDER.indexOf(from) &&
    !SYSTEM_CONTROLLED.includes(to)
  )
}

/**
 * Returns the stage immediately before `stage`, or null if already at the first stage.
 */
export function getPreviousStage(stage: DealStage): DealStage | null {
  const i = STAGE_ORDER.indexOf(stage)
  return i > 0 ? STAGE_ORDER[i - 1] : null
}
