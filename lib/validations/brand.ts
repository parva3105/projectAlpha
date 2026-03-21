import { z } from 'zod'

export const CreateBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  website: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
})

export const UpdateBrandSchema = CreateBrandSchema.partial()

export type CreateBrandInput = z.infer<typeof CreateBrandSchema>
export type UpdateBrandInput = z.infer<typeof UpdateBrandSchema>
