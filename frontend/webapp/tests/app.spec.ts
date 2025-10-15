import { test, expect } from '@playwright/test';

test('homepage shows product catalog header', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Catalogue' })).toBeVisible();
});
