"use client";

// This page is reached after /api/v1/auth/complete sets publicMetadata.role.
// The JWT might not include the new claim yet (short TTL), so we call
// session.reload() to force Clerk to re-fetch and reissue the token, then
// redirect to the role-appropriate home page.
//
// If no role is found (e.g., user signed in via Google on /login instead of
// going through /signup/agency), show a role picker so they can set their role.

import { useEffect, useState } from "react";
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
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [settingRole, setSettingRole] = useState(false);

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
      if (role) {
        router.replace(ROLE_HOME[role]);
      } else {
        // No role set — user likely signed in via Google on /login
        // instead of going through /signup/agency. Show role picker.
        setShowRolePicker(true);
      }
    };

    redirect();
  }, [isLoaded, session, router]);

  const handleRoleSelect = async (role: Role) => {
    setSettingRole(true);
    try {
      const res = await fetch("/api/v1/auth/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        // Reload session to pick up the new role claim in the JWT
        await session?.reload();
        router.replace(ROLE_HOME[role]);
      } else {
        setSettingRole(false);
      }
    } catch {
      setSettingRole(false);
    }
  };

  if (showRolePicker) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="mx-auto max-w-md space-y-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Choose your role
          </h1>
          <p className="text-sm text-muted-foreground">
            Select how you&apos;ll use Brand Deal Manager
          </p>
          <div className="space-y-3">
            <button
              onClick={() => handleRoleSelect("agency")}
              disabled={settingRole}
              className="w-full rounded-lg border border-border bg-card p-4 text-left hover:bg-accent transition-colors disabled:opacity-50"
            >
              <p className="font-semibold">Agency Account Manager</p>
              <p className="text-sm text-muted-foreground">
                Manage deals, creators, and brand partnerships
              </p>
            </button>
            <button
              onClick={() => handleRoleSelect("creator")}
              disabled={settingRole}
              className="w-full rounded-lg border border-border bg-card p-4 text-left hover:bg-accent transition-colors disabled:opacity-50"
            >
              <p className="font-semibold">Creator / Influencer</p>
              <p className="text-sm text-muted-foreground">
                View deals, submit content, track payments
              </p>
            </button>
            <button
              onClick={() => handleRoleSelect("brand_manager")}
              disabled={settingRole}
              className="w-full rounded-lg border border-border bg-card p-4 text-left hover:bg-accent transition-colors disabled:opacity-50"
            >
              <p className="font-semibold">Brand Manager</p>
              <p className="text-sm text-muted-foreground">
                Submit briefs and discover creators
              </p>
            </button>
          </div>
          {settingRole && (
            <p className="text-sm text-muted-foreground">
              Setting up your account…
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Setting up your account…</p>
    </main>
  );
}
