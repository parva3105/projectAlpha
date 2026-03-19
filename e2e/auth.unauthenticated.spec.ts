import { test, expect } from '@playwright/test'

/**
 * Unauthenticated access tests.
 *
 * Protected routes must redirect to /login.
 * Public routes must render without a 500 error.
 *
 * NOTE: Real Clerk sign-up automation (email verification codes) is deferred to M8.
 * These tests only verify page availability and redirect behaviour.
 */

test.describe('Unauthenticated — protected routes redirect to /login', () => {
  test('/dashboard redirects unauthenticated user to /login', async ({ page }) => {
    const response = await page.goto('/dashboard')
    // After redirect chain, we should land on /login (or a Clerk-hosted page)
    await expect(page).toHaveURL(/login|sign-in/)
    expect(response?.status()).not.toBe(500)
  })

  test('/creator/deals redirects unauthenticated user to /login', async ({ page }) => {
    await page.goto('/creator/deals')
    await expect(page).toHaveURL(/login|sign-in/)
  })

  test('/briefs/new redirects unauthenticated user to /login', async ({ page }) => {
    await page.goto('/briefs/new')
    await expect(page).toHaveURL(/login|sign-in/)
  })

  test('/roster redirects unauthenticated user to /login', async ({ page }) => {
    await page.goto('/roster')
    await expect(page).toHaveURL(/login|sign-in/)
  })

  test('/deals redirects unauthenticated user to /login', async ({ page }) => {
    await page.goto('/deals')
    await expect(page).toHaveURL(/login|sign-in/)
  })
})
