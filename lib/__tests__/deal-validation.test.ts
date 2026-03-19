import { describe, it, expect } from "vitest";
import { CreateDealSchema, UpdateDealSchema, AdvanceStageSchema } from "../validations/deal";

describe("CreateDealSchema", () => {
  const validInput = {
    title: "Nike Summer Campaign",
    brandId: "brand_123",
    dealValue: 1500.0,
    commissionPct: 20,
  };

  it("accepts a valid minimal payload", () => {
    const result = CreateDealSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("accepts optional fields", () => {
    const result = CreateDealSchema.safeParse({
      ...validInput,
      creatorId: "creator_456",
      deadline: "2026-06-01",
      notes: "Internal notes here",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = CreateDealSchema.safeParse({ ...validInput, title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing brandId", () => {
    const result = CreateDealSchema.safeParse({ ...validInput, brandId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects negative dealValue", () => {
    const result = CreateDealSchema.safeParse({ ...validInput, dealValue: -100 });
    expect(result.success).toBe(false);
  });

  it("rejects zero dealValue", () => {
    const result = CreateDealSchema.safeParse({ ...validInput, dealValue: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects commissionPct > 100", () => {
    const result = CreateDealSchema.safeParse({ ...validInput, commissionPct: 101 });
    expect(result.success).toBe(false);
  });

  it("rejects commissionPct < 0", () => {
    const result = CreateDealSchema.safeParse({ ...validInput, commissionPct: -1 });
    expect(result.success).toBe(false);
  });

  it("does NOT accept creatorPayout as input (field not in schema)", () => {
    // creatorPayout is never accepted as user input
    const result = CreateDealSchema.safeParse({ ...validInput, creatorPayout: 1200 });
    // Schema ignores unknown fields by default — creatorPayout stripped out
    if (result.success) {
      const data = result.data as Record<string, unknown>;
      expect(data.creatorPayout).toBeUndefined();
    }
    // Either way, the schema must succeed (extra fields are stripped, not rejected)
    expect(result.success).toBe(true);
  });
});

describe("UpdateDealSchema", () => {
  it("accepts empty object (all fields optional)", () => {
    const result = UpdateDealSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts partial updates", () => {
    const result = UpdateDealSchema.safeParse({ title: "New Title", commissionPct: 15 });
    expect(result.success).toBe(true);
  });

  it("rejects invalid dealValue", () => {
    const result = UpdateDealSchema.safeParse({ dealValue: -500 });
    expect(result.success).toBe(false);
  });
});

describe("AdvanceStageSchema", () => {
  it("accepts a valid DealStage", () => {
    const result = AdvanceStageSchema.safeParse({ targetStage: "CREATOR_ASSIGNED" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid stage value", () => {
    const result = AdvanceStageSchema.safeParse({ targetStage: "NOT_A_STAGE" });
    expect(result.success).toBe(false);
  });

  it("accepts PENDING_APPROVAL as a value (route handler rejects it, not schema)", () => {
    // Schema validates enum membership only; business logic in route handler
    const result = AdvanceStageSchema.safeParse({ targetStage: "PENDING_APPROVAL" });
    expect(result.success).toBe(true);
  });
});
