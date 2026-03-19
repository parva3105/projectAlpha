import { test, expect } from '@playwright/test'

/**
 * Brand manager sign-up page tests.
 */

test.describe('Brand manager sign-up page', () => {
  test('/signup/brand renders without 500', async ({ page }) => {
    const response = await page.goto('/signup/brand')
    expect(response?.status()).not.toBe(500)
  })

  test('/signup/brand renders the sign-up layout', async ({ page }) => {
    await page.goto('/signup/brand')
    await expect(page.locator('main')).toBeVisible()
  })
})
