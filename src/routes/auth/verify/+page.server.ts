import { redirect, error } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';

export async function load({ url, cookies }) {
	const token = url.searchParams.get('token');

	if (!token) {
		throw error(400, 'Token fehlt');
	}

	const { user } = await auth.validateEmailToken(token);

	if (!user) {
		throw error(400, 'Ungültiger oder abgelaufener Token');
	}

	const sessionToken = auth.generateSessionToken();
	const session = await auth.createSession(sessionToken, user.id);
	auth.setSessionTokenCookie({ cookies } as any, sessionToken, session.expiresAt);

	throw redirect(302, '/events');
}
