import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';
import { Lettermint } from 'lettermint';
const apiToken = privateEnv.LETTERMINT_API_TOKEN;

function createTransporter(): Lettermint {
	if (!apiToken) {
		throw new Error('LETTERMINT_API_TOKEN is not set');
	}
	return new Lettermint({
		apiToken
	});
}

export async function sendLoginLink(email: string, token: string) {
	const baseUrl = env.PUBLIC_APP_URL || 'http://localhost:5173';
	const loginUrl = `${baseUrl}/auth/verify?token=${token}`;

	if (dev) {
		console.log('=== LOGIN LINK ===');
		console.log(`To: ${email}`);
		console.log(`Link: ${loginUrl}`);
		console.log('==================');
		return;
	}

	try {
		const transporter = createTransporter();

		await transporter.email
			.route('outgoing')
			.from('Klasse 1/2b <me+henry@langalex.org>')
			.to(email)
			.subject('Login-Link')
			.text(`Klicke auf diesen Link, um dich anzumelden: ${loginUrl}`)
			.html(
				`
					<h1>Klasse 1/2b</h1>
					<p>Klicke auf diesen Link, um dich anzumelden:</p>
					<p><a href="${loginUrl}">${loginUrl}</a></p>
					<p>Dieser Link ist 1 Stunde gültig.</p>
				`
			)
			.send();
	} catch (error) {
		console.error('Failed to send email:', error);
		throw new Error('Failed to send email');
	}
}
