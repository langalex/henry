import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, cookies }) => {
	if (locals.session) {
		await auth.invalidateSession(locals.session.id);
	}
	const sessionCookie = auth.createBlankSessionCookie();
	cookies.set(sessionCookie.name, sessionCookie.value, {
		path: sessionCookie.attributes.path ?? '/',
		sameSite: (sessionCookie.attributes.sameSite ?? 'lax') as 'lax' | 'strict' | 'none',
		secure: sessionCookie.attributes.secure ?? false,
		httpOnly: true,
		maxAge: 0
	});

	throw redirect(302, '/auth/login');
};
