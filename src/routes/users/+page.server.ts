import { db } from '$lib/server/db';
import { user, userRole } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '$lib/server/auth-helpers';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const currentUser = requireAdmin(event);
	
	const users = await db.select().from(user);
	
	const usersWithRoles = await Promise.all(
		users.map(async (u) => {
			const roles = await db
				.select({ role: userRole.role })
				.from(userRole)
				.where(eq(userRole.userId, u.id));
			return {
				...u,
				roles: roles.map((r) => r.role)
			};
		})
	);

	return {
		users: usersWithRoles,
		user: currentUser
	};
};

