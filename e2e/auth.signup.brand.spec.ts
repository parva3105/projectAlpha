import { test, expect } from '@playwright/test'

/**
 * Brand manager sign-up page tests.
 */

test.describe('Brand manager sign-up page', () => {
  test('/signup/brand renders without 500', async ({ page }) => {
    const response = await page.goto('/signup/brand')
    expect(response?.status()).not.toBe(500)
  })

  test('/signup/brand contains a sign-up form or Clerk widget', async ({ page }) => {
    await page.goto('/signup/brand')
    const hasForm = await page.locator('form').count()
    const hasClerkElement = await page.locator('[data-clerk-component]').count()
    expect(hasForm + hasClerkElement).toBeGreaterThan(0)
  })
})
