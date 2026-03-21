'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'

const MOCK_AGENCIES = [
  { id: 'agency_001', name: 'Apex Talent Group' },
  { id: 'agency_002', name: 'Nova Creator Agency' },
  { id: 'agency_003', name: 'Spark Media Management' },
]

const PLATFORMS = [
  'Instagram',
  'TikTok',
  'YouTube',
  'Twitter',
  'LinkedIn',
  'Pinterest',
  'Other',
] as const

type BriefFormValues = {
  title: string
  description: string
  platform: string
  niche: string
  budget: string
  agencyId: string
  creatorHandle: string
}

export function SubmitBriefForm() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BriefFormValues>({
    defaultValues: {
      title: '',
      description: '',
      platform: '',
      niche: '',
      budget: '',
      agencyId: '',
      creatorHandle: '',
    },
  })

  const platform = watch('platform')
  const agencyId = watch('agencyId')

  function validate(data: BriefFormValues): Record<string, string> {
    const errs: Record<string, string> = {}
    if (!data.title.trim()) errs.title = 'Title is required'
    if (!data.description.trim()) errs.description = 'Description is required'
    if (!data.platform) errs.platform = 'Platform is required'
    if (!data.niche.trim()) errs.niche = 'Niche is required'
    if (!data.budget || isNaN(Number(data.budget)) || Number(data.budget) < 0)
      errs.budget = 'Budget must be a non-negative number'
    if (!data.agencyId) errs.agencyId = 'Agency is required'
    return errs
  }

  function onSubmit(data: BriefFormValues) {
    const errs = validate(data)
    if (Object.keys(errs).length > 0) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <Card className="text-center p-8">
        <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Brief Submitted!</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          The agency will review it and be in touch soon.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            reset()
            setSubmitted(false)
          }}
        >
          Submit another brief
        </Button>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          {...register('title', { required: 'Title is required' })}
          placeholder="Summer Hydration Campaign"
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          {...register('description', { required: 'Description is required' })}
          placeholder="Describe the campaign, deliverables, target audience..."
          rows={4}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="platform-select">Platform *</Label>
        <Select
          value={platform || undefined}
          onValueChange={(val) => {
            if (val !== null) setValue('platform', val, { shouldValidate: true })
          }}
        >
          <SelectTrigger id="platform-select">
            <SelectValue placeholder="Select platform..." />
          </SelectTrigger>
          <SelectContent>
            {PLATFORMS.map(p => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.platform && (
          <p className="text-xs text-destructive">{errors.platform.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="niche">Niche *</Label>
        <Input
          id="niche"
          {...register('niche', { required: 'Niche is required' })}
          placeholder="Fitness, Tech, Fashion..."
        />
        {errors.niche && (
          <p className="text-xs text-destructive">{errors.niche.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="budget">Budget (USD) *</Label>
        <Input
          id="budget"
          type="number"
          min={0}
          {...register('budget', {
            required: 'Budget is required',
            min: { value: 0, message: 'Budget must be at least 0' },
          })}
          placeholder="5000"
          className="font-mono"
        />
        {errors.budget && (
          <p className="text-xs text-destructive">{errors.budget.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="agency-select">Agency *</Label>
        <Select
          value={agencyId || undefined}
          onValueChange={(val) => {
            if (val !== null) setValue('agencyId', val, { shouldValidate: true })
          }}
        >
          <SelectTrigger id="agency-select">
            <SelectValue placeholder="Select agency..." />
          </SelectTrigger>
          <SelectContent>
            {MOCK_AGENCIES.map(a => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.agencyId && (
          <p className="text-xs text-destructive">{errors.agencyId.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="creatorHandle">Creator handle (optional)</Label>
        <Input
          id="creatorHandle"
          {...register('creatorHandle')}
          placeholder="@aria.chen"
          className="font-mono"
        />
      </div>

      <Button type="submit" className="w-full">
        Submit Brief
      </Button>
    </form>
  )
}
