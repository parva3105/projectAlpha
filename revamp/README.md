# Brand Deal Manager — Revamp

This directory contains the planning and specification documents for the revamped Brand Deal Manager.

## Why This Exists

The original codebase reached M2 (Agency Deal Pipeline complete) but was built with auth and database tightly coupled from the start. This revamp takes a different approach:

**Build the UI first. Wire in the backend second. Add auth last.**

This means:
- You can run the app and click through every flow without any database or Clerk account
- UI bugs are caught before backend complexity is introduced
- The backend API contracts are defined by what the UI actually needs — not guessed upfront

## How to Read These Docs

| File | What It Covers |
|---|---|
| `PRODUCT.md` | What we're building — roles, user stories, features, constraints |
| `ARCHITECTURE.md` | Tech stack, folder structure, how the 3 phases are separated |
| `ROADMAP.md` | Milestone table — every task, every phase |
| `FRONTEND.md` | Every page, every component, mock data notes for Phase 1 |
| `BACKEND.md` | Every API endpoint, Prisma models, Zod schemas for Phase 2 |
| `MOCKDATA.md` | Mock data shapes and fixture strategy for Phase 1 |

## The 3 Phases

```
Phase 1 — UI Shell
  Build all pages with mock/static data.
  No database. No Clerk. No API calls.
  Goal: Fully clickable prototype you can demo.

Phase 2 — Backend Integration
  Replace mock data with real fetch() calls.
  Build all /api/v1/ Route Handlers.
  Connect Prisma + Neon DB.
  Goal: Pages show real data. Forms persist.

Phase 3 — Auth + Polish
  Add Clerk authentication.
  Role-based routing via proxy.ts.
  Playwright smoke tests.
  Goal: Production-ready and deployed.
```

## What This Is NOT

- These docs are not code. The implementation lives in the app root (`app/`, `components/`, `lib/`).
- The existing codebase (M1 + M2) is not deleted — it stays in place as reference.
- This directory is the blueprint. The actual build follows the roadmap.
