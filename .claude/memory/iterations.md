# Iteration log — Brand Deal Manager
_Append only. One entry per session or PR. Never delete._

---

## 2026-03-18 — M1 Task 1: Next.js scaffold + shadcn/ui init
**Type**: Setup
**Milestone**: M1 — Foundation
**What changed**:
- Scaffolded `brand-deal-manager/` via `create-next-app@16.2.0` (TypeScript strict, ESLint, Tailwind v4, App Router, `@/*` alias, Turbopack)
- Initialized shadcn/ui v4 (`npx shadcn@latest init -d`) — installed `components/ui/button.tsx`, `lib/utils.ts`, updated `globals.css`
- Geist Sans + Geist Mono already wired via `next/font/google`; verified literal font names in `@theme inline` (no circular `var(--font-*)` refs); font variables on `<html>`, not `<body>`
- Added `typecheck` script to `package.json` (`tsc --noEmit`)
- Set `turbopack.root: __dirname` in `next.config.ts` to silence workspace root detection warning
- Updated app metadata: title = "Brand Deal Manager"
- `npm run dev` → Ready in 1008ms on localhost:3000 ✅
- `npm run typecheck` → zero errors ✅
**Next**: M1 Task 2 — Prisma schema + Neon connection

---

## 2026-03-18 — Project scaffolding
**Type**: Setup
**Milestone**: Pre-M1
**What changed**:
- Created full project scaffolding: CLAUDE.md, .claude/agents/, .claude/commands/, .claude/memory/
- Defined 5 agent roles with file ownership boundaries
- Documented all architectural decisions in decisions.md
- Defined 8-milestone implementation plan (M1–M8, ~26–35 days total)
- No code written yet. All external services still to be provisioned.
**Next**: Provision external services (Vercel, Neon, Clerk, R2, Resend, Trigger.dev, Upstash), then begin M1.