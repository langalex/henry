import { redirect, fail, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user, userRole } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAdmin } from '$lib/server/auth-helpers';
import { randomUUID } from 'crypto';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async (event) => {
	const currentUser = requireAdmin(event);
	
	const userId = event.params.id;
	const [targetUser] = await db.select().from(user).where(eq(user.id, userId));
	
	if (!targetUser) {
		throw error(404, 'Benutzer nicht gefunden');
	}

	const roles = await db
		.select({ role: userRole.role })
		.from(userRole)
		.where(eq(userRole.userId, userId));

	return {
		user: {
			...targetUser,
			roles: roles.map((r) => r.role)
		},
		currentUserId: currentUser.id
	};
};

export const actions: Actions = {
	update: async ({ request, locals, params }) => {
		requireAdmin({ locals } as any);
		
		const data = await request.formData();
		const name = data.get('name')?.toString();
		const email = data.get('email')?.toString();
		const roles = data.getAll('roles').map((r) => r.toString());
		const userId = params.id;

		if (!name || !email || !userId) {
			return fail(400, { error: 'Name und E-Mail sind erforderlich' });
		}

		const [existingUser] = await db
			.select()
			.from(user)
			.where(eq(user.id, userId));

		if (!existingUser) {
			return fail(404, { error: 'Benutzer nicht gefunden' });
		}

		const [emailUser] = await db
			.select()
			.from(user)
			.where(eq(user.email, email));

		if (emailUser && emailUser.id !== userId) {
			return fail(400, { error: 'E-Mail wird bereits von einem anderen Benutzer verwendet' });
		}

		try {
			await db.update(user).set({ name, email }).where(eq(user.id, userId));

			await db.delete(userRole).where(eq(userRole.userId, userId));

			if (roles.length > 0) {
				await db.insert(userRole).values(
					roles.map((role) => ({
						id: randomUUID(),
						userId,
						role
					}))
				);
			}

			throw redirect(303, '/users');
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err) {
				throw err;
			}
			return fail(500, { error: 'Fehler beim Aktualisieren des Benutzers' });
		}
	},

	delete: async ({ locals, params }) => {
		requireAdmin({ locals } as any);
		
		const userId = params.id;

		if (!userId) {
			return fail(400, { error: 'Benutzer-ID erforderlich' });
		}

		const [existingUser] = await db
			.select()
			.from(user)
			.where(eq(user.id, userId));

		if (!existingUser) {
			return fail(404, { error: 'Benutzer nicht gefunden' });
		}

		try {
			await db.delete(user).where(eq(user.id, userId));
			throw redirect(303, '/users');
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err) {
				throw err;
			}
			return fail(500, { error: 'Fehler beim Löschen des Benutzers' });
		}
	}
};

