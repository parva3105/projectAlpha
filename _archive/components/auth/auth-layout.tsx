import Link from "next/link";

interface AuthLayoutProps {
  tagline: string;
  benefits?: string[];
  bottomLink: { label: string; text: string; href: string };
  children: React.ReactNode;
}

/**
 * Two-panel auth layout (Server Component).
 * Left panel: branded copy (hidden on mobile).
 * Right panel: Clerk widget + bottom link.
 */
export default function AuthLayout({
  tagline,
  benefits,
  bottomLink,
  children,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-50 font-sans">
      {/* ── Left panel — branding ─────────────────────────────────────── */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-between bg-zinc-900 border-r border-zinc-800 p-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
            Brand Deal Manager
          </p>
        </div>
        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight tracking-tight text-zinc-50">
            {tagline}
          </h2>
          {benefits && benefits.length > 0 && (
            <ul className="space-y-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-sm text-zinc-400">
                  <span className="mt-0.5 text-amber-400 font-bold select-none">&#8212;</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="text-xs text-zinc-700">
          &copy; {new Date().getFullYear()} Brand Deal Manager
        </p>
      </div>

      {/* ── Right panel — Clerk widget ────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo (only visible when left panel is hidden) */}
        <p className="mb-8 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400 md:hidden">
          Brand Deal Manager
        </p>

        {children}

        <p className="mt-6 text-sm text-zinc-500">
          {bottomLink.label}{" "}
          <Link
            href={bottomLink.href}
            className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-2"
          >
            {bottomLink.text}
          </Link>
        </p>
      </div>
    </div>
  );
}
