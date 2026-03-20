import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function Home() {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (role === "agency") redirect("/dashboard");
  if (role === "creator") redirect("/creator/deals");
  if (role === "brand_manager") redirect("/briefs/new");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        {/* eyebrow */}
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
          Brand Deal Manager
        </p>
        <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight text-zinc-50 sm:text-6xl md:text-7xl">
          The deal pipeline for{" "}
          <span className="text-amber-400">talent agencies.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-zinc-400">
          One place to track every brand deal from brief to payment — no
          spreadsheets, no email threads, no guesswork.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-amber-400 text-zinc-950 hover:bg-amber-300 font-semibold px-8"
            )}
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-zinc-700 text-zinc-50 hover:bg-zinc-800 px-8"
            )}
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* ── Benefit blocks ───────────────────────────────────────────── */}
      <section className="border-t border-zinc-800 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <p className="mb-12 text-center text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Why agencies switch
          </p>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="font-mono text-3xl font-bold text-amber-400">01</p>
              <h3 className="text-lg font-semibold text-zinc-50">
                One pipeline, every deal
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                Replace scattered spreadsheets with a live Kanban board. Every
                deal stage, every creator, in a single view.
              </p>
            </div>
            <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="font-mono text-3xl font-bold text-amber-400">02</p>
              <h3 className="text-lg font-semibold text-zinc-50">
                Creator roster built-in
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                No more email threads to find creator handles and rates. Your
                full roster lives where your deals do.
              </p>
            </div>
            <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="font-mono text-3xl font-bold text-amber-400">03</p>
              <h3 className="text-lg font-semibold text-zinc-50">
                Payment tracked automatically
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                Commission calculated for you on every deal. Creator payouts
                always accurate — never manually entered.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Role cards ───────────────────────────────────────────────── */}
      <section className="border-t border-zinc-800 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Get started as
          </p>
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-zinc-50">
            Choose your role
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <Card className="border-zinc-800 bg-zinc-900 hover:border-amber-400/60 transition-colors">
              <CardHeader>
                <CardTitle className="text-zinc-50 text-lg">
                  Agency Account Manager
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-zinc-400">
                  Manage your talent roster, deals, and brand relationships from
                  a single Kanban pipeline.
                </p>
                <Link
                  href="/signup/agency"
                  className={cn(
                    buttonVariants(),
                    "w-full bg-amber-400 text-zinc-950 hover:bg-amber-300 font-semibold"
                  )}
                >
                  Get started as an Agency
                </Link>
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900 hover:border-amber-400/60 transition-colors">
              <CardHeader>
                <CardTitle className="text-zinc-50 text-lg">
                  Creator / Influencer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-zinc-400">
                  Track your deals, submit content for approval, and see your
                  payout before you sign anything.
                </p>
                <Link
                  href="/signup/creator"
                  className={cn(
                    buttonVariants(),
                    "w-full bg-amber-400 text-zinc-950 hover:bg-amber-300 font-semibold"
                  )}
                >
                  Get started as a Creator
                </Link>
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900 hover:border-amber-400/60 transition-colors">
              <CardHeader>
                <CardTitle className="text-zinc-50 text-lg">
                  Brand Manager
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-zinc-400">
                  Submit campaign briefs and connect directly with talent
                  agencies managing top creators.
                </p>
                <Link
                  href="/signup/brand"
                  className={cn(
                    buttonVariants(),
                    "w-full bg-amber-400 text-zinc-950 hover:bg-amber-300 font-semibold"
                  )}
                >
                  Get started as a Brand
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Footer strip ─────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800 px-6 py-8 text-center">
        <p className="text-xs text-zinc-600">
          Brand Deal Manager &mdash; built for talent agencies
        </p>
      </footer>
    </div>
  );
}
