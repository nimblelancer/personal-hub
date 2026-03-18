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

  test('login page has sign in button', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('invalid credentials shows error message', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    // Supabase returns error — sonner toast or inline error should appear
    await expect(page.locator('[data-sonner-toast], [role="alert"]')).toBeVisible({ timeout: 8000 })
  })

  test('all admin sub-routes redirect to login when unauthenticated', async ({ page }) => {
    for (const path of ['/admin/learning/notes', '/admin/projects', '/admin/roadmap']) {
      await page.goto(path)
      await expect(page).toHaveURL(/login/, { timeout: 5000 })
    }
  })
})
