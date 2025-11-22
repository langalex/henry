import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type { RequestEvent } from '@sveltejs/kit';

function maskEmail(email: string): string {
	const [localPart, domain] = email.split('@');
	if (!domain) return email;

	if (localPart.length <= 2) {
		return `${localPart[0]}***@***`;
	}

	const maskedLocal = `${localPart[0]}${'*'.repeat(localPart.length - 2)}${localPart[localPart.length - 1]}`;
	return `${maskedLocal}@***`;
}

export async function logAuditEvent(
	event: RequestEvent | { request: Request; locals: App.Locals },
	action: string,
	options?: {
		resourceType?: string;
		resourceId?: string;
		details?: string | Record<string, unknown>;
	}
) {
	const userId = event.locals.user?.id || null;
	let userName: string | null = null;
	let maskedEmail: string | null = null;

	if (event.locals.user) {
		userName = event.locals.user.name;
		if (event.locals.user.email) {
			maskedEmail = maskEmail(event.locals.user.email);
		}
	}

	const detailsString: string | null = options?.details
		? typeof options.details === 'object'
			? JSON.stringify(options.details)
			: options.details
		: null;

	await db.insert(table.auditLog).values({
		id: randomUUID(),
		userId,
		name: userName,
		email: maskedEmail,
		action,
		resourceType: options?.resourceType || null,
		resourceId: options?.resourceId || null,
		details: detailsString,
		createdAt: new Date()
	});
}

export async function getAuditLogs(limit: number = 100, offset: number = 0) {
	const logs = await db
		.select({
			id: table.auditLog.id,
			userId: table.auditLog.userId,
			name: table.auditLog.name,
			email: table.auditLog.email,
			action: table.auditLog.action,
			resourceType: table.auditLog.resourceType,
			resourceId: table.auditLog.resourceId,
			details: table.auditLog.details,
			createdAt: table.auditLog.createdAt,
			user: {
				name: table.user.name,
				email: table.user.email
			}
		})
		.from(table.auditLog)
		.leftJoin(table.user, eq(table.auditLog.userId, table.user.id))
		.orderBy(desc(table.auditLog.createdAt))
		.limit(limit)
		.offset(offset);

	return logs;
}

export async function getAuditLogCount() {
	const result = await db.select().from(table.auditLog);
	return result.length;
}
