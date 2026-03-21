import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

type Role = 'agency' | 'creator' | 'brand_manager' | 'superadmin'

const isPublicRoute = createRouteMatcher([
  '/',
  '/discover(.*)',
  '/creators/(.*)',
  '/agencies(.*)',
  '/login(.*)',
  '/signup(.*)',
  '/api/v1/auth/complete(.*)',
  '/api/v1/auth/set-role(.*)',
  '/api/v1/creators(.*)',   // public discovery — used by /discover and /creators/:handle
])

// Brand manager — check BEFORE isAgencyRoute so /briefs/new isn't caught by agency matcher
const isBrandRoute = createRouteMatcher(['/brand/briefs/new(.*)'])

// Agency only — /briefs here means the inbox, not /briefs/new
const isAgencyRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/deals(.*)',
  '/roster(.*)',
  '/brands(.*)',
  '/briefs(.*)',
])

// Creator only
const isCreatorRoute = createRouteMatcher(['/creator(.*)', '/profile(.*)'])

const ROLE_HOME: Record<Exclude<Role, 'superadmin'>, string> = {
  agency: '/dashboard',
  creator: '/creator/deals',
  brand_manager: '/brand/briefs/new',
}

export const proxy = clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return

  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.redirect(new URL('/login', req.url))

  const metadata = sessionClaims?.metadata as { role?: Role } | undefined
  const role = metadata?.role

  if (!role) {
    if (req.nextUrl.pathname === '/signup/complete') return
    return NextResponse.redirect(new URL('/signup/complete', req.url))
  }

  // ─── Superadmin bypasses ALL role-based routing ──────────────────────────
  if (role === 'superadmin') return

  // /brand/briefs/new → brand_manager only
  if (isBrandRoute(req) && role !== 'brand_manager') {
    return NextResponse.redirect(new URL(ROLE_HOME[role as Exclude<Role, 'superadmin'>], req.url))
  }

  // Agency routes → agency only
  if (isAgencyRoute(req) && role !== 'agency') {
    return NextResponse.redirect(new URL(ROLE_HOME[role as Exclude<Role, 'superadmin'>], req.url))
  }

  // Creator routes → creator only
  if (isCreatorRoute(req) && role !== 'creator') {
    return NextResponse.redirect(new URL(ROLE_HOME[role as Exclude<Role, 'superadmin'>], req.url))
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
