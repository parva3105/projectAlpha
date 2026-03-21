"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StageControlPanel } from "@/components/deals/stage-control-panel";
import type { DealStage, ContractStatus, PaymentStatus } from "@prisma/client";

// ── Types ─────────────────────────────────────────────────────────────────────
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
  dealValue: string | number;
  commissionPct: string | number;
  creatorPayout: string | number;
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

interface DealDetailProps {
  deal: Deal;
}

// ── Stage label map ───────────────────────────────────────────────────────────
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

// ── Contract status badge variant ─────────────────────────────────────────────
function contractBadgeVariant(
  status: ContractStatus
): "outline" | "secondary" | "default" {
  if (status === "SIGNED") return "default";
  if (status === "SENT") return "secondary";
  return "outline";
}

// ── Payment status badge variant ──────────────────────────────────────────────
function paymentBadgeVariant(
  status: PaymentStatus
): "outline" | "default" {
  return status === "RECEIVED" ? "default" : "outline";
}

// ── Overdue check ──────────────────────────────────────────────────────────────
function isOverdue(deal: Pick<Deal, "deadline" | "stage">): boolean {
  if (!deal.deadline) return false;
  const terminalStages: DealStage[] = ["LIVE", "PAYMENT_PENDING", "CLOSED"];
  if (terminalStages.includes(deal.stage)) return false;
  return new Date(deal.deadline) < new Date();
}

// ── Format currency ───────────────────────────────────────────────────────────
function formatUsd(value: string | number): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return `$${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

// ── Main component ────────────────────────────────────────────────────────────
export function DealDetail({ deal }: DealDetailProps) {
  const router = useRouter();
  const [contractLoading, setContractLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [contractError, setContractError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const overdue = isOverdue(deal);

  async function patchDeal(body: Record<string, unknown>) {
    const res = await fetch(`/api/v1/deals/${deal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res;
  }

  async function handleMarkContractSent() {
    setContractLoading(true);
    setContractError(null);
    try {
      const res = await patchDeal({ contractStatus: "SENT" });
      const json = (await res.json()) as { error: string | null };
      if (!res.ok) {
        setContractError(json.error ?? "Failed to update contract");
        return;
      }
      router.refresh();
    } catch {
      setContractError("Network error — please try again");
    } finally {
      setContractLoading(false);
    }
  }

  async function handleMarkContractSigned() {
    setContractLoading(true);
    setContractError(null);
    try {
      const res = await patchDeal({ contractStatus: "SIGNED" });
      const json = (await res.json()) as { error: string | null };
      if (!res.ok) {
        setContractError(json.error ?? "Failed to update contract");
        return;
      }
      router.refresh();
    } catch {
      setContractError("Network error — please try again");
    } finally {
      setContractLoading(false);
    }
  }

  async function handleMarkPaymentReceived() {
    setPaymentLoading(true);
    setPaymentError(null);
    try {
      const res = await patchDeal({ paymentStatus: "RECEIVED" });
      const json = (await res.json()) as { error: string | null };
      if (!res.ok) {
        setPaymentError(json.error ?? "Failed to update payment");
        return;
      }
      router.refresh();
    } catch {
      setPaymentError("Network error — please try again");
    } finally {
      setPaymentLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">{deal.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Created {new Date(deal.createdAt).toLocaleDateString()}
          </p>
        </div>
        {overdue && (
          <Badge variant="destructive">Overdue</Badge>
        )}
      </div>

      {/* Stage control panel */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <StageControlPanel
            dealId={deal.id}
            currentStage={deal.stage}
          />
        </CardContent>
      </Card>

      {/* Section A: Brief */}
      <Card>
        <CardHeader>
          <CardTitle>Section A — Brief</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground font-medium">Brand</p>
              <p>{deal.brand.name}</p>
              {deal.brand.website && (
                <a
                  href={deal.brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary underline-offset-2 hover:underline"
                >
                  {deal.brand.website}
                </a>
              )}
            </div>

            <div>
              <p className="text-muted-foreground font-medium">Creator</p>
              <p>
                {deal.creator
                  ? `${deal.creator.name} (@${deal.creator.handle})`
                  : "Not assigned"}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground font-medium">Deadline</p>
              <p>
                {deal.deadline
                  ? new Date(deal.deadline).toLocaleDateString()
                  : "No deadline set"}
                {overdue && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    Overdue
                  </Badge>
                )}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground font-medium">Current Stage</p>
              <p>{STAGE_LABELS[deal.stage]}</p>
            </div>
          </div>

          {/* Financial details (agency-only — never shown to creator) */}
          <div className="mt-4 rounded-lg border border-border bg-muted/20 p-4 space-y-2 text-sm">
            <p className="font-medium text-muted-foreground uppercase text-xs tracking-wider">
              Deal Financials
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-muted-foreground">Deal Value</p>
                <p className="font-semibold">{formatUsd(deal.dealValue)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Commission</p>
                <p className="font-semibold">
                  {parseFloat(String(deal.commissionPct)).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Creator Payout</p>
                <p className="font-semibold text-green-600 dark:text-green-400">
                  {formatUsd(deal.creatorPayout)}
                </p>
              </div>
            </div>
          </div>

          {deal.notes && (
            <div className="mt-2">
              <p className="text-muted-foreground font-medium text-sm">
                Internal Notes
              </p>
              <p className="text-sm mt-1 whitespace-pre-wrap">{deal.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section B: Contract */}
      <Card>
        <CardHeader>
          <CardTitle>Section B — Contract</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge variant={contractBadgeVariant(deal.contractStatus)}>
              {deal.contractStatus === "PENDING"
                ? "Pending"
                : deal.contractStatus === "SENT"
                ? "Sent"
                : "Signed"}
            </Badge>
          </div>

          {contractError && (
            <p className="text-sm text-destructive">{contractError}</p>
          )}

          <div className="flex gap-2 flex-wrap">
            {deal.contractStatus === "PENDING" && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleMarkContractSent}
                disabled={contractLoading}
              >
                {contractLoading ? "Updating…" : "Mark as Sent"}
              </Button>
            )}
            {deal.contractStatus === "SENT" && (
              <Button
                size="sm"
                onClick={handleMarkContractSigned}
                disabled={contractLoading}
              >
                {contractLoading ? "Updating…" : "Mark as Signed"}
              </Button>
            )}
          </div>

          {deal.contractUrl ? (
            <a
              href={deal.contractUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary underline-offset-2 hover:underline"
            >
              View contract file
            </a>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Upload Contract (available in M4)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Section C: Content */}
      <Card>
        <CardHeader>
          <CardTitle>Section C — Content Approval</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            Content submission available in M3
          </p>
        </CardContent>
      </Card>

      {/* Section D: Payment */}
      <Card>
        <CardHeader>
          <CardTitle>Section D — Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge variant={paymentBadgeVariant(deal.paymentStatus)}>
              {deal.paymentStatus === "RECEIVED" ? "Received" : "Pending"}
            </Badge>
          </div>

          <div className="text-sm space-y-1">
            <div className="flex gap-2">
              <span className="text-muted-foreground">Creator payout:</span>
              <span className="font-semibold">
                {formatUsd(deal.creatorPayout)}
              </span>
            </div>
          </div>

          {paymentError && (
            <p className="text-sm text-destructive">{paymentError}</p>
          )}

          {deal.paymentStatus === "PENDING" && (
            <Button
              size="sm"
              onClick={handleMarkPaymentReceived}
              disabled={paymentLoading}
            >
              {paymentLoading ? "Updating…" : "Mark Payment Received"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
