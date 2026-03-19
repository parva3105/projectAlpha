import { z } from "zod";

// Mirrors the Prisma DealStage enum
export const DealStageEnum = z.enum([
  "BRIEF_RECEIVED",
  "CREATOR_ASSIGNED",
  "CONTRACT_SENT",
  "IN_PRODUCTION",
  "PENDING_APPROVAL",
  "LIVE",
  "PAYMENT_PENDING",
  "CLOSED",
]);

export const ContractStatusEnum = z.enum(["PENDING", "SENT", "SIGNED"]);
export const PaymentStatusEnum = z.enum(["PENDING", "RECEIVED"]);

export const CreateDealSchema = z.object({
  title: z.string().min(1, "Title is required"),
  brandId: z.string().min(1, "Brand ID is required"),
  creatorId: z.string().optional(),
  /** Deal face value in USD dollars (e.g. 1500.00). Stored as Decimal(10,2). */
  dealValue: z.number().positive("Deal value must be positive"),
  /** Commission percentage 0–100 (e.g. 20 = 20%). Stored as Decimal(5,2). */
  commissionPct: z
    .number()
    .min(0, "Commission must be >= 0")
    .max(100, "Commission must be <= 100"),
  /** ISO 8601 date string, e.g. "2026-06-01" */
  deadline: z.string().optional(),
  notes: z.string().optional(),
});

export const UpdateDealSchema = z.object({
  title: z.string().min(1).optional(),
  brandId: z.string().min(1).optional(),
  creatorId: z.string().nullable().optional(),
  dealValue: z.number().positive().optional(),
  commissionPct: z.number().min(0).max(100).optional(),
  deadline: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  contractStatus: ContractStatusEnum.optional(),
  paymentStatus: PaymentStatusEnum.optional(),
});

export const AdvanceStageSchema = z.object({
  targetStage: DealStageEnum,
});

export type CreateDealInput = z.infer<typeof CreateDealSchema>;
export type UpdateDealInput = z.infer<typeof UpdateDealSchema>;
export type AdvanceStageInput = z.infer<typeof AdvanceStageSchema>;
