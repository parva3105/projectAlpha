import { SignIn } from "@clerk/nextjs";
import AuthLayout from "@/components/auth/auth-layout";

export default function LoginPage() {
  return (
    <AuthLayout
      tagline="Welcome back."
      benefits={[
        "Your deal pipeline, ready to go.",
        "All your creators in one place.",
        "Payment status at a glance.",
      ]}
      bottomLink={{ label: "Don't have an account?", text: "Sign up", href: "/signup" }}
    >
      <SignIn
        fallbackRedirectUrl="/dashboard"
        appearance={{ variables: { colorBackground: "transparent" } }}
      />
    </AuthLayout>
  );
}
