# Staging + deployment guide

Read this file before performing any deployment-related task.

---

## Environments

| Environment | URL | Branch | Database |
|---|---|---|---|
| Local dev | http://localhost:3000 | any | Neon `dev` branch |
| PR preview | auto-assigned Vercel URL | feature branch | Neon PR branch (auto-created) |
| Production | your Vercel domain | `main` | Neon `main` branch |

---

## Local development setup
```bash
# 1. Clone the repo
git clone https://github.com/YOUR_ORG/brand-deal-manager.git
cd brand-deal-manager

# 2. Install dependencies
npm install

# 3. Copy env template and fill in your keys
cp .env.example .env.local

# 4. Generate Prisma client
npx prisma generate

# 5. Push schema to your Neon dev branch (no migration history)
npx prisma db push

# 6. Start the Next.js dev server
npm run dev

# 7. In a separate terminal — start Trigger.dev local runner (for email jobs)
npx trigger.dev@latest dev
```

Open http://localhost:3000.

---

## Running scripts
```bash
npm run dev          # Start dev server (Next.js)
npm run build        # Production build
npm run typecheck    # TypeScript type check only
npm run lint         # ESLint
npm run test         # Vitest (unit + component tests)
npm run test:e2e     # Playwright (smoke tests — requires running server)
npx prisma studio    # Open Prisma Studio (DB browser)
npx prisma migrate dev --name     # Create a new migration (local dev)
npx prisma migrate deploy               # Apply migrations (CI/CD — runs against UNPOOLED URL)
```

---

## Neon database branches

Neon creates a database branch automatically for each PR (via GitHub integration).

- Each PR branch inherits from `main` at branch creation time
- The CI pipeline runs against the PR branch's database
- Branch is deleted automatically when the PR is closed
- To manually create a branch: Neon console → Branches → Create branch

---

## Deploying to production

Production deploys happen automatically when code is merged to `main`:
1. GitHub Actions runs the CI pipeline (type-check, lint, test, build)
2. If CI passes, the `staging.yml` workflow runs `prisma migrate deploy` against the production database
3. Vercel picks up the push to `main` and deploys automatically

**Never run `prisma migrate dev` against production.** Use `prisma migrate deploy` only.

---

## Adding new environment variables

1. Add to `.env.example` with an empty value and a comment (DevOps agent does this)
2. Add to your `.env.local` with the real value
3. Add to Vercel dashboard: Settings → Environment Variables
4. Add to GitHub Actions secrets if needed for CI (Settings → Secrets → Actions)
5. Note the addition in `.claude/memory/decisions.md`

---

## Trigger.dev (background jobs)

Jobs run in the cloud in production (Trigger.dev handles this). Locally:
```bash
npx trigger.dev@latest dev
```

This connects your local Next.js server to the Trigger.dev cloud, allowing jobs to be triggered and run locally with full observability in the Trigger.dev dashboard.

Jobs defined in `jobs/`:
- `send-email.ts` — sends all 11 email types via Resend, retries up to 3×
- `deadline-reminders.ts` — cron: every hour, finds deals within 48h of deadline

---

## Cloudflare R2 upload flow (content submissions)

1. Creator requests a signed upload URL from `/api/v1/uploads/content`
2. Client uploads directly to R2 using TUS protocol (`tus-js-client`)
3. On completion, client notifies `/api/v1/deals/:id/submissions` with the final R2 URL
4. Server saves `contentUrl` to `ContentSubmission` record

Max file size: 500MB. TUS handles connection drops and mobile upload resumption.

---

## First deployment checklist (M1)

Before deploying for the first time:
- [ ] Vercel project created and linked to GitHub repo
- [ ] All env vars added to Vercel dashboard
- [ ] Neon project created, GitHub integration installed
- [ ] Clerk app created, 3 roles confirmed in publicMetadata
- [ ] R2 bucket created, public access endpoint configured
- [ ] Resend domain verified, `EMAIL_FROM` set
- [ ] Trigger.dev project created, `TRIGGER_SECRET_KEY` set
- [ ] Upstash Redis created, credentials set
- [ ] `npx prisma migrate deploy` run against production database
- [ ] Smoke test: one user per role can sign up, log in, land on correct page