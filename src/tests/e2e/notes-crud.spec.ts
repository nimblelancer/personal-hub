import { test, expect } from '@playwright/test'

// Notes CRUD E2E — unauthenticated redirect tests always run.
// Authenticated CRUD tests run only when TEST_EMAIL + TEST_PASSWORD env vars are set.
const hasCredentials = !!(process.env.TEST_EMAIL && process.env.TEST_PASSWORD)

test.describe('Notes — unauthenticated', () => {
  test('notes list redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/admin/learning/notes')
    await expect(page).toHaveURL(/login/)
  })

  test('notes new page redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/admin/learning/notes/new')
    await expect(page).toHaveURL(/login/)
  })
})

test.describe('Notes — authenticated CRUD', () => {
  test.skip(!hasCredentials, 'Set TEST_EMAIL and TEST_PASSWORD env vars to run CRUD tests')

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', process.env.TEST_EMAIL!)
    await page.fill('input[type="password"]', process.env.TEST_PASSWORD!)
    await page.click('button[type="submit"]')
    await page.waitForURL(/admin\/dashboard/, { timeout: 10000 })
  })

  test('notes list page loads', async ({ page }) => {
    await page.goto('/admin/learning/notes')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('new note form renders required fields', async ({ page }) => {
    await page.goto('/admin/learning/notes/new')
    await expect(page.locator('input[name="title"], input[placeholder*="title" i]')).toBeVisible({ timeout: 5000 })
  })
})
