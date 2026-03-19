import { test, expect } from '@playwright/test'

/**
 * Unauthenticated access tests.
 *
 * Protected routes must redirect to /login.
 * Public routes must render without a 500 error.
 *
 * NOTE: Real Clerk sign-up automation (email verification codes) is deferred to M8.
 * These tests only verify page availability and redirect behaviour.
 *
 * NOTE: Requires CLERK_SECRET_KEY + NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to be set
 * in the Vercel project for clerkMiddleware to enforce redirects.
 */

test.describe('Unauthenticated — protected routes redirect to /login', () => {
  test('/dashboard redirects unauthenticated user to /login', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    await expect(page).toHaveURL(/login|sign-in/, { timeout: 15_000 })
  })

  test('/creator/deals redirects unauthenticated user to /login', async ({ page }) => {
    await page.goto('/creator/deals', { waitUntil: 'networkidle' })
    await expect(page).toHaveURL(/login|sign-in/, { timeout: 15_000 })
  })

  test('/briefs/new redirects unauthenticated user to /login', async ({ page }) => {
    await page.goto('/briefs/new', { waitUntil: 'networkidle' })
    await expect(page).toHaveURL(/login|sign-in/, { timeout: 15_000 })
  })

  test('/roster redirects unauthenticated user to /login', async ({ page }) => {
    await page.goto('/roster', { waitUntil: 'networkidle' })
    await expect(page).toHaveURL(/login|sign-in/, { timeout: 15_000 })
  })

  test('/deals redirects unauthenticated user to /login', async ({ page }) => {
    await page.goto('/deals', { waitUntil: 'networkidle' })
    await expect(page).toHaveURL(/login|sign-in/, { timeout: 15_000 })
  })
})
