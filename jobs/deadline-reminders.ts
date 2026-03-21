import { schedules } from '@trigger.dev/sdk/v3'
import { db } from '@/lib/db'
import { sendEmailJob } from './send-email'
import { renderEmailToHtml } from '@/lib/email'
import DeadlineWarningEmail from '@/emails/deadline-warning'

export const deadlineRemindersJob = schedules.task({
  id: 'deadline-reminders',
  cron: '0 * * * *', // every hour
  run: async () => {
    const in48h = new Date(Date.now() + 48 * 60 * 60 * 1000)
    const now = new Date()

    const deals = await db.deal.findMany({
      where: {
        deadline: { gte: now, lte: in48h },
        stage: { notIn: ['LIVE', 'CLOSED'] },
      },
    })

    for (const deal of deals) {
      const html = await renderEmailToHtml(
        DeadlineWarningEmail({
          dealTitle: deal.title,
          deadline: deal.deadline?.toISOString() ?? '',
        })
      )
      await sendEmailJob.trigger({
        // TODO: use real agency email once user email lookup is implemented
        to: `${deal.agencyClerkId}@placeholder.dev`,
        subject: `Deadline in 48h: ${deal.title}`,
        html,
      })
    }
  },
})
