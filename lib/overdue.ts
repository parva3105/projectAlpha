import { DealStage } from "@prisma/client";

/**
 * Terminal stages — a deal in one of these stages is never considered overdue
 * even if its deadline has passed, since it is effectively complete or live.
 */
const NON_OVERDUE_STAGES: DealStage[] = [DealStage.LIVE, DealStage.CLOSED];

/**
 * Returns true when a deal has a deadline that is in the past AND its stage
 * is not LIVE or CLOSED.
 *
 * Returns false when:
 * - deadline is null (no deadline set)
 * - deadline is in the future
 * - stage is LIVE or CLOSED (deal is complete)
 */
export function isOverdue(deal: {
  deadline: Date | null;
  stage: DealStage;
}): boolean {
  if (deal.deadline === null) return false;
  if (NON_OVERDUE_STAGES.includes(deal.stage)) return false;
  return deal.deadline < new Date();
}
