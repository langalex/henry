import { redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user, userRole } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '$lib/server/auth-helpers';
import { randomUUID } from 'crypto';
import * as auth from '$lib/server/auth';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async (event) => {
	requireAdmin(event);
	return {};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		requireAdmin({ locals } as any);
		
		const data = await request.formData();
		const name = data.get('name')?.toString();
		const email = data.get('email')?.toString();
		const roles = data.getAll('roles').map((r) => r.toString());

		if (!name || !email) {
			return fail(400, { error: 'Name und E-Mail sind erforderlich' });
		}

		const existingUser = await auth.getUserByEmail(email);
		if (existingUser) {
			return fail(400, { error: 'Benutzer mit dieser E-Mail existiert bereits' });
		}

		try {
			await auth.createUser(email, name, roles);
			throw redirect(303, '/users');
		} catch (error) {
			if (error && typeof error === 'object' && 'status' in error) {
				throw error;
			}
			return fail(500, { error: 'Fehler beim Erstellen des Benutzers' });
		}
	}
};

