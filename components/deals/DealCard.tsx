import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { DealStage } from "@/lib/stage-transitions";

export interface DealCardDeal {
  id: string;
  title: string;
  brandName: string;
  creatorName: string | null;
  deadline: string | null;
  dealValue: number;
  stage: DealStage;
  isOverdue: boolean;
}

interface DealCardProps {
  deal: DealCardDeal;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDeadline(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function DealCard({ deal }: DealCardProps) {
  return (
    <Link
      href={`/deals/${deal.id}`}
      className="block rounded-lg border border-border bg-card p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-sm font-medium leading-tight line-clamp-2 text-card-foreground">
          {deal.title}
        </p>
        {deal.isOverdue && (
          <Badge variant="destructive" className="shrink-0 text-[10px]">
            Overdue
          </Badge>
        )}
      </div>

      <p className="text-xs text-muted-foreground mb-2">{deal.brandName}</p>

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground truncate">
          {deal.creatorName ?? "Unassigned"}
        </span>
        <span className="text-xs font-mono font-semibold text-foreground shrink-0">
          {formatCurrency(deal.dealValue)}
        </span>
      </div>

      {deal.deadline && (
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Due {formatDeadline(deal.deadline)}
        </p>
      )}
    </Link>
  );
}
