import { notFound } from "next/navigation";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react";

type ApiResponse<T> = { data: T; error: null } | { data: null; error: string };

type DealStage =
  | "BRIEF_RECEIVED"
  | "CREATOR_ASSIGNED"
  | "CONTRACT_SENT"
  | "IN_PRODUCTION"
  | "PENDING_APPROVAL"
  | "LIVE"
  | "PAYMENT_PENDING"
  | "CLOSED";

type DealFromApi = {
  id: string;
  title: string;
  stage: DealStage;
  dealValue: string | number;
};

type BrandDetail = {
  id: string;
  name: string;
  website: string | null;
  logoUrl: string | null;
  deals: DealFromApi[];
};

const STAGE_LABELS: Record<DealStage, string> = {
  BRIEF_RECEIVED: "Brief Received",
  CREATOR_ASSIGNED: "Creator Assigned",
  CONTRACT_SENT: "Contract Sent",
  IN_PRODUCTION: "In Production",
  PENDING_APPROVAL: "Pending Approval",
  LIVE: "Live",
  PAYMENT_PENDING: "Payment Pending",
  CLOSED: "Closed",
};

type StageVariant = "default" | "secondary" | "outline" | "destructive";

function stageVariant(stage: DealStage): StageVariant {
  switch (stage) {
    case "LIVE":
      return "default";
    case "CLOSED":
      return "secondary";
    case "PENDING_APPROVAL":
      return "outline";
    default:
      return "outline";
  }
}

function formatDollars(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num / 100);
}

async function fetchBrand(id: string): Promise<BrandDetail | null> {
  const cookieHeader = (await cookies()).toString();
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/v1/brands/${id}`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) return null;

  const json = (await res.json()) as ApiResponse<BrandDetail>;
  if (json.error || !json.data) return null;

  return json.data;
}

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function BrandDetailPage({ params }: Props) {
  const { id } = await params;
  const brand = await fetchBrand(id);

  if (!brand) notFound();

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/brands"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeftIcon className="size-3.5" />
        All brands
      </Link>

      {/* Brand header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{brand.name}</h1>
        {brand.website && (
          <a
            href={brand.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {brand.website}
            <ExternalLinkIcon className="size-3" />
          </a>
        )}
      </div>

      {/* Associated deals */}
      <section className="space-y-3">
        <h2 className="text-base font-medium">Associated deals</h2>

        {brand.deals.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center">
            <p className="text-sm text-muted-foreground">
              No deals associated with this brand yet.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deal</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brand.deals.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell>
                    <Link
                      href={`/deals/${deal.id}`}
                      className="font-medium hover:underline underline-offset-4"
                    >
                      {deal.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={stageVariant(deal.stage)}>
                      {STAGE_LABELS[deal.stage]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatDollars(deal.dealValue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
