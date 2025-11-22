import { db } from '$lib/server/db';
import { event, material } from '$lib/server/db/schema';
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
	createMaterial: async ({ request, params, locals }) => {
		requireAdmin({ locals } as any);
		const data = await request.formData();
		const title = data.get('title')?.toString();
		const description = data.get('description')?.toString() || '';

		if (!title) {
			return fail(400, { error: 'Titel ist erforderlich' });
		}

		try {
			const materialId = randomUUID();
			await db.insert(material).values({
				id: materialId,
				eventId: params.id!,
				title,
				description
			});
			await logAuditEvent({ request, locals } as any, 'create', {
				resourceType: 'material',
				resourceId: materialId,
				details: { title, eventId: params.id }
			});
			throw redirect(303, `/events/${params.id}/materials`);
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err) {
				throw err;
			}
			return fail(500, { error: 'Fehler beim Erstellen des Materials' });
		}
	}
};
