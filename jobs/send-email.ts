import { task } from '@trigger.dev/sdk/v3'
import { Resend } from 'resend'

// Lazy init — new Resend() throws at module load if RESEND_API_KEY is absent,
// which crashes next build in CI before the secret is provisioned.
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

export const sendEmailJob = task({
  id: 'send-email',
  run: async (payload: {
    to: string
    subject: string
    html: string
  }) => {
    await getResend().emails.send({
      from: process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    })
  },
})
