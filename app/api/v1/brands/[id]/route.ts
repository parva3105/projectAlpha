import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAgencyAuth } from "@/lib/auth";
import {
  ok,
  unauthorized,
  forbidden,
  notFound,
} from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/v1/brands/[id]
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const auth = await requireAgencyAuth();
  if (!auth.ok) {
    return auth.error.type === "unauthenticated" ? unauthorized() : forbidden();
  }

  const { id } = await ctx.params;

  const brand = await prisma.brand.findUnique({
    where: { id },
    include: {
      deals: {
        where: { agencyClerkId: auth.userId },
        include: {
          creator: { select: { id: true, name: true, handle: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!brand) return notFound("Brand");
  return ok(brand);
}
