'use client';

import { useState } from 'react';
import { SignUp } from '@clerk/nextjs';
import SignupRolePicker from '@/components/auth/signup-role-picker';

/**
 * Detect Clerk SSO multi-step flows via hash fragment (#/continue, #/factor-one, etc.).
 * On direct visits (no hash) we show the role picker.
 * When Clerk drives the flow it appends a hash, so we render the Clerk <SignUp> widget instead.
 *
 * The hash is read once at initialisation using a lazy state initializer —
 * this avoids a redundant useEffect and satisfies the react-hooks/set-state-in-effect rule.
 */
function detectClerkFlow(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.location.hash);
}

export default function SignupPage() {
  const [isClerkFlow] = useState<boolean>(detectClerkFlow);

  if (isClerkFlow) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <SignUp fallbackRedirectUrl="/signup/complete" />
      </main>
    );
  }

  return <SignupRolePicker />;
}
