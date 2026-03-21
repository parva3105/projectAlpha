import { Page } from '@playwright/test'

// Sets the active_perspective cookie for superadmin testing
// This bypasses Clerk's sign-in widget in tests
export async function setAgencyPerspective(page: Page) {
  await page.context().addCookies([
    {
      name: 'active_perspective',
      value: 'agency',
      domain: 'localhost',
      path: '/',
    },
  ])
}

export async function setCreatorPerspective(page: Page) {
  await page.context().addCookies([
    {
      name: 'active_perspective',
      value: 'creator',
      domain: 'localhost',
      path: '/',
    },
  ])
}

export async function setBrandPerspective(page: Page) {
  await page.context().addCookies([
    {
      name: 'active_perspective',
      value: 'brand_manager',
      domain: 'localhost',
      path: '/',
    },
  ])
}
