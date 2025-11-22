import { redirect, error } from '@sveltejs/kit';
import { auth, validateEmailToken } from '$lib/server/auth';

export async function load({ url, cookies }) {
	const token = url.searchParams.get('token');

	if (!token) {
		throw error(400, 'Token fehlt');
	}

	const { user } = await validateEmailToken(token);

	if (!user) {
		throw error(400, 'Ungültiger oder abgelaufener Token');
	}

	const session = await auth.createSession(user.id, {});
	const sessionCookie = auth.createSessionCookie(session.id);
	cookies.set(sessionCookie.name, sessionCookie.value, {
		path: sessionCookie.attributes.path ?? '/',
		sameSite: (sessionCookie.attributes.sameSite ?? 'lax') as 'lax' | 'strict' | 'none',
		secure: sessionCookie.attributes.secure ?? false,
		httpOnly: true,
		maxAge: sessionCookie.attributes.maxAge
	});

	throw redirect(302, '/events');
}
