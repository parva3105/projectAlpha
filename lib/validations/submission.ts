import { z } from 'zod'

export const CreateSubmissionSchema = z.object({
  /** URL to submitted content (YouTube, Google Drive, etc.) */
  url: z.string().url().optional(),
  /** Cloudflare R2 object key for direct file uploads */
  fileKey: z.string().optional(),
}).refine(
  (d) => d.url || d.fileKey,
  { message: 'Either url or fileKey must be provided' }
)

export const ReviewSubmissionSchema = z.object({
  status: z.enum(['APPROVED', 'CHANGES_REQUESTED']),
  feedback: z.string().optional(),
}).refine(
  (d) => d.status !== 'CHANGES_REQUESTED' || (!!d.feedback && d.feedback.length > 0),
  { message: 'Feedback is required when requesting changes', path: ['feedback'] }
)

export type CreateSubmissionInput = z.infer<typeof CreateSubmissionSchema>
export type ReviewSubmissionInput = z.infer<typeof ReviewSubmissionSchema>
