import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

type Role = "agency" | "creator" | "brand_manager";

// ─── Route matchers ────────────────────────────────────────────────────────

const isPublicRoute = createRouteMatcher([
  "/",
  "/discover(.*)",
  "/creators/(.*)",
  "/agencies(.*)",
  "/login(.*)",
  "/signup(.*)",
  // Role-setup callbacks — must be accessible right after sign-up
  "/api/v1/auth/complete(.*)",
  "/api/v1/auth/set-role(.*)",
]);

// Brand manager only — check BEFORE isAgencyRoute so /briefs/new isn't caught by the agency matcher
const isBrandRoute = createRouteMatcher(["/briefs/new(.*)"]);

// Agency only — /briefs here means the inbox list (/briefs), not /briefs/new
const isAgencyRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/deals(.*)",
  "/roster(.*)",
  "/brands(.*)",
  "/briefs(.*)", // agency inbox — isBrandRoute checked first
]);

// Creator only
const isCreatorRoute = createRouteMatcher(["/creator(.*)", "/profile(.*)"]);

// ─── Role redirect targets ─────────────────────────────────────────────────

const ROLE_HOME: Record<Role, string> = {
  agency: "/dashboard",
  creator: "/creator/deals",
  brand_manager: "/briefs/new",
};

// ─── Proxy ────────────────────────────────────────────────────────────────

export const proxy = clerkMiddleware(async (auth, req) => {
  // Always allow public routes
  if (isPublicRoute(req)) return;

  const { userId, sessionClaims } = await auth();

  // Unauthenticated on a protected route → login
  if (!userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const metadata = sessionClaims?.metadata as { role?: Role } | undefined;
  const role = metadata?.role;

  // Authenticated but no role yet (still completing sign-up)
  if (!role) {
    // Guard: if already on /signup/complete, let the page handle it.
    // Redirecting again causes an infinite loop while the JWT is stale.
    if (req.nextUrl.pathname === "/signup/complete") return;
    return NextResponse.redirect(new URL("/signup/complete", req.url));
  }

  // /briefs/new → brand_manager only
  if (isBrandRoute(req) && role !== "brand_manager") {
    return NextResponse.redirect(new URL(ROLE_HOME[role], req.url));
  }

  // Agency routes → agency only
  if (isAgencyRoute(req) && role !== "agency") {
    return NextResponse.redirect(new URL(ROLE_HOME[role], req.url));
  }

  // Creator routes → creator only
  if (isCreatorRoute(req) && role !== "creator") {
    return NextResponse.redirect(new URL(ROLE_HOME[role], req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
