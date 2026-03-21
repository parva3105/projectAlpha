import { mockBrands } from '@/lib/mock/brands'
import { mockRoster } from '@/lib/mock/creators'
import { DealNewForm } from '@/components/forms/DealNewForm'

export default function NewDealPage() {
  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 tracking-tight">New Deal</h1>
      <DealNewForm brands={mockBrands} creators={mockRoster} />
    </div>
  )
}
