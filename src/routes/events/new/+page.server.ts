import { db } from '$lib/server/db';
import { event } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { randomUUID } from 'crypto';

export const actions = {
	createEvent: async ({ request }) => {
		const data = await request.formData();
		const title = data.get('title')?.toString();
		const description = data.get('description')?.toString() || '';
		const date = data.get('date')?.toString();
		const time = data.get('time')?.toString();

		if (!title || !date || !time) {
			return fail(400, { error: 'Titel, Datum und Uhrzeit sind erforderlich' });
		}

		try {
			await db.insert(event).values({
				id: randomUUID(),
				title,
				description,
				date,
				time,
				createdAt: new Date()
			});
			throw redirect(303, '/events');
		} catch (error) {
			if (error && typeof error === 'object' && 'status' in error) {
				throw error;
			}
			return fail(500, { error: 'Fehler beim Erstellen des Events' });
		}
	}
};

