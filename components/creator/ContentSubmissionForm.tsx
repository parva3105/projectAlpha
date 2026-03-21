'use client'

import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { MockSubmission } from '@/lib/mock/submissions'

type FormValues = {
  url: string
}

interface ContentSubmissionFormProps {
  dealId: string
  existingRounds: number
  onSubmitted: (submission: MockSubmission) => void
}

export function ContentSubmissionForm({
  dealId,
  existingRounds,
  onSubmitted,
}: ContentSubmissionFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>()

  function onSubmit(data: FormValues) {
    const newSubmission: MockSubmission = {
      // eslint-disable-next-line react-hooks/purity
      id: `sub_${Date.now()}`,
      dealId,
      creatorId: 'creator_001',
      round: existingRounds + 1,
      url: data.url,
      fileKey: null,
      status: 'PENDING',
      feedback: null,
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
    }
    onSubmitted(newSubmission)
    toast.success('Content submitted!')
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="contentUrl">Content URL *</Label>
        <Input
          id="contentUrl"
          type="url"
          {...register('url', {
            required: 'URL is required',
            pattern: {
              value: /^https?:\/\/.+/,
              message: 'Must be a valid URL',
            },
          })}
          placeholder="https://..."
          className="font-mono"
        />
        {errors.url && (
          <p className="text-xs text-destructive">{errors.url.message}</p>
        )}
      </div>
      <Button type="submit">Submit Content</Button>
    </form>
  )
}
