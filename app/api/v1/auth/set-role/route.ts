import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const VALID_ROLES = ["agency", "creator", "brand_manager"] as const;
type Role = (typeof VALID_ROLES)[number];

// POST /api/v1/auth/set-role
// Body: { role: "agency" | "creator" | "brand_manager" }
// Called from the role picker when a user signs in via Google/SSO on /login
// without going through the role-specific /signup/:role page.
export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { data: null, error: "Unauthenticated" },
      { status: 401 }
    );
  }

  let body: { role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { data: null, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const role = body.role as Role | undefined;

  if (!role || !(VALID_ROLES as readonly string[]).includes(role)) {
    return NextResponse.json(
      { data: null, error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
      { status: 400 }
    );
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { role },
  });

  return NextResponse.json({ data: { role }, error: null });
}
