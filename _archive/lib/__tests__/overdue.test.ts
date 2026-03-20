import { describe, it, expect } from "vitest";
import { DealStage } from "@prisma/client";
import { isOverdue } from "../overdue";

const PAST = new Date(Date.now() - 1000 * 60 * 60 * 24); // 24h ago
const FUTURE = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h from now

describe("isOverdue", () => {
  it("returns true for past deadline + active stage", () => {
    expect(isOverdue({ deadline: PAST, stage: DealStage.BRIEF_RECEIVED })).toBe(true);
    expect(isOverdue({ deadline: PAST, stage: DealStage.CREATOR_ASSIGNED })).toBe(true);
    expect(isOverdue({ deadline: PAST, stage: DealStage.CONTRACT_SENT })).toBe(true);
    expect(isOverdue({ deadline: PAST, stage: DealStage.IN_PRODUCTION })).toBe(true);
    expect(isOverdue({ deadline: PAST, stage: DealStage.PENDING_APPROVAL })).toBe(true);
    expect(isOverdue({ deadline: PAST, stage: DealStage.PAYMENT_PENDING })).toBe(true);
  });

  it("returns false for past deadline + LIVE stage", () => {
    expect(isOverdue({ deadline: PAST, stage: DealStage.LIVE })).toBe(false);
  });

  it("returns false for past deadline + CLOSED stage", () => {
    expect(isOverdue({ deadline: PAST, stage: DealStage.CLOSED })).toBe(false);
  });

  it("returns false when deadline is in the future", () => {
    expect(isOverdue({ deadline: FUTURE, stage: DealStage.IN_PRODUCTION })).toBe(false);
    expect(isOverdue({ deadline: FUTURE, stage: DealStage.BRIEF_RECEIVED })).toBe(false);
  });

  it("returns false when deadline is null", () => {
    expect(isOverdue({ deadline: null, stage: DealStage.IN_PRODUCTION })).toBe(false);
    expect(isOverdue({ deadline: null, stage: DealStage.BRIEF_RECEIVED })).toBe(false);
  });
});
