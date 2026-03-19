/**
 * Client-safe stage transition helpers — no @prisma/client import.
 * Used by 'use client' components (KanbanBoard, StageControlPanel, etc.)
 * that cannot import from @prisma/client.
 */

export const STAGE_ORDER = [
  "BRIEF_RECEIVED",
  "CREATOR_ASSIGNED",
  "CONTRACT_SENT",
  "IN_PRODUCTION",
  "PENDING_APPROVAL",
  "LIVE",
  "PAYMENT_PENDING",
  "CLOSED",
] as const;

export type DealStage = (typeof STAGE_ORDER)[number];

export const STAGE_LABELS: Record<DealStage, string> = {
  BRIEF_RECEIVED: "Brief Received",
  CREATOR_ASSIGNED: "Creator Assigned",
  CONTRACT_SENT: "Contract Sent",
  IN_PRODUCTION: "In Production",
  PENDING_APPROVAL: "Pending Approval",
  LIVE: "Live",
  PAYMENT_PENDING: "Payment Pending",
  CLOSED: "Closed",
};

export const SYSTEM_CONTROLLED_STAGES: DealStage[] = [
  "PENDING_APPROVAL",
  "LIVE",
];

export function isValidAdvance(current: DealStage, target: DealStage): boolean {
  const currentIndex = STAGE_ORDER.indexOf(current);
  const targetIndex = STAGE_ORDER.indexOf(target);
  return currentIndex !== -1 && targetIndex !== -1 && targetIndex > currentIndex;
}

export function getPreviousStage(current: DealStage): DealStage | null {
  const currentIndex = STAGE_ORDER.indexOf(current);
  if (currentIndex <= 0) return null;
  return STAGE_ORDER[currentIndex - 1];
}
