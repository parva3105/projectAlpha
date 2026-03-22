'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const InlineBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  website: z
    .string()
    .url('Must be a valid URL (include https://)')
    .optional()
    .or(z.literal('')),
})

type InlineBrandInput = z.infer<typeof InlineBrandSchema>

export type ApiBrand = {
  id: string
  name: string
  website: string | null
  logoUrl: string | null
  createdAt: string
  updatedAt: string
}

interface InlineBrandFormProps {
  onCreated: (brand: ApiBrand) => void
  onCancel: () => void
}

export function InlineBrandForm({ onCreated, onCancel }: InlineBrandFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InlineBrandInput>({
    resolver: zodResolver(InlineBrandSchema),
    defaultValues: { name: '', website: '' },
  })

  async function onSubmit(data: InlineBrandInput) {
    const res = await fetch('/api/v1/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        website: data.website || undefined,
      }),
    })
    const json = await res.json()
    if (!res.ok) {
      toast.error('Failed to create brand')
      return
    }
    onCreated(json.data)
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
      <p className="text-sm font-medium">New brand</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="inline-brand-name">Brand name *</Label>
          <Input
            id="inline-brand-name"
            placeholder="e.g. Nike"
            {...register('name')}
            aria-invalid={errors.name ? 'true' : undefined}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="inline-brand-website">Website (optional)</Label>
          <Input
            id="inline-brand-website"
            type="url"
            placeholder="https://nike.com"
            {...register('website')}
            aria-invalid={errors.website ? 'true' : undefined}
          />
          {errors.website && (
            <p className="text-xs text-destructive">{errors.website.message}</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save brand'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
