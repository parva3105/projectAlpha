import { SignUp } from "@clerk/nextjs";
import AuthLayout from "@/components/auth/auth-layout";

export default function BrandSignUpPage() {
  return (
    <AuthLayout
      tagline="Find the right creators for every campaign."
      benefits={[
        "Submit campaign briefs in minutes.",
        "Connect directly with top agencies.",
        "Track brief status in real time.",
      ]}
      bottomLink={{ label: "Wrong role?", text: "Back to role selection", href: "/signup" }}
    >
      <SignUp
        forceRedirectUrl="/api/v1/auth/complete?role=brand_manager"
        appearance={{ variables: { colorBackground: "transparent" } }}
      />
    </AuthLayout>
  );
}
