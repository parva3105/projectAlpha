'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { InlineBrandForm } from '@/components/forms/InlineBrandForm'
import type { MockBrand } from '@/lib/mock/brands'
import type { MockCreator } from '@/lib/mock/creators'

const PLATFORMS = [
  'Instagram',
  'TikTok',
  'YouTube',
  'Twitter',
  'LinkedIn',
  'Pinterest',
  'Other',
] as const

type Platform = (typeof PLATFORMS)[number]

const DealFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  brandId: z.string().min(1, 'Brand is required'),
  creatorId: z.string().optional(),
  platform: z.enum(PLATFORMS, { error: 'Platform is required' }),
  dealValue: z.number({ error: 'Deal value is required' }).min(0, 'Must be 0 or more'),
  commissionPct: z
    .number({ error: 'Commission is required' })
    .min(0, 'Must be 0 or higher')
    .max(100, 'Must be 100 or lower'),
  deadline: z.string().min(1, 'Deadline is required'),
  notes: z.string().optional(),
})

type DealFormInput = z.infer<typeof DealFormSchema>

function formatPayout(value: number, commission: number): string {
  if (isNaN(value) || isNaN(commission)) return '$0.00'
  const payout = value * (1 - commission / 100)
  return `$${payout.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

interface DealNewFormProps {
  brands: MockBrand[]
  creators: MockCreator[]
}

export function DealNewForm({ brands: initialBrands, creators }: DealNewFormProps) {
  const router = useRouter()
  const [brands, setBrands] = useState<MockBrand[]>(initialBrands)
  const [showInlineBrand, setShowInlineBrand] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DealFormInput>({
    resolver: zodResolver(DealFormSchema),
    defaultValues: {
      title: '',
      brandId: '',
      creatorId: '',
      platform: undefined,
      dealValue: undefined,
      commissionPct: undefined,
      deadline: '',
      notes: '',
    },
  })

  const watchedValue = watch('dealValue')
  const watchedCommission = watch('commissionPct')
  const watchedBrandId = watch('brandId')

  const payoutPreview = formatPayout(
    Number(watchedValue) || 0,
    Number(watchedCommission) || 0
  )

  function handleBrandChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    if (val === '__new__') {
      setShowInlineBrand(true)
      setValue('brandId', '')
    } else {
      setShowInlineBrand(false)
      setValue('brandId', val)
    }
  }

  function handleBrandCreated(brand: MockBrand) {
    setBrands((prev) => [...prev, brand])
    setValue('brandId', brand.id)
    setShowInlineBrand(false)
  }

  function onSubmit(_data: DealFormInput) {
    toast.success('Deal created!')
    router.push('/deals')
  }

  const showPayoutPreview =
    (Number(watchedValue) > 0 || Number(watchedCommission) >= 0) &&
    !isNaN(Number(watchedValue)) &&
    !isNaN(Number(watchedCommission))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <Label htmlFor="deal-title">Title *</Label>
        <Input
          id="deal-title"
          placeholder="e.g. Nike Summer Campaign"
          {...register('title')}
          aria-invalid={errors.title ? 'true' : undefined}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Brand */}
      <div className="space-y-1">
        <Label htmlFor="deal-brand">Brand *</Label>
        <select
          id="deal-brand"
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
          value={showInlineBrand ? '__new__' : (watchedBrandId || '')}
          onChange={handleBrandChange}
          aria-invalid={errors.brandId ? 'true' : undefined}
        >
          <option value="">Select a brand...</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
          <option value="__new__">+ Create new brand</option>
        </select>
        {errors.brandId && (
          <p className="text-xs text-destructive">{errors.brandId.message}</p>
        )}
      </div>

      {/* Inline brand creation */}
      {showInlineBrand && (
        <InlineBrandForm
          onCreated={handleBrandCreated}
          onCancel={() => {
            setShowInlineBrand(false)
            setValue('brandId', '')
          }}
        />
      )}

      {/* Creator */}
      <div className="space-y-1">
        <Label htmlFor="deal-creator">Creator (optional)</Label>
        <select
          id="deal-creator"
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
          {...register('creatorId')}
        >
          <option value="">None — assign later</option>
          {creators.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} (@{c.handle})
            </option>
          ))}
        </select>
      </div>

      {/* Platform */}
      <div className="space-y-1">
        <Label htmlFor="deal-platform">Platform *</Label>
        <Controller
          control={control}
          name="platform"
          render={({ field }) => (
            <select
              id="deal-platform"
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
              value={field.value ?? ''}
              onChange={(e) =>
                field.onChange(e.target.value as Platform | '')
              }
              aria-invalid={errors.platform ? 'true' : undefined}
            >
              <option value="">Select a platform...</option>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          )}
        />
        {errors.platform && (
          <p className="text-xs text-destructive">{errors.platform.message}</p>
        )}
      </div>

      {/* Deal Value + Commission */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="deal-value">Deal Value ($) *</Label>
          <Input
            id="deal-value"
            type="number"
            min="0"
            step="0.01"
            placeholder="1500.00"
            {...register('dealValue', { valueAsNumber: true })}
            aria-invalid={errors.dealValue ? 'true' : undefined}
          />
          {errors.dealValue && (
            <p className="text-xs text-destructive">{errors.dealValue.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="deal-commission">Commission % *</Label>
          <Input
            id="deal-commission"
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="20"
            {...register('commissionPct', { valueAsNumber: true })}
            aria-invalid={errors.commissionPct ? 'true' : undefined}
          />
          {errors.commissionPct && (
            <p className="text-xs text-destructive">
              {errors.commissionPct.message}
            </p>
          )}
        </div>
      </div>

      {/* Payout preview */}
      {showPayoutPreview && (
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
          <span className="text-muted-foreground">Creator receives: </span>
          <span className="font-semibold font-mono">{payoutPreview}</span>
        </div>
      )}

      {/* Deadline */}
      <div className="space-y-1">
        <Label htmlFor="deal-deadline">Deadline *</Label>
        <Input
          id="deal-deadline"
          type="date"
          {...register('deadline')}
          aria-invalid={errors.deadline ? 'true' : undefined}
        />
        {errors.deadline && (
          <p className="text-xs text-destructive">{errors.deadline.message}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <Label htmlFor="deal-notes">Notes (optional)</Label>
        <Textarea
          id="deal-notes"
          rows={4}
          placeholder="Internal agency notes — not visible to creator or brand manager"
          {...register('notes')}
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Deal'}
      </Button>
    </form>
  )
}
