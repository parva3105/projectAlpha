import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAgencyAuth } from "@/lib/auth";
import { CreateBrandSchema } from "@/lib/validations/brand";
import {
  ok,
  unauthorized,
  forbidden,
  badRequest,
} from "@/lib/api-response";

// GET /api/v1/brands
export async function GET(_req: NextRequest) {
  const auth = await requireAgencyAuth();
  if (!auth.ok) {
    return auth.error.type === "unauthenticated" ? unauthorized() : forbidden();
  }

  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
  });

  return ok(brands);
}

// POST /api/v1/brands
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

  const parsed = CreateBrandSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const { name, website } = parsed.data;

  const brand = await prisma.brand.create({
    data: {
      name,
      website: website ?? null,
    },
  });

  return ok(brand, 201);
}
