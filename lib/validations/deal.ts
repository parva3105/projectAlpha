import { z } from 'zod'

export const CreateDealSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  brandId: z.string().min(1, 'Brand is required'),
  creatorId: z.string().optional(),
  briefId: z.string().optional(),
  /** Deal value in dollars — converted to cents on write */
  dealValue: z.number().positive('Deal value must be positive'),
  /** Commission percentage e.g. 20 = 20% */
  commissionPct: z.number().min(0).max(100, 'Commission must be 0–100%'),
  deadline: z.string().datetime({ offset: true }).optional(),
  contractStatus: z.enum(['NOT_SENT', 'SENT', 'SIGNED']).optional(),
  contractUrl: z.string().url().optional(),
  paymentStatus: z.enum(['PENDING', 'RECEIVED']).optional(),
  notes: z.string().optional(),
})

export const UpdateDealSchema = CreateDealSchema.partial()

/** Only the 6 stages that can be manually advanced to */
export const AdvanceStageSchema = z.object({
  stage: z.enum([
    'BRIEF_RECEIVED',
    'CREATOR_ASSIGNED',
    'CONTRACT_SENT',
    'IN_PRODUCTION',
    'PAYMENT_PENDING',
    'CLOSED',
  ]),
})

export type CreateDealInput = z.infer<typeof CreateDealSchema>
export type UpdateDealInput = z.infer<typeof UpdateDealSchema>
export type AdvanceStageInput = z.infer<typeof AdvanceStageSchema>
