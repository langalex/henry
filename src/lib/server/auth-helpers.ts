import { redirect, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export function requireAuth(event: RequestEvent) {
	if (!event.locals.user) {
		throw redirect(302, '/auth/login');
	}
	return event.locals.user;
}

export function requireAdmin(event: RequestEvent) {
	const user = requireAuth(event);
	if (!user.roles?.includes('admin')) {
		throw error(403, 'Zugriff verweigert: Admin-Rechte erforderlich');
	}
	return user;
}
