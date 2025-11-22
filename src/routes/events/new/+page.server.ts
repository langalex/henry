import { db } from '$lib/server/db';
import { event } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { randomUUID } from 'crypto';
import { requireAuth, requireAdmin } from '$lib/server/auth-helpers';
import { logAuditEvent } from '$lib/server/audit-log';

export async function load(loadEvent) {
	const user = requireAuth(loadEvent);
	return { user };
}

export const actions = {
	createEvent: async (actionEvent) => {
		requireAdmin(actionEvent);
		const data = await actionEvent.request.formData();
		const title = data.get('title')?.toString();
		const description = data.get('description')?.toString() || '';
		const date = data.get('date')?.toString();
		const time = data.get('time')?.toString();

		if (!title || !date || !time) {
			return fail(400, { error: 'Titel, Datum und Uhrzeit sind erforderlich' });
		}

		try {
			const eventId = randomUUID();
			await db.insert(event).values({
				id: eventId,
				title,
				description,
				date,
				time,
				createdAt: new Date()
			});
			await logAuditEvent(
				{ request: actionEvent.request, locals: actionEvent.locals } as any,
				'create',
				{
					resourceType: 'event',
					resourceId: eventId,
					resourceName: title,
					details: { title, date, time }
				}
			);
			throw redirect(303, '/events');
		} catch (error) {
			if (error && typeof error === 'object' && 'status' in error) {
				throw error;
			}
			return fail(500, { error: 'Fehler beim Erstellen des Events' });
		}
	}
};
