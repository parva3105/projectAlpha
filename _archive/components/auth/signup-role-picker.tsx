import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

/**
 * Pre-auth role selection cards.
 * Shown on /signup when no Clerk SSO hash fragment is detected.
 * This is a Server Component — no interactivity needed.
 */
export default function SignupRolePicker() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 font-sans">
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-3xl space-y-10">
          {/* Heading */}
          <div className="text-center space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              Brand Deal Manager
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
              How will you use Brand Deal Manager?
            </h1>
          </div>

          {/* Role cards */}
          <div className="grid gap-6 sm:grid-cols-3">
            <Card className="border-zinc-800 bg-zinc-900 hover:border-amber-400/60 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-zinc-50">
                  Agency Account Manager
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Manage your talent roster, deals, and brand relationships.
                </p>
                <Link
                  href="/signup/agency"
                  className={cn(
                    buttonVariants(),
                    "w-full bg-amber-400 text-zinc-950 hover:bg-amber-300 font-semibold text-sm"
                  )}
                >
                  Get started as an Agency
                </Link>
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900 hover:border-amber-400/60 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-zinc-50">
                  Creator / Influencer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Track your deals, submit content, and receive payments.
                </p>
                <Link
                  href="/signup/creator"
                  className={cn(
                    buttonVariants(),
                    "w-full bg-amber-400 text-zinc-950 hover:bg-amber-300 font-semibold text-sm"
                  )}
                >
                  Get started as a Creator
                </Link>
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900 hover:border-amber-400/60 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-zinc-50">
                  Brand Manager
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Submit campaign briefs and connect with talent agencies.
                </p>
                <Link
                  href="/signup/brand"
                  className={cn(
                    buttonVariants(),
                    "w-full bg-amber-400 text-zinc-950 hover:bg-amber-300 font-semibold text-sm"
                  )}
                >
                  Get started as a Brand
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Sign-in link */}
          <p className="text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-2"
            >
              Sign in &rarr;
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
