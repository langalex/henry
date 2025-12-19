import { db } from '$lib/server/db';
import { event, contribution, user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAuth } from '$lib/server/auth-helpers';
import { logAuditEvent } from '$lib/server/audit-log';

export const load: PageServerLoad = async ({ params, locals }) => {
	const currentUser = requireAuth({ locals } as any);
	const [contributionData] = await db
		.select({
			id: contribution.id,
			eventId: contribution.eventId,
			userId: contribution.userId,
			title: contribution.title,
			description: contribution.description,
			createdAt: contribution.createdAt,
			userName: user.name
		})
		.from(contribution)
		.innerJoin(user, eq(contribution.userId, user.id))
		.where(eq(contribution.id, params.id))
		.limit(1);

	if (!contributionData) {
		throw error(404, 'Beitrag nicht gefunden');
	}

	const isAdmin = currentUser.roles?.includes('admin');
	if (contributionData.userId !== currentUser.id && !isAdmin) {
		throw error(403, 'Sie haben keine Berechtigung, diesen Beitrag zu bearbeiten');
	}

	const [evt] = await db
		.select()
		.from(event)
		.where(eq(event.id, contributionData.eventId))
		.limit(1);
	if (!evt) {
		throw error(404, 'Event nicht gefunden');
	}

	return {
		event: evt,
		contribution: contributionData,
		user: currentUser
	};
};

export const actions: Actions = {
	updateContribution: async ({ request, params, locals }) => {
		const currentUser = requireAuth({ locals } as any);
		const data = await request.formData();
		const title = data.get('title')?.toString();
		const description = data.get('description')?.toString() || '';

		if (!title) {
			return fail(400, { error: 'Titel ist erforderlich' });
		}

		try {
			const [contributionData] = await db
				.select()
				.from(contribution)
				.where(eq(contribution.id, params.id))
				.limit(1);

			if (!contributionData) {
				return fail(404, { error: 'Beitrag nicht gefunden' });
			}

			const isAdmin = currentUser.roles?.includes('admin');
			if (contributionData.userId !== currentUser.id && !isAdmin) {
				return fail(403, { error: 'Sie haben keine Berechtigung, diesen Beitrag zu bearbeiten' });
			}

			await db
				.update(contribution)
				.set({ title, description: description || null })
				.where(eq(contribution.id, params.id));

			await logAuditEvent({ request, locals } as any, 'update', {
				resourceType: 'contribution',
				resourceId: params.id,
				resourceName: title,
				details: { title, description, previousTitle: contributionData.title }
			});

			throw redirect(303, `/events/${contributionData.eventId}`);
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err) {
				throw err;
			}
			return fail(500, { error: 'Fehler beim Aktualisieren des Beitrags' });
		}
	},

	deleteContribution: async ({ request, params, locals }) => {
		const currentUser = requireAuth({ locals } as any);

		try {
			const [contributionData] = await db
				.select()
				.from(contribution)
				.where(eq(contribution.id, params.id))
				.limit(1);

			if (!contributionData) {
				return fail(404, { error: 'Beitrag nicht gefunden' });
			}

			const isAdmin = currentUser.roles?.includes('admin');
			if (contributionData.userId !== currentUser.id && !isAdmin) {
				return fail(403, { error: 'Sie haben keine Berechtigung, diesen Beitrag zu löschen' });
			}

			const eventId = contributionData.eventId;

			await db.delete(contribution).where(eq(contribution.id, params.id));

			await logAuditEvent({ request, locals } as any, 'delete', {
				resourceType: 'contribution',
				resourceId: params.id,
				resourceName: contributionData.title,
				details: { title: contributionData.title }
			});

			throw redirect(303, `/events/${eventId}`);
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err) {
				throw err;
			}
			return fail(500, { error: 'Fehler beim Löschen des Beitrags' });
		}
	}
};
