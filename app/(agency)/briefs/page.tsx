import { mockBriefs } from '@/lib/mock/briefs'
import { BriefsTable } from '@/components/briefs/BriefsTable'

export default function BriefsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Brief Inbox</h1>
      <BriefsTable initialBriefs={mockBriefs} />
    </div>
  )
}
