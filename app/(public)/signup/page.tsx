import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'


const roles = [
  {
    title: 'Agency Account Manager',
    description: 'Manage creator rosters, brand deals, and the full campaign pipeline.',
    href: '/signup/agency',
    icon: '🏢',
  },
  {
    title: 'Creator / Influencer',
    description: 'Track your deals, submit content, and manage your creator profile.',
    href: '/signup/creator',
    icon: '🎨',
  },
  {
    title: 'Brand Manager',
    description: 'Submit campaign briefs and collaborate with talent agencies.',
    href: '/signup/brand',
    icon: '🏷️',
  },
]

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-muted-foreground text-sm mt-1">Choose your role to get started</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
        {roles.map((role) => (
          <Card key={role.href} className="flex flex-col">
            <CardHeader>
              <div className="text-3xl mb-2">{role.icon}</div>
              <CardTitle className="text-base">{role.title}</CardTitle>
              <CardDescription className="text-xs">{role.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Link href={role.href} className="inline-flex items-center justify-center w-full rounded-md bg-primary text-primary-foreground text-sm font-medium h-9 px-4 py-2 hover:bg-primary/90 transition-colors">
                Get started
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </div>
  )
}
