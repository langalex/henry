import { db } from '$lib/server/db';
import { event, contribution } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import { randomUUID } from 'crypto';
import type { PageServerLoad, Actions } from './$types';
import { requireAuth } from '$lib/server/auth-helpers';
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
	createContribution: async ({ request, params, locals }) => {
		const currentUser = requireAuth({ locals } as any);
		const data = await request.formData();
		const title = data.get('title')?.toString();
		const description = data.get('description')?.toString() || '';

		if (!title) {
			return fail(400, { error: 'Titel ist erforderlich' });
		}

		try {
			const [evt] = await db.select().from(event).where(eq(event.id, params.id)).limit(1);
			if (!evt) {
				return fail(404, { error: 'Event nicht gefunden' });
			}

			const contributionId = randomUUID();
			await db.insert(contribution).values({
				id: contributionId,
				eventId: params.id!,
				userId: currentUser.id,
				title,
				description: description || null,
				createdAt: new Date()
			});

			await logAuditEvent({ request, locals } as any, 'create', {
				resourceType: 'contribution',
				resourceId: contributionId,
				resourceName: title,
				details: { title, description, eventId: params.id }
			});

			throw redirect(303, `/events/${params.id}`);
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err) {
				throw err;
			}
			return fail(500, { error: 'Fehler beim Erstellen des Beitrags' });
		}
	}
};

