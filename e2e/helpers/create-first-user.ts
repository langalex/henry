import { expect } from '@playwright/test';

export async function createFirstUser(page: Page) {
	// create first user
	await page.goto('/');
	await page.getByLabel(/Name/).fill('Test Admin');
	await page.getByLabel(/E-Mail/).fill('admin@test.com');
	await page.click('button[type="submit"]');
	await expect(
		page.getByTestId('message').filter({ hasText: 'Registrierung erfolgreich' })
	).toBeVisible();

	await page.goto(`/auth/verify?token=test-token-123`);
	await expect(page).toHaveURL('/events');
}
