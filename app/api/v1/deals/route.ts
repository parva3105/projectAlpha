import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAgencyAuth } from "@/lib/auth";
import { CreateDealSchema } from "@/lib/validations/deal";
import {
  ok,
  unauthorized,
  forbidden,
  badRequest,
} from "@/lib/api-response";
import { DealStage } from "@prisma/client";
import { isOverdue } from "@/lib/overdue";

// GET /api/v1/deals
// Query params: stage?, creatorId?, brandId?, overdueOnly?
export async function GET(req: NextRequest) {
  const auth = await requireAgencyAuth();
  if (!auth.ok) {
    return auth.error.type === "unauthenticated" ? unauthorized() : forbidden();
  }

  const { searchParams } = req.nextUrl;
  const stage = searchParams.get("stage") as DealStage | null;
  const creatorId = searchParams.get("creatorId");
  const brandId = searchParams.get("brandId");
  const overdueOnly = searchParams.get("overdueOnly") === "true";

  // Validate stage param if provided
  const validStages = Object.values(DealStage);
  if (stage && !validStages.includes(stage)) {
    return badRequest(`Invalid stage: ${stage}`);
  }

  const deals = await prisma.deal.findMany({
    where: {
      agencyClerkId: auth.userId,
      ...(stage ? { stage } : {}),
      ...(creatorId ? { creatorId } : {}),
      ...(brandId ? { brandId } : {}),
    },
    include: {
      brand: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true, handle: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = overdueOnly ? deals.filter((d) => isOverdue(d)) : deals;

  return ok(result);
}

// POST /api/v1/deals
export async function POST(req: NextRequest) {
  const auth = await requireAgencyAuth();
  if (!auth.ok) {
    return auth.error.type === "unauthenticated" ? unauthorized() : forbidden();
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = CreateDealSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const { title, brandId, creatorId, dealValue, commissionPct, deadline, notes } =
    parsed.data;

  // Verify brand exists
  const brand = await prisma.brand.findUnique({ where: { id: brandId } });
  if (!brand) {
    return badRequest("Brand not found");
  }

  // Verify creator exists if provided
  if (creatorId) {
    const creator = await prisma.creator.findUnique({ where: { id: creatorId } });
    if (!creator) {
      return badRequest("Creator not found");
    }
  }

  // creatorPayout always calculated server-side
  const creatorPayout = dealValue * (1 - commissionPct / 100);

  const deal = await prisma.deal.create({
    data: {
      title,
      agencyClerkId: auth.userId,
      brandId,
      creatorId: creatorId ?? null,
      dealValue,
      commissionPct,
      creatorPayout,
      deadline: deadline ? new Date(deadline) : null,
      notes: notes ?? null,
      stage: DealStage.BRIEF_RECEIVED,
    },
    include: {
      brand: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true, handle: true } },
    },
  });

  return ok(deal, 201);
}
