import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { TooltipProvider } from "@/components/ui/tooltip";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/deals", label: "Deals" },
  { href: "/roster", label: "Roster" },
  { href: "/briefs", label: "Briefs" },
  { href: "/brands", label: "Brands" },
];

export default function AgencyLayout({
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
            Brand Deal Manager
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
            Agency
          </span>
        </header>
        <TooltipProvider>
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </TooltipProvider>
      </div>
    </div>
  );
}
