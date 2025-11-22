import type { Handle } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { getUserRoles } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = auth.readSessionCookie(event.request.headers.get('cookie') ?? '');

	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSession(sessionId);

	if (!session || !user) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const roles = await getUserRoles(user.id);

	event.locals.session = session;
	event.locals.user = {
		...user,
		roles
	};

	return resolve(event);
};
