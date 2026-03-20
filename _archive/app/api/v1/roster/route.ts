import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAgencyAuth } from "@/lib/auth";
import { AddCreatorToRosterSchema } from "@/lib/validations/roster";
import {
  ok,
  unauthorized,
  forbidden,
  badRequest,
} from "@/lib/api-response";

// GET /api/v1/roster
// Returns all creators rostered to the authenticated agency.
export async function GET(_req: NextRequest) {
  const auth = await requireAgencyAuth();
  if (!auth.ok) {
    return auth.error.type === "unauthenticated" ? unauthorized() : forbidden();
  }

  const creators = await prisma.creator.findMany({
    where: { agencyClerkId: auth.userId },
    orderBy: { name: "asc" },
  });

  return ok(creators);
}

// POST /api/v1/roster
// Manually adds a creator to the agency roster (without a Clerk account).
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

  const parsed = AddCreatorToRosterSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const { name, handle, platform, email } = parsed.data;

  // Check handle uniqueness
  const existing = await prisma.creator.findUnique({ where: { handle } });
  if (existing) {
    return badRequest(`Handle "${handle}" is already taken`);
  }

  // Generate a placeholder clerkId for manually-added creators (no Clerk account)
  // Using crypto.randomUUID which is available in Node 16+ and Next.js edge runtime
  const placeholderClerkId = `roster_${crypto.randomUUID()}`;

  const creator = await prisma.creator.create({
    data: {
      clerkId: placeholderClerkId,
      name,
      handle,
      platforms: [platform],
      isPublic: false,
      agencyClerkId: auth.userId,
      // email is not a field on Creator — store in bio if provided, or omit
    },
  });

  // Note: email is captured in validation but Creator model has no email field.
  // Accepted as input for future use / API completeness. Not persisted in MVP.
  void email;

  return ok(creator, 201);
}
