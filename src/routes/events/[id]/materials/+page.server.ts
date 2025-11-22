import { db } from '$lib/server/db';
import { event, material } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const evt = await db.select().from(event).where(eq(event.id, params.id)).limit(1);

	if (evt.length === 0) {
		throw error(404, 'Event nicht gefunden');
	}

	const materials = await db.select().from(material).where(eq(material.eventId, params.id));

	return {
		event: evt[0],
		materials
	};
};

export const actions: Actions = {
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
		} catch (err) {
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
		} catch (err) {
			return fail(500, { error: 'Fehler beim Löschen des Materials' });
		}
	}
};
