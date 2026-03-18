import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('admin redirect to login when unauthenticated', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page).toHaveURL(/login/)
  })
})
