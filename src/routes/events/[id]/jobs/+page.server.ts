import { db } from '$lib/server/db';
import { event, job, jobAssignment, user } from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAuth, requireAdmin } from '$lib/server/auth-helpers';

export const load: PageServerLoad = async ({ params, locals }) => {
	const currentUser = requireAuth({ locals } as any);
	const evt = await db.select().from(event).where(eq(event.id, params.id)).limit(1);

	if (evt.length === 0) {
		throw error(404, 'Event nicht gefunden');
	}

	const jobs = await db.select().from(job).where(eq(job.eventId, params.id));

	const jobIds = jobs.map((j) => j.id);
	const assignments =
		jobIds.length > 0
			? await db
					.select({
						jobId: jobAssignment.jobId,
						userId: jobAssignment.userId,
						userName: user.name
					})
					.from(jobAssignment)
					.innerJoin(user, eq(jobAssignment.userId, user.id))
					.where(inArray(jobAssignment.jobId, jobIds))
			: [];

	const assignmentsByJob = new Map<string, Array<{ userId: string; userName: string }>>();
	for (const assignment of assignments) {
		if (!assignmentsByJob.has(assignment.jobId)) {
			assignmentsByJob.set(assignment.jobId, []);
		}
		assignmentsByJob.get(assignment.jobId)!.push({
			userId: assignment.userId,
			userName: assignment.userName
		});
	}

	const jobsWithAssignments = jobs.map((j) => {
		const jobAssignments = assignmentsByJob.get(j.id) || [];
		const isAssigned = jobAssignments.some((a) => a.userId === currentUser.id);
		const assignedCount = jobAssignments.length;
		return {
			...j,
			assignments: jobAssignments,
			isAssigned,
			assignedCount
		};
	});

	return {
		event: evt[0],
		jobs: jobsWithAssignments,
		user: currentUser
	};
};

export const actions: Actions = {
	updateJob: async ({ request, locals }) => {
		requireAdmin({ locals } as any);
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
		} catch (err) {
			return fail(500, { error: 'Fehler beim Aktualisieren der Aufgabe' });
		}
	},

	deleteJob: async ({ request, locals }) => {
		requireAdmin({ locals } as any);
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'Aufgaben-ID erforderlich' });
		}

		try {
			await db.delete(job).where(eq(job.id, id));
			return { success: true };
		} catch (err) {
			return fail(500, { error: 'Fehler beim Löschen der Aufgabe' });
		}
	}
};
