import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAgencyAuth } from "@/lib/auth";
import { AdvanceStageSchema } from "@/lib/validations/deal";
import {
  ok,
  unauthorized,
  forbidden,
  notFound,
  badRequest,
  unprocessable,
} from "@/lib/api-response";
import {
  isValidAdvance,
  SYSTEM_CONTROLLED_STAGES,
} from "@/lib/stage-transitions";

type RouteContext = { params: Promise<{ id: string }> };

// POST /api/v1/deals/[id]/stage
// Advances the deal stage forward. Cannot manually set PENDING_APPROVAL or LIVE.
export async function POST(req: NextRequest, ctx: RouteContext) {
  const auth = await requireAgencyAuth();
  if (!auth.ok) {
    return auth.error.type === "unauthenticated" ? unauthorized() : forbidden();
  }

  const { id } = await ctx.params;

  const deal = await prisma.deal.findUnique({
    where: { id, agencyClerkId: auth.userId },
  });
  if (!deal) return notFound("Deal");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = AdvanceStageSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const { targetStage } = parsed.data;

  // Reject manual advance to system-controlled stages
  if (SYSTEM_CONTROLLED_STAGES.includes(targetStage)) {
    return unprocessable("Stage is system-controlled");
  }

  // Validate forward direction
  if (!isValidAdvance(deal.stage, targetStage)) {
    return unprocessable(
      `Cannot advance from ${deal.stage} to ${targetStage}: target must be after current stage`
    );
  }

  const updated = await prisma.deal.update({
    where: { id },
    data: { stage: targetStage },
    include: {
      brand: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true, handle: true } },
    },
  });

  return ok(updated);
}
