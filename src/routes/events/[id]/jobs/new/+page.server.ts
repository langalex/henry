import { db } from '$lib/server/db';
import { event, job } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import { randomUUID } from 'crypto';
import type { PageServerLoad, Actions } from './$types';
import { requireAuth, requireAdmin } from '$lib/server/auth-helpers';
import { logAuditEvent } from '$lib/server/audit-log';

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = requireAuth({ locals } as any);
	const evt = await db.select().from(event).where(eq(event.id, params.id)).limit(1);

	if (evt.length === 0) {
		throw error(404, 'Event nicht gefunden');
	}

	return {
		user,
		event: evt[0]
	};
};

export const actions: Actions = {
	createJob: async ({ request, params, locals }) => {
		requireAdmin({ locals } as any);
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
			const jobId = randomUUID();
			await db.insert(job).values({
				id: jobId,
				eventId: params.id!,
				title,
				description,
				startTime,
				endTime,
				numberOfPeople
			});
			await logAuditEvent({ request, locals } as any, 'create', {
				resourceType: 'job',
				resourceId: jobId,
				details: { title, eventId: params.id, startTime, endTime, numberOfPeople }
			});
			throw redirect(303, `/events/${params.id}/jobs`);
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err) {
				throw err;
			}
			return fail(500, { error: 'Fehler beim Erstellen der Aufgabe' });
		}
	}
};
