/**
 * Client-safe stage transition helpers — no @prisma/client import.
 * Uses string literals instead of Prisma enum types.
 * Used by 'use client' components (KanbanBoard, StageControlPanel, etc.)
 */

export const STAGE_ORDER: string[] = [
  "BRIEF_RECEIVED",
  "CREATOR_ASSIGNED",
  "CONTRACT_SENT",
  "IN_PRODUCTION",
  "PENDING_APPROVAL",
  "LIVE",
  "PAYMENT_PENDING",
  "CLOSED",
]

export const SYSTEM_CONTROLLED_STAGES: string[] = ["PENDING_APPROVAL", "LIVE"]

export const STAGE_LABELS: Record<string, string> = {
  BRIEF_RECEIVED: "Brief Received",
  CREATOR_ASSIGNED: "Creator Assigned",
  CONTRACT_SENT: "Contract Sent",
  IN_PRODUCTION: "In Production",
  PENDING_APPROVAL: "Pending Approval",
  LIVE: "Live",
  PAYMENT_PENDING: "Payment Pending",
  CLOSED: "Closed",
}

export function isValidAdvance(current: string, target: string): boolean {
  const currentIndex = STAGE_ORDER.indexOf(current)
  const targetIndex = STAGE_ORDER.indexOf(target)
  return currentIndex !== -1 && targetIndex !== -1 && targetIndex > currentIndex
}

export function getPreviousStage(current: string): string | null {
  const currentIndex = STAGE_ORDER.indexOf(current)
  if (currentIndex <= 0) return null
  return STAGE_ORDER[currentIndex - 1]
}

export function getNextStage(current: string): string | null {
  const currentIndex = STAGE_ORDER.indexOf(current)
  if (currentIndex === -1 || currentIndex >= STAGE_ORDER.length - 1) return null
  return STAGE_ORDER[currentIndex + 1]
}
