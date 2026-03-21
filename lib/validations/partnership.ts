import { z } from 'zod'

export const CreatePartnershipSchema = z.object({
  creatorId: z.string().min(1, 'Creator is required'),
  message: z.string().optional(),
})

export const ReviewPartnershipSchema = z.object({
  status: z.enum(['ACCEPTED', 'DECLINED']),
})

export type CreatePartnershipInput = z.infer<typeof CreatePartnershipSchema>
export type ReviewPartnershipInput = z.infer<typeof ReviewPartnershipSchema>
