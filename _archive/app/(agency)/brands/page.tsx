import { cookies, headers } from "next/headers";
import { BrandsTable, type BrandRow } from "@/components/brands/brands-table";
import { AddBrandDialog } from "@/components/brands/add-brand-dialog";

type ApiResponse<T> = { data: T; error: null } | { data: null; error: string };

type BrandFromApi = {
  id: string;
  name: string;
  website: string | null;
  deals?: Array<{
    id: string;
    stage: string;
    dealValue: string | number;
  }>;
};

async function fetchBrands(): Promise<BrandRow[]> {
  // Build absolute URL for server-side fetch — required in App Router RSC
  const cookieHeader = (await cookies()).toString();
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/v1/brands`, {
    headers: {
      cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (!res.ok) return [];

  const json = (await res.json()) as ApiResponse<BrandFromApi[]>;
  if (json.error || !json.data) return [];

  // The list endpoint returns brands without deals[].
  // We map to BrandRow shape — open deal count / total value
  // are not available from the list endpoint without per-brand fetches.
  // They default to 0 here; the brand detail page shows the full data.
  return json.data.map((b) => ({
    id: b.id,
    name: b.name,
    website: b.website,
    openDealCount: 0,
    totalDealValue: 0,
  }));
}

export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const brands = await fetchBrands();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Brands</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All brands associated with your deals.
          </p>
        </div>
        <AddBrandDialog />
      </div>

      <BrandsTable brands={brands} />
    </div>
  );
}
