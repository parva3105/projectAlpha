import { z } from 'zod'

export const AddCreatorToRosterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  handle: z.string().min(1, 'Handle is required'),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  platforms: z.array(z.string()).default([]),
  nicheTags: z.array(z.string()).default([]),
  followerCount: z.number().int().nonnegative().optional(),
  /** Engagement rate as a percentage e.g. 4.25 = 4.25% */
  engagementRate: z.number().min(0).max(100).optional(),
  isPublic: z.boolean().default(false),
})

export type AddCreatorToRosterInput = z.infer<typeof AddCreatorToRosterSchema>
