import { fail, redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import * as email from '$lib/server/email';

export async function load({ locals }) {
	if (locals.user) {
		throw redirect(302, '/events');
	}
}

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const emailAddress = data.get('email')?.toString();

		if (!emailAddress) {
			return fail(400, { error: 'Email ist erforderlich' });
		}

		const user = await auth.getUserByEmail(emailAddress);
		if (!user) {
			return fail(404, { error: 'Benutzer nicht gefunden' });
		}

		const token = await auth.createEmailVerificationToken(user.id);
		await email.sendLoginLink(user.email, token);

		return { success: true, message: 'Login-Link wurde per E-Mail gesendet' };
	}
};

