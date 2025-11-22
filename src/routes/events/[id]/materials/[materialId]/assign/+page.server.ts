import { db } from '$lib/server/db';
import { event, material, materialAssignment, user } from '$lib/server/db/schema';
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

	const [materialData] = await db
		.select()
		.from(material)
		.where(eq(material.id, params.materialId))
		.limit(1);
	if (!materialData) {
		throw error(404, 'Material nicht gefunden');
	}

	if (materialData.eventId !== params.id) {
		throw error(400, 'Material gehört nicht zu diesem Event');
	}

	const allUsers = await db.select().from(user);
	const assignments = await db
		.select({ userId: materialAssignment.userId })
		.from(materialAssignment)
		.where(eq(materialAssignment.materialId, params.materialId));

	const assignedUserIds = new Set(assignments.map((a) => a.userId));

	const usersWithAssignmentStatus = allUsers.map((u) => ({
		id: u.id,
		name: u.name,
		isAssigned: assignedUserIds.has(u.id)
	}));

	return {
		event: evt,
		material: materialData,
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
			const [materialData] = await db
				.select()
				.from(material)
				.where(eq(material.id, params.materialId))
				.limit(1);
			if (!materialData) {
				return fail(404, { error: 'Material nicht gefunden' });
			}

			const existingAssignment = await db
				.select()
				.from(materialAssignment)
				.where(
					and(
						eq(materialAssignment.materialId, params.materialId),
						eq(materialAssignment.userId, userId)
					)
				)
				.limit(1);

			if (existingAssignment.length > 0) {
				return fail(400, { error: 'Benutzer ist bereits zugewiesen' });
			}

			const [userData] = await db.select().from(user).where(eq(user.id, userId)).limit(1);

			await db.insert(materialAssignment).values({
				id: randomUUID(),
				materialId: params.materialId,
				userId
			});

			await logAuditEvent({ request, locals } as any, 'assign', {
				resourceType: 'material',
				resourceId: params.materialId,
				resourceName: materialData.title,
				details: { userId, userName: userData?.name || '' },
				targetUserId: userId,
				targetUserName: userData?.name || null,
				targetUserEmail: userData?.email || null
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
			const [materialData] = await db
				.select()
				.from(material)
				.where(eq(material.id, params.materialId))
				.limit(1);
			if (!materialData) {
				return fail(404, { error: 'Material nicht gefunden' });
			}

			const [userData] = await db.select().from(user).where(eq(user.id, userId)).limit(1);

			await db
				.delete(materialAssignment)
				.where(
					and(
						eq(materialAssignment.materialId, params.materialId),
						eq(materialAssignment.userId, userId)
					)
				);

			await logAuditEvent({ request, locals } as any, 'unassign', {
				resourceType: 'material',
				resourceId: params.materialId,
				resourceName: materialData.title,
				details: { userId, userName: userData?.name || '' },
				targetUserId: userId,
				targetUserName: userData?.name || null,
				targetUserEmail: userData?.email || null
			});

			return { success: true };
		} catch (err) {
			return fail(500, { error: 'Fehler beim Entfernen der Zuweisung' });
		}
	}
};
