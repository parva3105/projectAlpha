import { SignUp } from "@clerk/nextjs";

export default function AgencySignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <SignUp forceRedirectUrl="/api/v1/auth/complete?role=agency" />
    </main>
  );
}
