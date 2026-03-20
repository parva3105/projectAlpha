import { DealStage } from "@prisma/client";

/**
 * Canonical stage order — used for all forward/backward transition validation.
 * Mirrors the Prisma DealStage enum exactly.
 */
export const STAGE_ORDER: DealStage[] = [
  DealStage.BRIEF_RECEIVED,
  DealStage.CREATOR_ASSIGNED,
  DealStage.CONTRACT_SENT,
  DealStage.IN_PRODUCTION,
  DealStage.PENDING_APPROVAL,
  DealStage.LIVE,
  DealStage.PAYMENT_PENDING,
  DealStage.CLOSED,
];

/**
 * These two stages are set exclusively by the system (content submission events).
 * Manual advance to either of these must be rejected with 422.
 */
export const SYSTEM_CONTROLLED_STAGES: DealStage[] = [
  DealStage.PENDING_APPROVAL,
  DealStage.LIVE,
];

/**
 * Returns true when `target` is strictly after `current` in the stage order.
 * Forward skipping is allowed — any stage after current is valid.
 */
export function isValidAdvance(
  current: DealStage,
  target: DealStage
): boolean {
  const currentIndex = STAGE_ORDER.indexOf(current);
  const targetIndex = STAGE_ORDER.indexOf(target);
  return currentIndex !== -1 && targetIndex !== -1 && targetIndex > currentIndex;
}

/**
 * Returns the stage immediately before `current`, or null if `current` is the
 * first stage (BRIEF_RECEIVED). Used by the Reopen endpoint.
 */
export function getPreviousStage(current: DealStage): DealStage | null {
  const currentIndex = STAGE_ORDER.indexOf(current);
  if (currentIndex <= 0) return null;
  return STAGE_ORDER[currentIndex - 1];
}
