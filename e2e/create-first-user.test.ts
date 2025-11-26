import { expect, test } from '@playwright/test';

test('create first user', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByRole('heading', { name: 'Ersten Benutzer erstellen' })).toBeVisible();

	await page.getByLabel(/Name/).fill('Test Admin');
	await page.getByLabel(/E-Mail/).fill('admin@test.com');

	await page.click('button[type="submit"]');

	await expect(
		page.getByTestId('message').filter({ hasText: 'Registrierung erfolgreich' })
	).toBeVisible();
});
