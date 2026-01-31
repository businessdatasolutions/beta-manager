import { test, expect } from '@playwright/test';

test.describe('Tester Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(process.env.TEST_ADMIN_EMAIL || 'admin@example.com');
    await page.getByLabel(/password/i).fill(process.env.TEST_ADMIN_PASSWORD || 'testpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('should display testers page', async ({ page }) => {
    await page.goto('/testers');

    await expect(page.getByRole('heading', { name: /testers/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /add tester/i })).toBeVisible();
  });

  test('should open add tester dialog', async ({ page }) => {
    await page.goto('/testers');

    await page.getByRole('button', { name: /add tester/i }).click();

    // Dialog should appear
    await expect(page.getByRole('heading', { name: /add new tester/i })).toBeVisible();
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('should filter testers by stage', async ({ page }) => {
    await page.goto('/testers');

    // Find and click stage filter
    const stageSelect = page.locator('select').first();
    await stageSelect.selectOption('active');

    // URL should update (if using query params) or filter should apply
    await page.waitForTimeout(500); // Wait for filter to apply
  });

  test('should navigate to tester detail page', async ({ page }) => {
    await page.goto('/testers');

    // Wait for table to load
    await page.waitForSelector('table');

    // Click on first tester link if available
    const testerLink = page.locator('table a').first();
    if (await testerLink.isVisible()) {
      await testerLink.click();
      await expect(page).toHaveURL(/.*testers\/\d+/);
    }
  });

  test('should show tester detail page with stats', async ({ page }) => {
    // Navigate directly to a tester detail page
    await page.goto('/testers/1');

    // Should show tester info sections
    await expect(page.getByText(/contact information/i)).toBeVisible();
    await expect(page.getByText(/test progress/i)).toBeVisible();
    await expect(page.getByText(/statistics/i)).toBeVisible();
  });
});
