import { test, expect } from '@playwright/test'

/**
 * Creator sign-up page tests.
 */

test.describe('Creator sign-up page', () => {
  test('/signup/creator renders without 500', async ({ page }) => {
    const response = await page.goto('/signup/creator')
    expect(response?.status()).not.toBe(500)
  })

  test('/signup/creator contains a sign-up form or Clerk widget', async ({ page }) => {
    await page.goto('/signup/creator')
    const hasForm = await page.locator('form').count()
    const hasClerkElement = await page.locator('[data-clerk-component]').count()
    expect(hasForm + hasClerkElement).toBeGreaterThan(0)
  })
})
