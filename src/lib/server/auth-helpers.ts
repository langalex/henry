import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export function requireAuth(event: RequestEvent) {
	if (!event.locals.user) {
		throw redirect(302, '/auth/login');
	}
	return event.locals.user;
}

