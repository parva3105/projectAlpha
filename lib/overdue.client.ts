/**
 * Client-safe overdue check — no @prisma/client import.
 * Used by 'use client' components that cannot import from @prisma/client.
 */

const NON_OVERDUE_STAGES = ["LIVE", "CLOSED"] as const;

export function isOverdue(deal: {
  deadline: string | Date | null;
  stage: string;
}): boolean {
  if (!deal.deadline) return false;
  if ((NON_OVERDUE_STAGES as readonly string[]).includes(deal.stage)) return false;
  const deadlineDate = typeof deal.deadline === "string" ? new Date(deal.deadline) : deal.deadline;
  return deadlineDate < new Date();
}
