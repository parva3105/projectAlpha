/**
 * Tests the combined stage-advance business logic:
 * isValidAdvance + SYSTEM_CONTROLLED_STAGES interaction.
 *
 * These mirror what the POST /api/v1/deals/[id]/stage route handler does.
 */
import { describe, it, expect } from "vitest";
import { DealStage } from "@prisma/client";
import {
  isValidAdvance,
  SYSTEM_CONTROLLED_STAGES,
  getPreviousStage,
} from "../stage-transitions";

function canManuallyAdvanceTo(current: DealStage, target: DealStage): { allowed: boolean; reason?: string } {
  if (SYSTEM_CONTROLLED_STAGES.includes(target)) {
    return { allowed: false, reason: "Stage is system-controlled" };
  }
  if (!isValidAdvance(current, target)) {
    return { allowed: false, reason: "Target must be after current stage" };
  }
  return { allowed: true };
}

describe("manual stage advance business logic", () => {
  it("allows BRIEF_RECEIVED → CREATOR_ASSIGNED", () => {
    const result = canManuallyAdvanceTo(DealStage.BRIEF_RECEIVED, DealStage.CREATOR_ASSIGNED);
    expect(result.allowed).toBe(true);
  });

  it("allows forward skipping: BRIEF_RECEIVED → CONTRACT_SENT", () => {
    const result = canManuallyAdvanceTo(DealStage.BRIEF_RECEIVED, DealStage.CONTRACT_SENT);
    expect(result.allowed).toBe(true);
  });

  it("allows LIVE → PAYMENT_PENDING (after system sets LIVE)", () => {
    const result = canManuallyAdvanceTo(DealStage.LIVE, DealStage.PAYMENT_PENDING);
    expect(result.allowed).toBe(true);
  });

  it("allows PAYMENT_PENDING → CLOSED", () => {
    const result = canManuallyAdvanceTo(DealStage.PAYMENT_PENDING, DealStage.CLOSED);
    expect(result.allowed).toBe(true);
  });

  it("rejects manual advance to PENDING_APPROVAL", () => {
    const result = canManuallyAdvanceTo(DealStage.IN_PRODUCTION, DealStage.PENDING_APPROVAL);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("Stage is system-controlled");
  });

  it("rejects manual advance to LIVE", () => {
    const result = canManuallyAdvanceTo(DealStage.IN_PRODUCTION, DealStage.LIVE);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("Stage is system-controlled");
  });

  it("rejects backward move", () => {
    const result = canManuallyAdvanceTo(DealStage.CONTRACT_SENT, DealStage.BRIEF_RECEIVED);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("Target must be after current stage");
  });

  it("rejects same-stage 'advance'", () => {
    const result = canManuallyAdvanceTo(DealStage.CONTRACT_SENT, DealStage.CONTRACT_SENT);
    expect(result.allowed).toBe(false);
  });
});

describe("reopen business logic (getPreviousStage)", () => {
  // These are already covered in stage-transitions.test.ts but included here
  // as a reference for what the reopen route handler does.
  it("demonstrates: cannot reopen from BRIEF_RECEIVED (getPreviousStage returns null)", () => {
    expect(getPreviousStage(DealStage.BRIEF_RECEIVED)).toBeNull();
  });

  it("demonstrates: reopen from CREATOR_ASSIGNED goes back to BRIEF_RECEIVED", () => {
    expect(getPreviousStage(DealStage.CREATOR_ASSIGNED)).toBe(DealStage.BRIEF_RECEIVED);
  });
});
