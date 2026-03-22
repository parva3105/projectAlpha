import { z } from 'zod'

export const UpdateCreatorProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  bio: z.string().nullable().optional(),
  platforms: z.array(z.string()).optional(),
  nicheTags: z.array(z.string()).optional(),
  followerCount: z.number().int().nonnegative().nullable().optional(),
  engagementRate: z.number().min(0).max(100).nullable().optional(),
  isPublic: z.boolean().optional(),
})

export type UpdateCreatorProfileInput = z.infer<typeof UpdateCreatorProfileSchema>
