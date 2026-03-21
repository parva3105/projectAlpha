import { SignUp } from "@clerk/nextjs";
import AuthLayout from "@/components/auth/auth-layout";

export default function AgencySignUpPage() {
  return (
    <AuthLayout
      tagline="Your deal pipeline, organised."
      benefits={[
        "Replace spreadsheets with a live Kanban board.",
        "Track every creator, deal, and payment.",
        "Commission calculated automatically.",
      ]}
      bottomLink={{ label: "Wrong role?", text: "Back to role selection", href: "/signup" }}
    >
      <SignUp
        forceRedirectUrl="/api/v1/auth/complete?role=agency"
        appearance={{ variables: { colorBackground: "transparent" } }}
      />
    </AuthLayout>
  );
}
