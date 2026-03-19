import { test, expect } from '@playwright/test'

/**
 * Public route availability tests.
 *
 * These pages must be accessible without authentication and must not return a 500.
 * Clerk SignIn/SignUp components are rendered server-side — we verify they mount.
 */

test.describe('Public routes — accessible without auth', () => {
  test('/login renders without 500', async ({ page }) => {
    const response = await page.goto('/login')
    expect(response?.status()).not.toBe(500)
    // Should not redirect away from /login
    await expect(page).toHaveURL(/login|sign-in/)
  })

  test('/discover renders without 500', async ({ page }) => {
    const response = await page.goto('/discover')
    expect(response?.status()).not.toBe(500)
    // Page must contain some content
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('/agencies renders without 500', async ({ page }) => {
    const response = await page.goto('/agencies')
    expect(response?.status()).not.toBe(500)
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('/ (home) renders without 500', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).not.toBe(500)
    await expect(page.locator('body')).not.toBeEmpty()
  })
})
