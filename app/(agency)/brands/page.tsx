import { mockBrands } from '@/lib/mock/brands'
import { mockDeals } from '@/lib/mock/deals'
import { BrandsTable } from '@/components/brands/BrandsTable'

export default function BrandsPage() {
  return (
    <div className="p-6">
      <BrandsTable initialBrands={mockBrands} deals={mockDeals} />
    </div>
  )
}
