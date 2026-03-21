import { task } from '@trigger.dev/sdk/v3'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendEmailJob = task({
  id: 'send-email',
  run: async (payload: {
    to: string
    subject: string
    html: string
  }) => {
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    })
  },
})
