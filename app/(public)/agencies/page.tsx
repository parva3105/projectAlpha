const MOCK_AGENCIES = [
  {
    id: 'agency_001',
    name: 'Apex Talent Group',
    tagline: 'Connecting top-tier creators with global brands.',
    creatorCount: 47,
  },
  {
    id: 'agency_002',
    name: 'Nova Creator Agency',
    tagline: 'Where authentic storytelling meets brand ambition.',
    creatorCount: 32,
  },
  {
    id: 'agency_003',
    name: 'Spark Media Management',
    tagline: 'Full-service creator management and brand partnerships.',
    creatorCount: 28,
  },
]

export const revalidate = 3600

export default function AgenciesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Partner Agencies</h1>
      <div className="grid gap-4">
        {MOCK_AGENCIES.map(agency => (
          <div key={agency.id} className="border border-border rounded-lg p-4">
            <h3 className="font-semibold">{agency.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{agency.tagline}</p>
            <p className="text-sm text-muted-foreground mt-2">
              <span className="font-mono tabular-nums">{agency.creatorCount}</span> creators
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
