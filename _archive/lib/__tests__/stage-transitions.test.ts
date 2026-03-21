import { describe, it, expect } from "vitest";
import { DealStage } from "@prisma/client";
import {
  STAGE_ORDER,
  SYSTEM_CONTROLLED_STAGES,
  isValidAdvance,
  getPreviousStage,
} from "../stage-transitions";

describe("STAGE_ORDER", () => {
  it("contains all 8 stages in the correct order", () => {
    expect(STAGE_ORDER).toEqual([
      DealStage.BRIEF_RECEIVED,
      DealStage.CREATOR_ASSIGNED,
      DealStage.CONTRACT_SENT,
      DealStage.IN_PRODUCTION,
      DealStage.PENDING_APPROVAL,
      DealStage.LIVE,
      DealStage.PAYMENT_PENDING,
      DealStage.CLOSED,
    ]);
  });
});

describe("SYSTEM_CONTROLLED_STAGES", () => {
  it("contains PENDING_APPROVAL and LIVE", () => {
    expect(SYSTEM_CONTROLLED_STAGES).toContain(DealStage.PENDING_APPROVAL);
    expect(SYSTEM_CONTROLLED_STAGES).toContain(DealStage.LIVE);
    expect(SYSTEM_CONTROLLED_STAGES).toHaveLength(2);
  });
});

describe("isValidAdvance", () => {
  it("allows one-step forward advance", () => {
    expect(isValidAdvance(DealStage.BRIEF_RECEIVED, DealStage.CREATOR_ASSIGNED)).toBe(true);
    expect(isValidAdvance(DealStage.CREATOR_ASSIGNED, DealStage.CONTRACT_SENT)).toBe(true);
    expect(isValidAdvance(DealStage.CONTRACT_SENT, DealStage.IN_PRODUCTION)).toBe(true);
    expect(isValidAdvance(DealStage.IN_PRODUCTION, DealStage.PENDING_APPROVAL)).toBe(true);
    expect(isValidAdvance(DealStage.PENDING_APPROVAL, DealStage.LIVE)).toBe(true);
    expect(isValidAdvance(DealStage.LIVE, DealStage.PAYMENT_PENDING)).toBe(true);
    expect(isValidAdvance(DealStage.PAYMENT_PENDING, DealStage.CLOSED)).toBe(true);
  });

  it("allows forward skipping (non-adjacent)", () => {
    expect(isValidAdvance(DealStage.BRIEF_RECEIVED, DealStage.CONTRACT_SENT)).toBe(true);
    expect(isValidAdvance(DealStage.BRIEF_RECEIVED, DealStage.IN_PRODUCTION)).toBe(true);
    expect(isValidAdvance(DealStage.BRIEF_RECEIVED, DealStage.CLOSED)).toBe(true);
    expect(isValidAdvance(DealStage.CONTRACT_SENT, DealStage.PAYMENT_PENDING)).toBe(true);
  });

  it("rejects backward moves", () => {
    expect(isValidAdvance(DealStage.CREATOR_ASSIGNED, DealStage.BRIEF_RECEIVED)).toBe(false);
    expect(isValidAdvance(DealStage.CONTRACT_SENT, DealStage.CREATOR_ASSIGNED)).toBe(false);
    expect(isValidAdvance(DealStage.CLOSED, DealStage.PAYMENT_PENDING)).toBe(false);
    expect(isValidAdvance(DealStage.LIVE, DealStage.BRIEF_RECEIVED)).toBe(false);
  });

  it("rejects same-stage transitions", () => {
    expect(isValidAdvance(DealStage.BRIEF_RECEIVED, DealStage.BRIEF_RECEIVED)).toBe(false);
    expect(isValidAdvance(DealStage.LIVE, DealStage.LIVE)).toBe(false);
    expect(isValidAdvance(DealStage.CLOSED, DealStage.CLOSED)).toBe(false);
  });
});

describe("getPreviousStage", () => {
  it("returns null for BRIEF_RECEIVED (first stage)", () => {
    expect(getPreviousStage(DealStage.BRIEF_RECEIVED)).toBeNull();
  });

  it("returns the correct previous stage for each stage", () => {
    expect(getPreviousStage(DealStage.CREATOR_ASSIGNED)).toBe(DealStage.BRIEF_RECEIVED);
    expect(getPreviousStage(DealStage.CONTRACT_SENT)).toBe(DealStage.CREATOR_ASSIGNED);
    expect(getPreviousStage(DealStage.IN_PRODUCTION)).toBe(DealStage.CONTRACT_SENT);
    expect(getPreviousStage(DealStage.PENDING_APPROVAL)).toBe(DealStage.IN_PRODUCTION);
    expect(getPreviousStage(DealStage.LIVE)).toBe(DealStage.PENDING_APPROVAL);
    expect(getPreviousStage(DealStage.PAYMENT_PENDING)).toBe(DealStage.LIVE);
    expect(getPreviousStage(DealStage.CLOSED)).toBe(DealStage.PAYMENT_PENDING);
  });

  it("moves exactly one step back (not multiple)", () => {
    // CLOSED goes back to PAYMENT_PENDING, not LIVE or anything earlier
    const prev = getPreviousStage(DealStage.CLOSED);
    expect(prev).toBe(DealStage.PAYMENT_PENDING);
    expect(prev).not.toBe(DealStage.LIVE);
  });
});
