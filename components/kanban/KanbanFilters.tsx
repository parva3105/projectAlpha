'use client'

import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { isOverdue } from '@/lib/overdue.client'

type ApiDeal = {
  id: string
  title: string
  agencyClerkId: string
  brandId: string
  creatorId: string | null
  briefId: string | null
  stage: string
  dealValue: number
  commissionPct: number
  creatorPayout: number
  deadline: string | null
  contractStatus: string
  contractUrl: string | null
  paymentStatus: string
  notes: string | null
  createdAt: string
  updatedAt: string
  brand: { id: string; name: string; website: string | null }
  creator: { id: string; name: string; handle: string; avatarUrl: string | null } | null
}

interface KanbanFiltersProps {
  deals: ApiDeal[]
  onFilterChange: (filtered: ApiDeal[]) => void
}

export function KanbanFilters({ deals, onFilterChange }: KanbanFiltersProps) {
  const [creatorId, setCreatorId] = useState('ALL')
  const [brandId, setBrandId] = useState('ALL')
  const [overdueOnly, setOverdueOnly] = useState(false)

  // Derive unique options from the deals array
  const creators = Array.from(
    new Map(
      deals
        .filter((d) => d.creator !== null)
        .map((d) => [d.creator!.id, d.creator!])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name))
  const brands = Array.from(
    new Map(deals.map((d) => [d.brand.id, d.brand])).values()
  ).sort((a, b) => a.name.localeCompare(b.name))

  useEffect(() => {
    let filtered = deals

    if (creatorId !== 'ALL') {
      filtered = filtered.filter((d) => d.creator?.id === creatorId)
    }
    if (brandId !== 'ALL') {
      filtered = filtered.filter((d) => d.brand.id === brandId)
    }
    if (overdueOnly) {
      filtered = filtered.filter((d) => isOverdue(d))
    }

    onFilterChange(filtered)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatorId, brandId, overdueOnly])

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Creator */}
      <Select value={creatorId} onValueChange={(val) => setCreatorId(val ?? 'ALL')}>
        <SelectTrigger className="h-8 w-40 text-xs">
          <SelectValue placeholder="All Creators" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL" className="text-xs">
            All Creators
          </SelectItem>
          {creators.map((c) => (
            <SelectItem key={c.id} value={c.id} className="text-xs">
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Brand */}
      <Select value={brandId} onValueChange={(val) => setBrandId(val ?? 'ALL')}>
        <SelectTrigger className="h-8 w-40 text-xs">
          <SelectValue placeholder="All Brands" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL" className="text-xs">
            All Brands
          </SelectItem>
          {brands.map((b) => (
            <SelectItem key={b.id} value={b.id} className="text-xs">
              {b.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Overdue only */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <Checkbox
          checked={overdueOnly}
          onCheckedChange={(checked) => setOverdueOnly(checked === true)}
        />
        <span className="text-xs text-foreground">Overdue only</span>
      </label>
    </div>
  )
}
