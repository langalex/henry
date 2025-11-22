import type { PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/auth-helpers';
import { getAuditLogs, getAuditLogCount } from '$lib/server/audit-log';

export const load: PageServerLoad = async (event) => {
	requireAdmin(event);

	const page = Number(event.url.searchParams.get('page') || '1');
	const limit = 50;
	const offset = (page - 1) * limit;

	const [logs, totalCount] = await Promise.all([
		getAuditLogs(limit, offset),
		getAuditLogCount()
	]);

	return {
		logs,
		page,
		totalCount,
		totalPages: Math.ceil(totalCount / limit)
	};
};

