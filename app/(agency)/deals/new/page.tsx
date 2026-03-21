import { serverFetch } from '@/lib/api'
import { DealNewForm } from '@/components/forms/DealNewForm'

export default async function NewDealPage() {
  const [brandsRes, rosterRes] = await Promise.all([
    serverFetch('/api/v1/brands', { cache: 'no-store' }),
    serverFetch('/api/v1/roster', { cache: 'no-store' }),
  ])
  const { data: brands } = await brandsRes.json()
  const { data: creators } = await rosterRes.json()

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 tracking-tight">New Deal</h1>
      <DealNewForm brands={brands ?? []} creators={creators ?? []} />
    </div>
  )
}
