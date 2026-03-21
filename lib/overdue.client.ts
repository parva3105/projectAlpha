const NON_OVERDUE_STAGES = ["LIVE", "CLOSED"]

export function isOverdue(deal: { deadline: string | null; stage: string }): boolean {
  if (!deal.deadline) return false
  if (NON_OVERDUE_STAGES.includes(deal.stage)) return false
  return new Date(deal.deadline) < new Date()
}
