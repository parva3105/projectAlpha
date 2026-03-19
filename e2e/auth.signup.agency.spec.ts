import { test, expect } from '@playwright/test'

/**
 * Agency sign-up page tests.
 *
 * Verifies the page renders and the Clerk SignUp component is present.
 * Does NOT automate real sign-up (email verification codes cannot be intercepted).
 * Full Clerk sign-up automation is deferred to M8 using Clerk test mode.
 */

test.describe('Agency sign-up page', () => {
  test('/signup/agency renders without 500', async ({ page }) => {
    const response = await page.goto('/signup/agency')
    expect(response?.status()).not.toBe(500)
  })

  test('/signup/agency contains a sign-up form or Clerk widget', async ({ page }) => {
    await page.goto('/signup/agency')
    // Clerk renders a form element or a data-clerk-* container
    const hasForm = await page.locator('form').count()
    const hasClerkElement = await page.locator('[data-clerk-component]').count()
    expect(hasForm + hasClerkElement).toBeGreaterThan(0)
  })
})
