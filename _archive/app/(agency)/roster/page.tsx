import { cookies, headers } from "next/headers";
import { RosterTable, type CreatorRow } from "@/components/roster/roster-table";
import { AddCreatorSheet } from "@/components/roster/add-creator-sheet";

type ApiResponse<T> = { data: T; error: null } | { data: null; error: string };

async function fetchRoster(): Promise<CreatorRow[]> {
  const cookieHeader = (await cookies()).toString();
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/v1/roster`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });

  if (!res.ok) return [];

  const json = (await res.json()) as ApiResponse<CreatorRow[]>;
  if (json.error || !json.data) return [];

  return json.data;
}

export const dynamic = "force-dynamic";

export default async function RosterPage() {
  const creators = await fetchRoster();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Roster</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Creators managed by your agency.
          </p>
        </div>
        <AddCreatorSheet />
      </div>

      <RosterTable creators={creators} />

      <p className="text-xs text-muted-foreground">
        Full creator profiles and partnership requests available in M5.
      </p>
    </div>
  );
}
