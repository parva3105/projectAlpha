import { SignUp } from "@clerk/nextjs";
import AuthLayout from "@/components/auth/auth-layout";

export default function CreatorSignUpPage() {
  return (
    <AuthLayout
      tagline="Get paid. Stay on brand."
      benefits={[
        "See every deal assigned to you.",
        "Submit content and track feedback.",
        "Know your payout before you sign.",
      ]}
      bottomLink={{ label: "Wrong role?", text: "Back to role selection", href: "/signup" }}
    >
      <SignUp
        forceRedirectUrl="/api/v1/auth/complete?role=creator"
        appearance={{ variables: { colorBackground: "transparent" } }}
      />
    </AuthLayout>
  );
}
