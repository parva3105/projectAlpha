'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { MockBrand } from '@/lib/mock/brands'

type FormValues = {
  name: string
  website: string
}

interface AddBrandDialogProps {
  onCreated: (brand: MockBrand) => void
}

export function AddBrandDialog({ onCreated }: AddBrandDialogProps) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>()

  function onSubmit(data: FormValues) {
    const newBrand: MockBrand = {
      id: `brand_${Date.now()}`,
      name: data.name,
      website: data.website || null,
      logoUrl: null,
      createdAt: new Date().toISOString(),
    }
    onCreated(newBrand)
    toast.success('Brand added')
    reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>Add Brand</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Brand</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="brandName">Name *</Label>
            <Input
              id="brandName"
              {...register('name', { required: 'Name is required' })}
              placeholder="Lumina Beauty"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="brandWebsite">Website</Label>
            <Input
              id="brandWebsite"
              type="url"
              {...register('website')}
              placeholder="https://example.com"
            />
            {errors.website && (
              <p className="text-xs text-destructive">{errors.website.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="submit" className="flex-1">Add Brand</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                setOpen(false)
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
