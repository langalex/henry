import { db } from '$lib/server/db';
import {
	event,
	job,
	material,
	jobAssignment,
	materialAssignment,
	user
} from '$lib/server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAuth, requireAdmin } from '$lib/server/auth-helpers';
import { randomUUID } from 'crypto';
import { logAuditEvent } from '$lib/server/audit-log';

export const load: PageServerLoad = async ({ params, locals }) => {
	const currentUser = requireAuth({ locals } as any);
	const evt = await db.select().from(event).where(eq(event.id, params.id)).limit(1);

	if (evt.length === 0) {
		throw error(404, 'Event nicht gefunden');
	}

	const [jobs, materials] = await Promise.all([
		db.select().from(job).where(eq(job.eventId, params.id)),
		db.select().from(material).where(eq(material.eventId, params.id))
	]);

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

	const materialIds = materials.map((m) => m.id);
	const materialAssignments =
		materialIds.length > 0
			? await db
					.select({
						materialId: materialAssignment.materialId,
						userId: materialAssignment.userId,
						userName: user.name
					})
					.from(materialAssignment)
					.innerJoin(user, eq(materialAssignment.userId, user.id))
					.where(inArray(materialAssignment.materialId, materialIds))
			: [];

	const assignmentsByMaterial = new Map<string, Array<{ userId: string; userName: string }>>();
	for (const assignment of materialAssignments) {
		if (!assignmentsByMaterial.has(assignment.materialId)) {
			assignmentsByMaterial.set(assignment.materialId, []);
		}
		assignmentsByMaterial.get(assignment.materialId)!.push({
			userId: assignment.userId,
			userName: assignment.userName
		});
	}

	const materialsWithAssignments = materials.map((m) => {
		const materialAssignments = assignmentsByMaterial.get(m.id) || [];
		const isAssigned = materialAssignments.some((a) => a.userId === currentUser.id);
		return {
			...m,
			assignments: materialAssignments,
			isAssigned
		};
	});

	return {
		event: { ...evt[0], jobs: jobsWithAssignments, materials: materialsWithAssignments },
		user: currentUser
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
				details: { title, date, time }
			});
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Fehler beim Aktualisieren des Events' });
		}
	},

	deleteEvent: async ({ request, params, locals }) => {
		requireAdmin({ locals } as any);
		const evt = await db.select().from(event).where(eq(event.id, params.id)).limit(1);
		if (evt.length === 0) {
			return fail(404, { error: 'Event nicht gefunden' });
		}

		const eventDateTime = new Date(`${evt[0].date}T${evt[0].time}`);
		if (eventDateTime < new Date()) {
			return fail(400, { error: 'Nur zukünftige Events können gelöscht werden' });
		}

		try {
			const eventTitle = evt[0].title;
			await db.delete(event).where(eq(event.id, params.id));
			await logAuditEvent({ request, locals } as any, 'delete', {
				resourceType: 'event',
				resourceId: params.id,
				details: { title: eventTitle }
			});
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Fehler beim Löschen des Events' });
		}
	},

	assignJob: async ({ request, locals }) => {
		const currentUser = requireAuth({ locals } as any);
		const data = await request.formData();
		const jobId = data.get('jobId')?.toString();

		if (!jobId) {
			return fail(400, { error: 'Aufgaben-ID erforderlich' });
		}

		try {
			const [jobData] = await db.select().from(job).where(eq(job.id, jobId)).limit(1);
			if (!jobData) {
				return fail(404, { error: 'Aufgabe nicht gefunden' });
			}

			const existingAssignment = await db
				.select()
				.from(jobAssignment)
				.where(and(eq(jobAssignment.jobId, jobId), eq(jobAssignment.userId, currentUser.id)))
				.limit(1);

			if (existingAssignment.length > 0) {
				return fail(400, { error: 'Sie sind bereits dieser Aufgabe zugewiesen' });
			}

			const currentAssignments = await db
				.select()
				.from(jobAssignment)
				.where(eq(jobAssignment.jobId, jobId));

			if (currentAssignments.length >= jobData.numberOfPeople) {
				return fail(400, { error: 'Die maximale Anzahl von Personen wurde bereits erreicht' });
			}

			await db.insert(jobAssignment).values({
				id: randomUUID(),
				jobId,
				userId: currentUser.id
			});

			await logAuditEvent({ request, locals } as any, 'assign', {
				resourceType: 'job',
				resourceId: jobId,
				details: { userId: currentUser.id, userName: currentUser.name }
			});

			return { success: true };
		} catch (err) {
			return fail(500, { error: 'Fehler beim Zuweisen der Aufgabe' });
		}
	},

	unassignJob: async ({ request, locals }) => {
		const currentUser = requireAuth({ locals } as any);
		const data = await request.formData();
		const jobId = data.get('jobId')?.toString();

		if (!jobId) {
			return fail(400, { error: 'Aufgaben-ID erforderlich' });
		}

		try {
			await db
				.delete(jobAssignment)
				.where(and(eq(jobAssignment.jobId, jobId), eq(jobAssignment.userId, currentUser.id)));
			await logAuditEvent({ request, locals } as any, 'unassign', {
				resourceType: 'job',
				resourceId: jobId,
				details: { userId: currentUser.id, userName: currentUser.name }
			});
			return { success: true };
		} catch (err) {
			return fail(500, { error: 'Fehler beim Abmelden von der Aufgabe' });
		}
	},

	assignMaterial: async ({ request, locals }) => {
		const currentUser = requireAuth({ locals } as any);
		const data = await request.formData();
		const materialId = data.get('materialId')?.toString();

		if (!materialId) {
			return fail(400, { error: 'Material-ID erforderlich' });
		}

		try {
			const [materialData] = await db
				.select()
				.from(material)
				.where(eq(material.id, materialId))
				.limit(1);
			if (!materialData) {
				return fail(404, { error: 'Material nicht gefunden' });
			}

			const existingAssignment = await db
				.select()
				.from(materialAssignment)
				.where(
					and(
						eq(materialAssignment.materialId, materialId),
						eq(materialAssignment.userId, currentUser.id)
					)
				)
				.limit(1);

			if (existingAssignment.length > 0) {
				return fail(400, { error: 'Sie sind bereits diesem Material zugewiesen' });
			}

			await db.insert(materialAssignment).values({
				id: randomUUID(),
				materialId,
				userId: currentUser.id
			});

			await logAuditEvent({ request, locals } as any, 'assign', {
				resourceType: 'material',
				resourceId: materialId,
				details: { userId: currentUser.id, userName: currentUser.name }
			});

			return { success: true };
		} catch (err) {
			return fail(500, { error: 'Fehler beim Zuweisen des Materials' });
		}
	},

	unassignMaterial: async ({ request, locals }) => {
		const currentUser = requireAuth({ locals } as any);
		const data = await request.formData();
		const materialId = data.get('materialId')?.toString();

		if (!materialId) {
			return fail(400, { error: 'Material-ID erforderlich' });
		}

		try {
			await db
				.delete(materialAssignment)
				.where(
					and(
						eq(materialAssignment.materialId, materialId),
						eq(materialAssignment.userId, currentUser.id)
					)
				);
			await logAuditEvent({ request, locals } as any, 'unassign', {
				resourceType: 'material',
				resourceId: materialId,
				details: { userId: currentUser.id, userName: currentUser.name }
			});
			return { success: true };
		} catch (err) {
			return fail(500, { error: 'Fehler beim Abmelden vom Material' });
		}
	}
};
