import { test, expect } from '@playwright/test'

/**
 * Creator sign-up page tests.
 */

test.describe('Creator sign-up page', () => {
  test('/signup/creator renders without 500', async ({ page }) => {
    const response = await page.goto('/signup/creator')
    expect(response?.status()).not.toBe(500)
  })

  test('/signup/creator renders the sign-up layout', async ({ page }) => {
    await page.goto('/signup/creator')
    await expect(page.locator('main')).toBeVisible()
  })
})
