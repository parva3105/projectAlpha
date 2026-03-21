import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAgencyAuth } from "@/lib/auth";
import { UpdateDealSchema } from "@/lib/validations/deal";
import {
  ok,
  unauthorized,
  forbidden,
  notFound,
  badRequest,
} from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/v1/deals/[id]
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const auth = await requireAgencyAuth();
  if (!auth.ok) {
    return auth.error.type === "unauthenticated" ? unauthorized() : forbidden();
  }

  const { id } = await ctx.params;

  const deal = await prisma.deal.findUnique({
    where: { id, agencyClerkId: auth.userId },
    include: {
      brand: true,
      creator: true,
      submissions: { orderBy: { round: "asc" } },
    },
  });

  if (!deal) return notFound("Deal");
  return ok(deal);
}

// PATCH /api/v1/deals/[id]
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const auth = await requireAgencyAuth();
  if (!auth.ok) {
    return auth.error.type === "unauthenticated" ? unauthorized() : forbidden();
  }

  const { id } = await ctx.params;

  const existing = await prisma.deal.findUnique({
    where: { id, agencyClerkId: auth.userId },
  });
  if (!existing) return notFound("Deal");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = UpdateDealSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const {
    title,
    brandId,
    creatorId,
    dealValue,
    commissionPct,
    deadline,
    notes,
    contractStatus,
    paymentStatus,
  } = parsed.data;

  // Verify brand exists if changing brandId
  if (brandId) {
    const brand = await prisma.brand.findUnique({ where: { id: brandId } });
    if (!brand) return badRequest("Brand not found");
  }

  // Verify creator exists if changing creatorId (null = unassign)
  if (creatorId !== undefined && creatorId !== null) {
    const creator = await prisma.creator.findUnique({ where: { id: creatorId } });
    if (!creator) return badRequest("Creator not found");
  }

  // Recalculate creatorPayout if dealValue or commissionPct changes
  const newDealValue = dealValue ?? Number(existing.dealValue);
  const newCommissionPct = commissionPct ?? Number(existing.commissionPct);
  const shouldRecalculate = dealValue !== undefined || commissionPct !== undefined;
  const newCreatorPayout = shouldRecalculate
    ? newDealValue * (1 - newCommissionPct / 100)
    : undefined;

  const deal = await prisma.deal.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(brandId !== undefined ? { brandId } : {}),
      ...(creatorId !== undefined ? { creatorId } : {}),
      ...(dealValue !== undefined ? { dealValue } : {}),
      ...(commissionPct !== undefined ? { commissionPct } : {}),
      ...(newCreatorPayout !== undefined ? { creatorPayout: newCreatorPayout } : {}),
      ...(deadline !== undefined ? { deadline: deadline ? new Date(deadline) : null } : {}),
      ...(notes !== undefined ? { notes } : {}),
      ...(contractStatus !== undefined ? { contractStatus } : {}),
      ...(paymentStatus !== undefined ? { paymentStatus } : {}),
    },
    include: {
      brand: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true, handle: true } },
    },
  });

  return ok(deal);
}

// DELETE /api/v1/deals/[id]
export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const auth = await requireAgencyAuth();
  if (!auth.ok) {
    return auth.error.type === "unauthenticated" ? unauthorized() : forbidden();
  }

  const { id } = await ctx.params;

  const existing = await prisma.deal.findUnique({
    where: { id, agencyClerkId: auth.userId },
  });
  if (!existing) return notFound("Deal");

  await prisma.deal.delete({ where: { id } });

  return ok({ deleted: true });
}
