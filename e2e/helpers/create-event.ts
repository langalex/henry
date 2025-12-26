import { expect, type Page } from '@playwright/test';

export async function createEvent(page: Page, title: string = 'Test Event') {
	await page.goto('/events/new');

	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	const dateStr = tomorrow.toISOString().split('T')[0];
	const timeStr = '14:00';

	await page.getByLabel(/Titel/).fill(title);
	await page.getByLabel(/Beschreibung/).fill('This is a test event description');
	await page.getByLabel(/Datum/).fill(dateStr);
	await page.getByLabel(/Uhrzeit/).fill(timeStr);

	await page.getByRole('button', { name: 'Veranstaltung anlegen' }).click();
	await page.waitForURL('/events');

	await page.getByRole('link', { name: title }).click();
	await page.waitForURL(/\/events\/[^\/]+/);

	const eventUrl = page.url();
	const eventId = eventUrl.match(/\/events\/([^\/]+)/)?.[1];
	return eventId;
}
