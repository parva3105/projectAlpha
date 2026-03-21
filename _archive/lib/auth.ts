import { auth } from "@clerk/nextjs/server";

export type AgencyAuthResult = {
  userId: string;
  role: string;
};

export type AuthError =
  | { type: "unauthenticated" }
  | { type: "forbidden"; role: string | undefined };

export type RequireAgencyAuthResult =
  | { ok: true; userId: string; role: string }
  | { ok: false; error: AuthError };

/**
 * Guards a Route Handler to agency-role users only.
 *
 * Returns `{ ok: true, userId, role }` when the caller is authenticated and
 * has role === 'agency' in their Clerk publicMetadata session claim.
 *
 * Returns `{ ok: false, error }` otherwise — the caller is responsible for
 * converting this to an appropriate HTTP response.
 *
 * Clerk session token must include `{ "metadata": "{{user.public_metadata}}" }`
 * (set in Clerk dashboard → Configure → Sessions → Customize session token).
 */
export async function requireAgencyAuth(): Promise<RequireAgencyAuthResult> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return { ok: false, error: { type: "unauthenticated" } };
  }

  // sessionClaims.metadata is set by Clerk session token customization
  const metadata = sessionClaims?.metadata as
    | { role?: string }
    | undefined
    | null;
  const role = metadata?.role;

  if (role !== "agency") {
    return { ok: false, error: { type: "forbidden", role } };
  }

  return { ok: true, userId, role };
}
