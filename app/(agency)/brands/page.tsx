import { apiUrl } from '@/lib/api'
import { BrandsTable } from '@/components/brands/BrandsTable'

export default async function BrandsPage() {
  const [brandsRes, dealsRes] = await Promise.all([
    fetch(apiUrl('/api/v1/brands'), { cache: 'no-store' }),
    fetch(apiUrl('/api/v1/deals'), { cache: 'no-store' }),
  ])
  const { data: brands } = await brandsRes.json()
  const { data: deals } = await dealsRes.json()

  if ((brands ?? []).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground text-sm">No brands added yet.</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <BrandsTable initialBrands={brands ?? []} deals={deals ?? []} />
    </div>
  )
}
