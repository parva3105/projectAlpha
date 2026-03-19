import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const NAV = [
  { href: "/creator/deals", label: "My Deals" },
  { href: "/profile", label: "Profile" },
];

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-border flex flex-col">
        <div className="h-14 flex items-center px-5 border-b border-border">
          <span className="font-semibold text-sm tracking-tight">
            Creator Portal
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-border">
          <UserButton />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 shrink-0 border-b border-border flex items-center px-6">
          <span className="text-sm font-medium text-muted-foreground">
            Creator
          </span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
