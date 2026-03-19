import { test, expect } from '@playwright/test'

/**
 * Agency sign-up page tests.
 *
 * Verifies the page renders. Clerk widget visibility requires
 * NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to be set in the Vercel project.
 * Full Clerk sign-up automation is deferred to M8 using Clerk test mode.
 */

test.describe('Agency sign-up page', () => {
  test('/signup/agency renders without 500', async ({ page }) => {
    const response = await page.goto('/signup/agency')
    expect(response?.status()).not.toBe(500)
  })

  test('/signup/agency renders the sign-up layout', async ({ page }) => {
    await page.goto('/signup/agency')
    // The page wraps Clerk SignUp in a centered <main> — verify the shell renders
    await expect(page.locator('main')).toBeVisible()
  })
})
