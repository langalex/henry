import { expect, test } from '@playwright/test';
import { flushDatabase } from './global-setup';
import { createFirstUser } from './helpers/create-first-user';
import { createEvent } from './helpers/create-event';

test.beforeEach(async () => {
	await flushDatabase();
});

test('add, edit, and remove contributions', async ({ page }) => {
	await createFirstUser(page);
	const eventId = await createEvent(page, 'Test Event for Contributions');

	await page.goto(`/events/${eventId}`);

	await page.getByTestId('manage-contributions-link').click();
	await expect(page).toHaveURL(`/events/${eventId}/contributions/new`);

	await page.getByTestId('contribution-title-input').fill('First Contribution');
	await page.getByTestId('contribution-description-input').fill('This is the first contribution');
	await page.getByTestId('create-contribution-button').click();

	await page.waitForURL(`/events/${eventId}`);

	const contributionElement = page.locator('[data-testid^="contribution-"]').first();
	await expect(contributionElement).toBeVisible();
	await expect(page.getByRole('heading', { name: 'First Contribution' })).toBeVisible();
	await expect(page.getByText('This is the first contribution')).toBeVisible();

	const contributionId = await contributionElement.getAttribute('data-testid');
	const contributionIdMatch = contributionId?.replace('contribution-', '');
	expect(contributionIdMatch).toBeTruthy();

	await page.getByTestId(`edit-contribution-${contributionIdMatch}`).click();
	await expect(page).toHaveURL(`/events/${eventId}/contributions/${contributionIdMatch}/edit`);

	await expect(page.getByTestId('contribution-title-input')).toHaveValue('First Contribution');
	await expect(page.getByTestId('contribution-description-input')).toHaveValue(
		'This is the first contribution'
	);

	await page.getByTestId('contribution-title-input').fill('Updated Contribution');
	await page.getByTestId('contribution-description-input').fill('Updated description');
	await page.getByRole('button', { name: 'Speichern' }).click();

	await page.waitForURL(`/events/${eventId}`);
	await expect(page.getByRole('heading', { name: 'Updated Contribution' })).toBeVisible();
	await expect(page.getByText('Updated description')).toBeVisible();

	await page.getByTestId(`edit-contribution-${contributionIdMatch}`).click();
	await page.waitForURL(`/events/${eventId}/contributions/${contributionIdMatch}/edit`);

	page.on('dialog', (dialog) => dialog.accept());
	await page.getByTestId('delete-contribution-button').click();

	await page.waitForURL(`/events/${eventId}`);
	await expect(page.getByText('Noch keine Beiträge vorhanden.')).toBeVisible();
});
