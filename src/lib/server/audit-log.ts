import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
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
		resourceName?: string;
		details?: string | Record<string, unknown>;
		targetUserId?: string;
		targetUserName?: string;
		targetUserEmail?: string;
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

	let targetUserEmail: string | null = null;
	if (options?.targetUserEmail) {
		targetUserEmail = maskEmail(options.targetUserEmail);
	}

	await db.insert(table.auditLog).values({
		id: randomUUID(),
		userId,
		name: userName,
		email: maskedEmail,
		action,
		resourceType: options?.resourceType || null,
		resourceId: options?.resourceId || null,
		resourceName: options?.resourceName || null,
		details: detailsString,
		targetUserId: options?.targetUserId || null,
		targetUserName: options?.targetUserName || null,
		targetUserEmail,
		createdAt: new Date()
	});
}

export async function getAuditLogs(limit: number = 100, offset: number = 0) {
	const targetUserAlias = alias(table.user, 'target_user');

	const logs = await db
		.select({
			id: table.auditLog.id,
			userId: table.auditLog.userId,
			name: table.auditLog.name,
			email: table.auditLog.email,
			action: table.auditLog.action,
			resourceType: table.auditLog.resourceType,
			resourceId: table.auditLog.resourceId,
			resourceName: table.auditLog.resourceName,
			details: table.auditLog.details,
			targetUserId: table.auditLog.targetUserId,
			targetUserName: table.auditLog.targetUserName,
			targetUserEmail: table.auditLog.targetUserEmail,
			createdAt: table.auditLog.createdAt,
			user: {
				name: table.user.name,
				email: table.user.email
			},
			targetUser: {
				name: targetUserAlias.name,
				email: targetUserAlias.email
			}
		})
		.from(table.auditLog)
		.leftJoin(table.user, eq(table.auditLog.userId, table.user.id))
		.leftJoin(targetUserAlias, eq(table.auditLog.targetUserId, targetUserAlias.id))
		.orderBy(desc(table.auditLog.createdAt))
		.limit(limit)
		.offset(offset);

	return logs;
}

export async function getAuditLogCount() {
	const result = await db.select().from(table.auditLog);
	return result.length;
}
