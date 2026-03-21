import Link from 'next/link'
import { LayoutDashboard, User, Building2, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-foreground">Brand Deal Manager</span>
        <div className="flex items-center gap-3">
          <Link
            href="/discover"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Discover
          </Link>
          <Link
            href="/agencies"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Agencies
          </Link>
          <Link
            href="/dashboard"
            className="text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold tracking-[-0.04em] text-foreground">
          The deal pipeline for{' '}
          <span className="text-blue-400">creator agencies</span>
        </h1>
        <p className="mt-6 text-xl text-muted-foreground leading-8">
          Manage brand deals, creator rosters, and payments — without the spreadsheets.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/discover"
            className="inline-flex items-center px-6 py-3 rounded-md font-medium border border-border text-foreground hover:bg-muted transition-colors"
          >
            View Demo
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 border-t border-border">
        <h2 className="text-2xl font-bold tracking-tight text-center mb-12">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              step: '1',
              title: 'Create a Deal',
              desc: 'Add brand details, assign a creator, and set the deal value in seconds.',
            },
            {
              step: '2',
              title: 'Assign a Creator',
              desc: 'Pick from your roster. Send contracts, track status — all in one place.',
            },
            {
              step: '3',
              title: 'Approve & Pay',
              desc: 'Review submitted content, approve, and mark payment complete.',
            },
          ].map(s => (
            <div key={s.step} className="text-center">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold mx-auto mb-4">
                {s.step}
              </div>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-6">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Role cards */}
      <section className="px-6 py-16 border-t border-border">
        <h2 className="text-2xl font-bold tracking-tight text-center mb-12">
          Built for everyone in the deal
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              icon: LayoutDashboard,
              title: 'For Agencies',
              desc: 'Manage your full deal pipeline, creator roster, and brand relationships from one dashboard.',
              href: '/dashboard',
            },
            {
              icon: User,
              title: 'For Creators',
              desc: 'View your deals, submit content, and track payments — no spreadsheet required.',
              href: '/creator/deals',
            },
            {
              icon: Building2,
              title: 'For Brands',
              desc: 'Submit campaign briefs and connect with top creator talent through our agency network.',
              href: '/briefs/new',
            },
          ].map(card => (
            <div key={card.title} className="border border-border rounded-lg p-6">
              <card.icon className="h-8 w-8 mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-6">{card.desc}</p>
              <Link
                href={card.href}
                className="text-sm text-blue-400 hover:underline"
              >
                Get started →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Brand Deal Manager — The agency-grade deal pipeline for influencer marketing
        </p>
      </footer>
    </div>
  )
}
