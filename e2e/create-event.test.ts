import { expect, test } from '@playwright/test';
import { flushDatabase } from './global-setup';
import { createFirstUser } from './helpers/create-first-user';

test.beforeEach(async () => {
	await flushDatabase();
});

test('create event', async ({ page }) => {
	await createFirstUser(page);

	await page.goto('/events/new');

	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	const dateStr = tomorrow.toISOString().split('T')[0];
	const timeStr = '14:00';

	await page.getByLabel(/Titel/).fill('Test Event');
	await page.getByLabel(/Beschreibung/).fill('This is a test event description');
	await page.getByLabel(/Datum/).fill(dateStr);
	await page.getByLabel(/Uhrzeit/).fill(timeStr);

	page.getByRole('button', { name: 'Veranstaltung anlegen' }).click();
	await page.waitForURL('/events');

	await expect(page).toHaveURL('/events');
	await expect(page.getByText('This is a test event description')).toBeVisible();
});
