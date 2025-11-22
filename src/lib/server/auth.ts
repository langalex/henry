import { Lucia, type RegisteredDatabaseUserAttributes } from 'lucia';
import type { Adapter, DatabaseSession, DatabaseUser } from 'lucia';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, lt } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { dev } from '$app/environment';

const EMAIL_TOKEN_EXPIRES_IN = 1000 * 60 * 60;

const drizzleAdapter: Adapter = {
	getSessionAndUser: async (
		sessionId: string
	): Promise<[DatabaseSession | null, DatabaseUser | null]> => {
		const [result] = await db
			.select({
				user: table.user,
				session: table.session
			})
			.from(table.session)
			.innerJoin(table.user, eq(table.session.userId, table.user.id))
			.where(eq(table.session.id, sessionId));

		if (!result) {
			return [null, null];
		}

		const { session, user } = result;
		return [
			{
				id: session.id,
				userId: session.userId,
				expiresAt: session.expiresAt,
				attributes: {}
			},
			{
				id: user.id,
				attributes: {
					email: user.email,
					name: user.name
				}
			}
		];
	},
	getUserSessions: async (userId: string): Promise<DatabaseSession[]> => {
		const sessions = await db.select().from(table.session).where(eq(table.session.userId, userId));

		return sessions.map((session) => ({
			id: session.id,
			userId: session.userId,
			expiresAt: session.expiresAt,
			attributes: {}
		}));
	},
	setSession: async (session: DatabaseSession): Promise<void> => {
		await db.insert(table.session).values({
			id: session.id,
			userId: session.userId,
			expiresAt: session.expiresAt
		});
	},
	updateSessionExpiration: async (sessionId: string, expiresAt: Date): Promise<void> => {
		await db.update(table.session).set({ expiresAt }).where(eq(table.session.id, sessionId));
	},
	deleteSession: async (sessionId: string): Promise<void> => {
		await db.delete(table.session).where(eq(table.session.id, sessionId));
	},
	deleteUserSessions: async (userId: string): Promise<void> => {
		await db.delete(table.session).where(eq(table.session.userId, userId));
	},
	deleteExpiredSessions: async (): Promise<void> => {
		const now = new Date();
		await db.delete(table.session).where(lt(table.session.expiresAt, now));
	}
};

export const auth = new Lucia(drizzleAdapter, {
	sessionCookie: {
		attributes: {
			secure: !dev,
			sameSite: 'lax',
			path: '/'
		}
	},
	getUserAttributes: (databaseUserAttributes: RegisteredDatabaseUserAttributes) => {
		return {
			email: (databaseUserAttributes as { email: string; name: string }).email,
			name: (databaseUserAttributes as { email: string; name: string }).name
		};
	}
});

export type Auth = typeof auth;

export async function getUserByEmail(email: string) {
	const [user] = await db.select().from(table.user).where(eq(table.user.email, email));
	return user || null;
}

export async function createUser(email: string, name: string, roles: string[] = []) {
	const userId = randomUUID();
	await db.insert(table.user).values({
		id: userId,
		email,
		name
	});

	if (roles.length > 0) {
		await db.insert(table.userRole).values(
			roles.map((role) => ({
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
	await db.insert(table.userRole).values({
		id: randomUUID(),
		userId,
		role
	});
}

export async function getUserRoles(userId: string) {
	const roles = await db
		.select({ role: table.userRole.role })
		.from(table.userRole)
		.where(eq(table.userRole.userId, userId));
	return roles.map((r) => r.role);
}

export async function createEmailVerificationToken(userId: string) {
	const token = crypto.getRandomValues(new Uint8Array(18));
	const tokenString = Buffer.from(token).toString('base64url');
	const tokenId = Buffer.from(
		await crypto.subtle.digest('SHA-256', new TextEncoder().encode(tokenString))
	).toString('hex');

	await db.insert(table.emailVerificationToken).values({
		id: tokenId,
		userId,
		expiresAt: new Date(Date.now() + EMAIL_TOKEN_EXPIRES_IN)
	});
	return tokenString;
}

export async function validateEmailToken(token: string) {
	const tokenId = Buffer.from(
		await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
	).toString('hex');

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
