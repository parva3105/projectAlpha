import { apiUrl } from '@/lib/api'
import { BrandsTable } from '@/components/brands/BrandsTable'

export default async function BrandsPage() {
  const [brandsRes, dealsRes] = await Promise.all([
    fetch(apiUrl('/api/v1/brands'), { cache: 'no-store' }),
    fetch(apiUrl('/api/v1/deals'), { cache: 'no-store' }),
  ])
  const { data: brands } = await brandsRes.json()
  const { data: deals } = await dealsRes.json()

  return (
    <div className="p-6">
      <BrandsTable initialBrands={brands ?? []} deals={deals ?? []} />
    </div>
  )
}
