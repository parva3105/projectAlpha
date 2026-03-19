import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const VALID_ROLES = ["agency", "creator", "brand_manager"] as const;
type Role = (typeof VALID_ROLES)[number];

// GET /api/v1/auth/complete?role=<role>
// Called after Clerk sign-up via forceRedirectUrl.
// Sets publicMetadata.role on the newly created user, then sends them to
// /signup/complete where the client reloads the session token to pick up the
// new claim before redirecting to the role-appropriate home page.
export async function GET(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role") as Role | null;

  if (!role || !(VALID_ROLES as readonly string[]).includes(role)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { role },
  });

  // Redirect to client page that calls session.reload() so the new JWT
  // claim is picked up before routing to the role home page.
  return NextResponse.redirect(new URL("/signup/complete", req.url));
}
