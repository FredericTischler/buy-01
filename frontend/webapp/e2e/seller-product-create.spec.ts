import { test, expect } from '@playwright/test';

const AUTH_STATE = {
  accessToken: 'test-token',
  user: {
    id: 'seller-1',
    email: 'vendeur@example.com',
    roles: ['SELLER'],
  },
};

test.describe('Création de produit vendeur', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(value => {
      window.localStorage.setItem('buy01.auth.state', JSON.stringify(value));
    }, AUTH_STATE);
  });

  test('flux complet: bouton → formulaire → erreurs → succès', async ({ page }) => {
    let listCalls = 0;
    await page.route('**/api/products/mine', async route => {
      listCalls += 1;
      const body =
        listCalls === 1
          ? []
          : [
              {
                id: 'prod-1',
                sellerId: 'seller-1',
                name: 'Planche artisanale',
                price: 24.9,
                media: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ];
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });

    let createCalls = 0;
    await page.route('**/api/products', async route => {
      createCalls += 1;
      if (createCalls === 1) {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Validation failed',
            errors: { name: 'Name error' },
          }),
        });
        return;
      }

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'prod-1',
          sellerId: 'seller-1',
          name: 'Planche artisanale',
          price: 24.9,
          media: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });
    });

    await page.goto('/seller');

    const addProductButton = page.locator('[data-test="add-product-button"]');
    await expect(addProductButton).toBeVisible();
    await addProductButton.click();

    await expect(page).toHaveURL(/\/seller\/products\/new$/);

    await page.fill('[data-test="product-name-input"]', 'Planche artisanale');
    await page.fill('[data-test="product-price-input"]', '24.9');
    await page.fill(
      '[data-test="product-description-input"]',
      'Planche en chêne fabriquée main.',
    );

    await page.click('[data-test="product-submit-button"]');
    await expect(page.locator('text=Name error')).toBeVisible();

    await page.click('[data-test="product-submit-button"]');

    await expect(page).toHaveURL(/\/seller$/);
    await expect(page.locator('text=Produit créé avec succès')).toBeVisible();
    await expect(page.locator('[data-test="add-images-cta"]')).toBeVisible();
  });
});
