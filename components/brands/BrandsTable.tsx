'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AddBrandDialog } from '@/components/brands/AddBrandDialog'
import type { MockBrand } from '@/lib/mock/brands'
import type { MockDeal } from '@/lib/mock/deals'

interface BrandsTableProps {
  initialBrands: MockBrand[]
  deals: MockDeal[]
}

export function BrandsTable({ initialBrands, deals }: BrandsTableProps) {
  const [brands, setBrands] = useState<MockBrand[]>(initialBrands)

  function handleCreated(brand: MockBrand) {
    setBrands(prev => [...prev, brand])
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Brands</h1>
        <AddBrandDialog onCreated={handleCreated} />
      </div>

      {brands.length === 0 ? (
        <p className="text-sm text-muted-foreground">No brands yet.</p>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Open Deals</TableHead>
                <TableHead>Total Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map(brand => {
                const brandDeals = deals.filter(d => d.brandId === brand.id)
                const openDeals = brandDeals.filter(d => d.stage !== 'CLOSED').length
                const totalValue = brandDeals.reduce((sum, d) => sum + d.dealValue, 0)

                return (
                  <TableRow key={brand.id}>
                    <TableCell>
                      <Link
                        href={`/brands/${brand.id}`}
                        className="font-medium hover:underline text-sm"
                      >
                        {brand.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {brand.website ? (
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:underline"
                        >
                          {brand.website}
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm tabular-nums">{openDeals}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm tabular-nums">
                        ${totalValue.toLocaleString()}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
