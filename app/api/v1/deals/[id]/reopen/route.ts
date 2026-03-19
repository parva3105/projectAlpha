import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAgencyAuth } from "@/lib/auth";
import {
  ok,
  unauthorized,
  forbidden,
  notFound,
  unprocessable,
} from "@/lib/api-response";
import { getPreviousStage } from "@/lib/stage-transitions";

type RouteContext = { params: Promise<{ id: string }> };

// POST /api/v1/deals/[id]/reopen
// Moves the deal one stage backward (Reopen). Cannot reopen from BRIEF_RECEIVED.
export async function POST(_req: NextRequest, ctx: RouteContext) {
  const auth = await requireAgencyAuth();
  if (!auth.ok) {
    return auth.error.type === "unauthenticated" ? unauthorized() : forbidden();
  }

  const { id } = await ctx.params;

  const deal = await prisma.deal.findUnique({
    where: { id, agencyClerkId: auth.userId },
  });
  if (!deal) return notFound("Deal");

  const previousStage = getPreviousStage(deal.stage);

  if (previousStage === null) {
    return unprocessable(
      "Cannot reopen: deal is already at the first stage (BRIEF_RECEIVED)"
    );
  }

  const updated = await prisma.deal.update({
    where: { id },
    data: { stage: previousStage },
    include: {
      brand: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true, handle: true } },
    },
  });

  return ok(updated);
}
