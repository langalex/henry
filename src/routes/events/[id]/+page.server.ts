import { db } from '$lib/server/db';
import { event, job, material } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAuth } from '$lib/server/auth-helpers';

export const load: PageServerLoad = async ({ params, locals }) => {
	requireAuth({ locals } as any);
	const evt = await db.select().from(event).where(eq(event.id, params.id)).limit(1);

	if (evt.length === 0) {
		throw error(404, 'Event nicht gefunden');
	}

	const [jobs, materials] = await Promise.all([
		db.select().from(job).where(eq(job.eventId, params.id)),
		db.select().from(material).where(eq(material.eventId, params.id))
	]);

	return {
		event: { ...evt[0], jobs, materials }
	};
};

export const actions: Actions = {
	updateEvent: async ({ request, params, locals }) => {
		requireAuth({ locals } as any);
		const data = await request.formData();
		const title = data.get('title')?.toString();
		const description = data.get('description')?.toString() || '';
		const date = data.get('date')?.toString();
		const time = data.get('time')?.toString();

		if (!title || !date || !time) {
			return fail(400, { error: 'Alle Felder sind erforderlich' });
		}

		try {
			await db.update(event).set({ title, description, date, time }).where(eq(event.id, params.id));
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Fehler beim Aktualisieren des Events' });
		}
	},

	deleteEvent: async ({ request, params, locals }) => {
		requireAuth({ locals } as any);
		const evt = await db.select().from(event).where(eq(event.id, params.id)).limit(1);
		if (evt.length === 0) {
			return fail(404, { error: 'Event nicht gefunden' });
		}

		const eventDateTime = new Date(`${evt[0].date}T${evt[0].time}`);
		if (eventDateTime < new Date()) {
			return fail(400, { error: 'Nur zukünftige Events können gelöscht werden' });
		}

		try {
			await db.delete(event).where(eq(event.id, params.id));
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Fehler beim Löschen des Events' });
		}
	}
};

