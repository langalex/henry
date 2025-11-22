import { db } from '$lib/server/db';
import { event, job, jobAssignment, user } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/server/auth-helpers';
import { logAuditEvent } from '$lib/server/audit-log';
import { randomUUID } from 'crypto';

export const load: PageServerLoad = async ({ params, locals }) => {
	const currentUser = requireAdmin({ locals } as any);

	const [evt] = await db.select().from(event).where(eq(event.id, params.id)).limit(1);
	if (!evt) {
		throw error(404, 'Event nicht gefunden');
	}

	const [jobData] = await db.select().from(job).where(eq(job.id, params.jobId)).limit(1);
	if (!jobData) {
		throw error(404, 'Aufgabe nicht gefunden');
	}

	if (jobData.eventId !== params.id) {
		throw error(400, 'Aufgabe gehört nicht zu diesem Event');
	}

	const allUsers = await db.select().from(user);
	const assignments = await db
		.select({ userId: jobAssignment.userId })
		.from(jobAssignment)
		.where(eq(jobAssignment.jobId, params.jobId));

	const assignedUserIds = new Set(assignments.map((a) => a.userId));

	const usersWithAssignmentStatus = allUsers.map((u) => ({
		id: u.id,
		name: u.name,
		isAssigned: assignedUserIds.has(u.id)
	}));

	return {
		event: evt,
		job: jobData,
		users: usersWithAssignmentStatus,
		user: currentUser
	};
};

export const actions: Actions = {
	assign: async ({ request, params, locals }) => {
		requireAdmin({ locals } as any);
		const data = await request.formData();
		const userId = data.get('userId')?.toString();

		if (!userId) {
			return fail(400, { error: 'Benutzer-ID erforderlich' });
		}

		try {
			const [jobData] = await db.select().from(job).where(eq(job.id, params.jobId)).limit(1);
			if (!jobData) {
				return fail(404, { error: 'Aufgabe nicht gefunden' });
			}

			const existingAssignment = await db
				.select()
				.from(jobAssignment)
				.where(and(eq(jobAssignment.jobId, params.jobId), eq(jobAssignment.userId, userId)))
				.limit(1);

			if (existingAssignment.length > 0) {
				return fail(400, { error: 'Benutzer ist bereits zugewiesen' });
			}

			const currentAssignments = await db
				.select()
				.from(jobAssignment)
				.where(eq(jobAssignment.jobId, params.jobId));

			if (currentAssignments.length >= jobData.numberOfPeople) {
				return fail(400, { error: 'Die maximale Anzahl von Personen wurde bereits erreicht' });
			}

			const [userData] = await db.select().from(user).where(eq(user.id, userId)).limit(1);

			await db.insert(jobAssignment).values({
				id: randomUUID(),
				jobId: params.jobId,
				userId
			});

			await logAuditEvent({ request, locals } as any, 'assign', {
				resourceType: 'job',
				resourceId: params.jobId,
				resourceName: jobData.title,
				details: { userId, userName: userData?.name || '' }
			});

			return { success: true };
		} catch (err) {
			return fail(500, { error: 'Fehler beim Zuweisen des Benutzers' });
		}
	},

	unassign: async ({ request, params, locals }) => {
		requireAdmin({ locals } as any);
		const data = await request.formData();
		const userId = data.get('userId')?.toString();

		if (!userId) {
			return fail(400, { error: 'Benutzer-ID erforderlich' });
		}

		try {
			const [jobData] = await db.select().from(job).where(eq(job.id, params.jobId)).limit(1);
			if (!jobData) {
				return fail(404, { error: 'Aufgabe nicht gefunden' });
			}

			const [userData] = await db.select().from(user).where(eq(user.id, userId)).limit(1);

			await db
				.delete(jobAssignment)
				.where(and(eq(jobAssignment.jobId, params.jobId), eq(jobAssignment.userId, userId)));

			await logAuditEvent({ request, locals } as any, 'unassign', {
				resourceType: 'job',
				resourceId: params.jobId,
				resourceName: jobData.title,
				details: { userId, userName: userData?.name || '' }
			});

			return { success: true };
		} catch (err) {
			return fail(500, { error: 'Fehler beim Entfernen der Zuweisung' });
		}
	}
};

