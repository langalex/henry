import { db } from '$lib/server/db';
import { event } from '$lib/server/db/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAuth, requireAdmin } from '$lib/server/auth-helpers';
import { logAuditEvent } from '$lib/server/audit-log';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals }) => {
	requireAdmin({ locals } as any);
	const evt = await db.select().from(event).where(eq(event.id, params.id)).limit(1);

	if (evt.length === 0) {
		throw error(404, 'Event nicht gefunden');
	}

	return {
		event: evt[0],
		user: requireAuth({ locals } as any)
	};
};

export const actions: Actions = {
	updateEvent: async ({ request, params, locals }) => {
		requireAdmin({ locals } as any);
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
			await logAuditEvent({ request, locals } as any, 'update', {
				resourceType: 'event',
				resourceId: params.id,
				resourceName: title,
				details: { title, date, time }
			});
			throw redirect(303, `/events/${params.id}`);
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err) {
				throw err;
			}
			return fail(500, { error: 'Fehler beim Aktualisieren des Events' });
		}
	}
};
