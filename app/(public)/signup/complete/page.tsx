"use client";

// This page is reached after /api/v1/auth/complete sets publicMetadata.role.
// The JWT might not include the new claim yet (short TTL), so we call
// session.reload() to force Clerk to re-fetch and reissue the token, then
// redirect to the role-appropriate home page.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@clerk/nextjs";

type Role = "agency" | "creator" | "brand_manager";

const ROLE_HOME: Record<Role, string> = {
  agency: "/dashboard",
  creator: "/creator/deals",
  brand_manager: "/briefs/new",
};

export default function SignupCompletePage() {
  const router = useRouter();
  const { session, isLoaded } = useSession();

  useEffect(() => {
    if (!isLoaded) return;

    if (!session) {
      router.replace("/login");
      return;
    }

    const redirect = async () => {
      // Force Clerk to re-fetch the session so the updated publicMetadata.role
      // claim is reflected in the JWT before we check it.
      await session.reload();

      const role = session.user.publicMetadata.role as Role | undefined;
      const destination = role ? ROLE_HOME[role] : "/login";
      router.replace(destination);
    };

    redirect();
  }, [isLoaded, session, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Setting up your account…</p>
    </main>
  );
}
