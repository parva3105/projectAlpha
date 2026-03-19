import { Suspense } from "react";
import { cookies } from "next/headers";
import { KanbanBoard, type KanbanDeal } from "@/components/kanban/KanbanBoard";
import { KanbanFilters } from "@/components/kanban/KanbanFilters";
import { isOverdue } from "@/lib/overdue";
import type { DealStage } from "@/lib/stage-transitions";

interface DealFromApi {
  id: string;
  title: string;
  stage: DealStage;
  dealValue: number;
  deadline: string | null;
  brand: { id: string; name: string };
  creator: { id: string; name: string; handle: string } | null;
}

interface SearchParams {
  platform?: string;
  creator?: string;
  brand?: string;
  overdueOnly?: string;
}

async function fetchDeals(searchParams: SearchParams): Promise<KanbanDeal[]> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const params = new URLSearchParams();
  if (searchParams.overdueOnly === "true") {
    params.set("overdueOnly", "true");
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/v1/deals?${params.toString()}`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });

  if (!res.ok) {
    // Return empty list rather than throw — the board renders an empty state
    return [];
  }

  const json = (await res.json()) as {
    data: DealFromApi[] | null;
    error: string | null;
  };

  if (!json.data) return [];

  // Apply client-side filters not supported by the API (platform, creator name, brand name)
  let deals: DealFromApi[] = json.data;

  if (searchParams.creator) {
    const q = searchParams.creator.toLowerCase();
    deals = deals.filter((d) =>
      d.creator?.name.toLowerCase().includes(q)
    );
  }

  if (searchParams.brand) {
    const q = searchParams.brand.toLowerCase();
    deals = deals.filter((d) => d.brand.name.toLowerCase().includes(q));
  }

  // Map to the shape KanbanBoard expects
  return deals.map((d) => ({
    id: d.id,
    title: d.title,
    stage: d.stage,
    dealValue: Number(d.dealValue),
    deadline: d.deadline,
    brandName: d.brand.name,
    creatorName: d.creator?.name ?? null,
    isOverdue: isOverdue({ deadline: d.deadline, stage: d.stage }),
  }));
}

interface DashboardPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const deals = await fetchDeals(params);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Deal Pipeline</h1>
        <span className="text-sm text-muted-foreground">
          {deals.length} deal{deals.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Filter bar — client component */}
      <Suspense>
        <KanbanFilters />
      </Suspense>

      {deals.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border">
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">No deals found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Adjust your filters or create a new deal to get started.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto">
          <KanbanBoard initialDeals={deals} />
        </div>
      )}
    </div>
  );
}
