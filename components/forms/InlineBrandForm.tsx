'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { MockBrand } from '@/lib/mock/brands'

const InlineBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  website: z
    .string()
    .url('Must be a valid URL (include https://)')
    .optional()
    .or(z.literal('')),
})

type InlineBrandInput = z.infer<typeof InlineBrandSchema>

interface InlineBrandFormProps {
  onCreated: (brand: MockBrand) => void
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

  function onSubmit(data: InlineBrandInput) {
    const newBrand: MockBrand = {
      // eslint-disable-next-line react-hooks/purity
      id: `brand_${Date.now()}`,
      name: data.name,
      website: data.website || null,
      logoUrl: null,
      createdAt: new Date().toISOString(),
    }
    onCreated(newBrand)
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
