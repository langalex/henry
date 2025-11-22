import { db } from '$lib/server/db';
import { event, job } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import { randomUUID } from 'crypto';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const evt = await db.select().from(event).where(eq(event.id, params.id)).limit(1);

	if (evt.length === 0) {
		throw error(404, 'Event nicht gefunden');
	}

	const jobs = await db.select().from(job).where(eq(job.eventId, params.id));

	return {
		event: evt[0],
		jobs
	};
};

export const actions: Actions = {
	createJob: async ({ request, params }) => {
		const data = await request.formData();
		const title = data.get('title')?.toString();
		const description = data.get('description')?.toString() || '';
		const startTime = data.get('startTime')?.toString();
		const endTime = data.get('endTime')?.toString();
		const numberOfPeople = parseInt(data.get('numberOfPeople')?.toString() || '0');

		if (!title || !startTime || !endTime || numberOfPeople <= 0) {
			return fail(400, { error: 'Alle Felder sind erforderlich' });
		}

		try {
			await db.insert(job).values({
				id: randomUUID(),
				eventId: params.id!,
				title,
				description,
				startTime,
				endTime,
				numberOfPeople
			});
			return { success: true };
		} catch (err) {
			return fail(500, { error: 'Fehler beim Erstellen der Aufgabe' });
		}
	},

	updateJob: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const title = data.get('title')?.toString();
		const description = data.get('description')?.toString() || '';
		const startTime = data.get('startTime')?.toString();
		const endTime = data.get('endTime')?.toString();
		const numberOfPeople = parseInt(data.get('numberOfPeople')?.toString() || '0');

		if (!id || !title || !startTime || !endTime || numberOfPeople <= 0) {
			return fail(400, { error: 'Alle Felder sind erforderlich' });
		}

		try {
			await db
				.update(job)
				.set({ title, description, startTime, endTime, numberOfPeople })
				.where(eq(job.id, id));
			return { success: true };
		} catch (err) {
			return fail(500, { error: 'Fehler beim Aktualisieren der Aufgabe' });
		}
	},

	deleteJob: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'Aufgaben-ID erforderlich' });
		}

		try {
			await db.delete(job).where(eq(job.id, id));
			return { success: true };
		} catch (err) {
			return fail(500, { error: 'Fehler beim Löschen der Aufgabe' });
		}
	}
};

