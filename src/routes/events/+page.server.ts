import { db } from '$lib/server/db';
import { event, job, material } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { randomUUID } from 'crypto';

export async function load() {
	const events = await db
		.select()
		.from(event)
		.orderBy(asc(event.date), asc(event.time));

	const eventsWithRelations = await Promise.all(
		events.map(async (evt) => {
			const [jobs, materials] = await Promise.all([
				db.select().from(job).where(eq(job.eventId, evt.id)),
				db.select().from(material).where(eq(material.eventId, evt.id))
			]);
			return { ...evt, jobs, materials };
		})
	);

	return { events: eventsWithRelations };
}

export const actions = {
	createJob: async ({ request }) => {
		const data = await request.formData();
		const eventId = data.get('eventId')?.toString();
		const title = data.get('title')?.toString();
		const description = data.get('description')?.toString() || '';
		const startTime = data.get('startTime')?.toString();
		const endTime = data.get('endTime')?.toString();
		const numberOfPeople = parseInt(data.get('numberOfPeople')?.toString() || '0');

		if (!eventId || !title || !startTime || !endTime || numberOfPeople <= 0) {
			return fail(400, { error: 'Alle Felder sind erforderlich' });
		}

		try {
			await db.insert(job).values({
				id: randomUUID(),
				eventId,
				title,
				description,
				startTime,
				endTime,
				numberOfPeople
			});
			return { success: true };
		} catch (error) {
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
		} catch (error) {
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
		} catch (error) {
			return fail(500, { error: 'Fehler beim Löschen der Aufgabe' });
		}
	},

	createMaterial: async ({ request }) => {
		const data = await request.formData();
		const eventId = data.get('eventId')?.toString();
		const title = data.get('title')?.toString();
		const description = data.get('description')?.toString() || '';

		if (!eventId || !title) {
			return fail(400, { error: 'Titel ist erforderlich' });
		}

		try {
			await db.insert(material).values({
				id: randomUUID(),
				eventId,
				title,
				description
			});
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Fehler beim Erstellen des Materials' });
		}
	},

	updateMaterial: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const title = data.get('title')?.toString();
		const description = data.get('description')?.toString() || '';

		if (!id || !title) {
			return fail(400, { error: 'Titel ist erforderlich' });
		}

		try {
			await db.update(material).set({ title, description }).where(eq(material.id, id));
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Fehler beim Aktualisieren des Materials' });
		}
	},

	deleteMaterial: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'Material-ID erforderlich' });
		}

		try {
			await db.delete(material).where(eq(material.id, id));
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Fehler beim Löschen des Materials' });
		}
	}
};

