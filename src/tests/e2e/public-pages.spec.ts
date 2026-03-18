import { test, expect } from '@playwright/test'

test.describe('Public pages', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/.+/)
  })

  test('projects page loads', async ({ page }) => {
    await page.goto('/projects')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('blog page loads', async ({ page }) => {
    await page.goto('/blog')
    await expect(page.locator('h1')).toBeVisible()
  })
})
