import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { DealNewForm } from "@/components/forms/deal-new-form";

// Types matching what the API returns
interface Brand {
  id: string;
  name: string;
  website: string | null;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Creator {
  id: string;
  name: string;
  handle: string;
}

async function fetchBrands(token: string): Promise<Brand[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/v1/brands`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { data: Brand[] };
  return json.data ?? [];
}

async function fetchCreators(token: string): Promise<Creator[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/v1/roster`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { data: Creator[] };
  return json.data ?? [];
}

export default async function NewDealPage() {
  const { userId, getToken } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const token = await getToken();
  const [brands, creators] = await Promise.all([
    fetchBrands(token ?? ""),
    fetchCreators(token ?? ""),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span>New Deal</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Create New Deal</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in the deal details. You can assign a creator and advance the stage after creation.
        </p>
      </div>

      <DealNewForm brands={brands} creators={creators} />
    </div>
  );
}
