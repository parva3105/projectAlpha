import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { DealDetail } from "@/components/deals/deal-detail";
import type { DealStage, ContractStatus, PaymentStatus } from "@prisma/client";

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
  clerkId: string;
  bio: string | null;
  avatarUrl: string | null;
  platforms: string[];
  nicheTags: string[];
  followerCount: number | null;
  engagementRate: unknown;
  isPublic: boolean;
  agencyClerkId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ContentSubmission {
  id: string;
  dealId: string;
  creatorId: string;
  round: number;
  url: string | null;
  fileKey: string | null;
  status: string;
  feedback: string | null;
  submittedAt: Date;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Deal {
  id: string;
  title: string;
  stage: DealStage;
  dealValue: string;
  commissionPct: string;
  creatorPayout: string;
  deadline: Date | null;
  notes: string | null;
  contractStatus: ContractStatus;
  paymentStatus: PaymentStatus;
  contractUrl: string | null;
  briefId: string | null;
  agencyClerkId: string;
  brandId: string;
  creatorId: string | null;
  createdAt: Date;
  updatedAt: Date;
  brand: Brand;
  creator: Creator | null;
  submissions: ContentSubmission[];
}

async function fetchDeal(id: string, token: string): Promise<Deal | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/v1/deals/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  const json = (await res.json()) as { data: Deal | null };
  return json.data ?? null;
}

interface DealPageProps {
  params: Promise<{ id: string }>;
}

export default async function DealPage({ params }: DealPageProps) {
  const { id } = await params;
  const { userId, getToken } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const token = await getToken();
  const deal = await fetchDeal(id, token ?? "");

  if (!deal) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Link
            href="/dashboard"
            className="hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <span>/</span>
          <Link
            href="/deals"
            className="hover:text-foreground transition-colors"
          >
            Deals
          </Link>
          <span>/</span>
          <span className="truncate max-w-48">{deal.title}</span>
        </div>
      </div>

      <DealDetail deal={deal} />
    </div>
  );
}
