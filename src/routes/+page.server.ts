import { redirect, fail } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import * as email from '$lib/server/email';

export async function load({ locals }) {
	if (locals.user) {
		throw redirect(302, '/events');
	}

	const userCount = await auth.getUserCount();
	if (userCount === 0) {
		return { showSignup: true };
	}

	throw redirect(302, '/auth/login');
}

export const actions = {
	signup: async ({ request }) => {
		const data = await request.formData();
		const emailAddress = data.get('email')?.toString();
		const name = data.get('name')?.toString();

		if (!emailAddress || !name) {
			return fail(400, { error: 'E-Mail und Name sind erforderlich' });
		}

		const existingUser = await auth.getUserByEmail(emailAddress);
		if (existingUser) {
			return fail(400, { error: 'Benutzer mit dieser E-Mail existiert bereits' });
		}

		const userCount = await auth.getUserCount();
		const roles = userCount === 0 ? ['parent', 'admin'] : [];

		const userId = await auth.createUser(emailAddress, name, roles);
		const token = await auth.createEmailVerificationToken(userId);
		await email.sendLoginLink(emailAddress, token);

		return {
			success: true,
			message: 'Registrierung erfolgreich. Bitte prüfen Sie Ihre E-Mails für den Login-Link.'
		};
	}
};

