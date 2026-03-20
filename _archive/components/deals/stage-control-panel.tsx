"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STAGE_ORDER, SYSTEM_CONTROLLED_STAGES } from "@/lib/stage-transitions";
import type { DealStage } from "@prisma/client";

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

interface StageControlPanelProps {
  dealId: string;
  currentStage: DealStage;
  onSuccess?: () => void;
}

export function StageControlPanel({
  dealId,
  currentStage,
  onSuccess,
}: StageControlPanelProps) {
  const router = useRouter();
  const [selectedStage, setSelectedStage] = useState<DealStage | "">("");
  const [advancing, setAdvancing] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  // Forward stages: any stage strictly after current
  const forwardStages = STAGE_ORDER.slice(currentIndex + 1);

  const isSystemControlled = (stage: DealStage) =>
    SYSTEM_CONTROLLED_STAGES.includes(stage);

  async function handleAdvance() {
    if (!selectedStage) return;
    setAdvancing(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/deals/${dealId}/stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetStage: selectedStage }),
      });
      const json = (await res.json()) as { data: unknown; error: string | null };
      if (!res.ok) {
        setError(json.error ?? "Failed to advance stage");
        return;
      }
      onSuccess?.();
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setAdvancing(false);
    }
  }

  async function handleReopen() {
    setReopening(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/deals/${dealId}/reopen`, {
        method: "POST",
      });
      const json = (await res.json()) as { data: unknown; error: string | null };
      if (!res.ok) {
        setError(json.error ?? "Failed to reopen deal");
        return;
      }
      onSuccess?.();
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setReopening(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Current stage badge */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          Current stage:
        </span>
        <Badge
          data-testid="current-stage-badge"
          variant="secondary"
          className="text-sm px-3 py-1"
        >
          {STAGE_LABELS[currentStage]}
        </Badge>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Advance stage */}
      {forwardStages.length > 0 && (
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-1">
            <label
              htmlFor="advance-stage-select"
              className="text-sm font-medium"
            >
              Advance to:
            </label>
            <select
              id="advance-stage-select"
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value as DealStage | "")}
            >
              <option value="">Select a stage…</option>
              {forwardStages.map((stage) => {
                const disabled = isSystemControlled(stage);
                return (
                  <option
                    key={stage}
                    value={stage}
                    disabled={disabled}
                    title={disabled ? "Auto-set by system" : undefined}
                    data-testid={`stage-option-${stage}`}
                  >
                    {STAGE_LABELS[stage]}
                    {disabled ? " (auto)" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <Button
            onClick={handleAdvance}
            disabled={!selectedStage || advancing}
            size="sm"
          >
            {advancing ? "Advancing…" : "Advance Stage"}
          </Button>
        </div>
      )}

      {/* Reopen (hidden at BRIEF_RECEIVED) */}
      {currentStage !== "BRIEF_RECEIVED" && (
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReopen}
            disabled={reopening}
          >
            {reopening ? "Reopening…" : "Reopen (one step back)"}
          </Button>
        </div>
      )}
    </div>
  );
}
