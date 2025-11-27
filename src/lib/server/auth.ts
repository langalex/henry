import type { RequestEvent } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { randomUUID } from 'crypto';

const DAY_IN_MS = 1000 * 60 * 60 * 24;
const EMAIL_TOKEN_EXPIRES_IN = 1000 * 60 * 60;

export const sessionCookieName = 'auth-session';

export const ALLOWED_ROLES = ['admin'] as const;

export function validateRoles(roles: string[]): string[] {
	const invalidRoles = roles.filter(
		(role) => !ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])
	);
	if (invalidRoles.length > 0) {
		throw new Error(
			`Invalid roles: ${invalidRoles.join(', ')}. Allowed roles: ${ALLOWED_ROLES.join(', ')}`
		);
	}
	return roles;
}

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

export function generateEmailToken() {
	if (import.meta.env.DEV) {
		return 'test-token-123';
	}
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

export async function createSession(token: string, userId: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: table.Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + DAY_IN_MS * 30)
	};
	await db.insert(table.session).values(session);
	return session;
}

export async function validateSessionToken(token: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const [result] = await db
		.select({
			user: table.user,
			session: table.session
		})
		.from(table.session)
		.innerJoin(table.user, eq(table.session.userId, table.user.id))
		.where(eq(table.session.id, sessionId));

	if (!result) {
		return { session: null, user: null };
	}
	const { session, user } = result;

	const sessionExpired = Date.now() >= session.expiresAt.getTime();
	if (sessionExpired) {
		await db.delete(table.session).where(eq(table.session.id, session.id));
		return { session: null, user: null };
	}

	const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
	if (renewSession) {
		session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
		await db
			.update(table.session)
			.set({ expiresAt: session.expiresAt })
			.where(eq(table.session.id, session.id));
	}

	const roles = await db
		.select({ role: table.userRole.role })
		.from(table.userRole)
		.where(eq(table.userRole.userId, user.id));

	return {
		session,
		user: {
			...user,
			roles: roles.map((r) => r.role)
		}
	};
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(sessionId: string) {
	await db.delete(table.session).where(eq(table.session.id, sessionId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production'
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: '/'
	});
}

export async function createEmailVerificationToken(userId: string) {
	const token = generateEmailToken();
	const tokenId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	await db.insert(table.emailVerificationToken).values({
		id: tokenId,
		userId,
		expiresAt: new Date(Date.now() + EMAIL_TOKEN_EXPIRES_IN)
	});
	return token;
}

export async function validateEmailToken(token: string) {
	const tokenId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const [result] = await db
		.select({
			emailVerificationToken: table.emailVerificationToken,
			user: table.user
		})
		.from(table.emailVerificationToken)
		.innerJoin(table.user, eq(table.emailVerificationToken.userId, table.user.id))
		.where(eq(table.emailVerificationToken.id, tokenId));

	if (!result) {
		return { token: null, user: null };
	}

	const { emailVerificationToken: emailToken, user } = result;

	const tokenExpired = Date.now() >= emailToken.expiresAt.getTime();
	if (tokenExpired) {
		await db
			.delete(table.emailVerificationToken)
			.where(eq(table.emailVerificationToken.id, emailToken.id));
		return { token: null, user: null };
	}

	await db
		.delete(table.emailVerificationToken)
		.where(eq(table.emailVerificationToken.id, emailToken.id));

	return { token: emailToken, user };
}

export async function getUserByEmail(email: string) {
	const [user] = await db.select().from(table.user).where(eq(table.user.email, email));
	return user || null;
}

export async function createUser(email: string, name: string, roles: string[] = []) {
	const validatedRoles = validateRoles(roles);
	const userId = randomUUID();
	await db.insert(table.user).values({
		id: userId,
		email,
		name
	});

	if (validatedRoles.length > 0) {
		await db.insert(table.userRole).values(
			validatedRoles.map((role) => ({
				id: randomUUID(),
				userId,
				role
			}))
		);
	}

	return userId;
}

export async function getUserCount() {
	const result = await db.select({ count: table.user.id }).from(table.user);
	return result.length;
}

export async function addUserRole(userId: string, role: string) {
	if (!ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])) {
		throw new Error(`Invalid role: ${role}`);
	}
	await db.insert(table.userRole).values({
		id: randomUUID(),
		userId,
		role
	});
}
