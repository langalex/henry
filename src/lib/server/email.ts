import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';

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

	// TODO: Implement actual email sending (e.g., using Resend, SendGrid, etc.)
	console.log('Email sending not configured. Login link:', loginUrl);
}
