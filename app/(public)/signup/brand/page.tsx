import { SignUp } from '@clerk/nextjs'

export default function SignUpBrandPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUp routing="hash" unsafeMetadata={{ role: 'brand_manager' }} />
    </div>
  )
}
