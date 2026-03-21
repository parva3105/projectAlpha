import { SignUp } from '@clerk/nextjs'

export default function SignUpAgencyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUp routing="hash" unsafeMetadata={{ role: 'agency' }} />
    </div>
  )
}
