import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(process.env.TEST_ADMIN_EMAIL || 'admin@example.com');
    await page.getByLabel(/password/i).fill(process.env.TEST_ADMIN_PASSWORD || 'testpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('should display dashboard with stats', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

    // Check for stats cards
    await expect(page.getByText(/total testers/i)).toBeVisible();
    await expect(page.getByText(/active testers/i)).toBeVisible();
  });

  test('should display stage distribution', async ({ page }) => {
    await expect(page.getByText(/stage distribution/i)).toBeVisible();
  });

  test('should display activity feed', async ({ page }) => {
    await expect(page.getByText(/recent activity/i)).toBeVisible();
  });

  test('should display alerts section', async ({ page }) => {
    await expect(page.getByText(/needs attention/i)).toBeVisible();
  });

  test('should navigate to testers from sidebar', async ({ page }) => {
    await page.getByRole('link', { name: /testers/i }).click();
    await expect(page).toHaveURL('/testers');
  });

  test('should navigate to feedback from sidebar', async ({ page }) => {
    await page.getByRole('link', { name: /feedback/i }).click();
    await expect(page).toHaveURL('/feedback');
  });

  test('should navigate to incidents from sidebar', async ({ page }) => {
    await page.getByRole('link', { name: /incidents/i }).click();
    await expect(page).toHaveURL('/incidents');
  });
});
