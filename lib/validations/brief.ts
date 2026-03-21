import { z } from 'zod'

export const CreateBriefSchema = z.object({
  /** Target agency's Clerk ID */
  agencyClerkId: z.string().min(1, 'Agency is required'),
  /** Optional: pre-targeted creator from /creators/:handle */
  creatorId: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  /** Budget in dollars — converted to cents on write */
  budget: z.number().positive().optional(),
  platform: z.string().optional(),
  niche: z.string().optional(),
})

export const UpdateBriefSchema = z.object({
  status: z.enum(['NEW', 'REVIEWED', 'CONVERTED', 'DECLINED']),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
})

export type CreateBriefInput = z.infer<typeof CreateBriefSchema>
export type UpdateBriefInput = z.infer<typeof UpdateBriefSchema>
