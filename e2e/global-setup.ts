import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { execSync } from 'child_process';
import * as schema from '../src/lib/server/db/schema';

async function globalSetup() {
	try {
		execSync('DATABASE_URL=test.db npx drizzle-kit push --force', {
			stdio: 'inherit',
			cwd: process.cwd()
		});
	} catch (error) {
		console.error('Failed to push schema:', error);
		throw error;
	}
	return flushDatabase();
}

async function withDb(callback: (db: ReturnType<typeof drizzle>) => Promise<void>) {
	const databaseUrl = 'test.db';
	const client = new Database(databaseUrl);
	const db = drizzle(client, { schema });
	await callback(db);
	client.close();
}

export async function flushDatabase() {
	withDb(async (db) => {
		await db.delete(schema.auditLog);
		await db.delete(schema.materialAssignment);
		await db.delete(schema.jobAssignment);
		await db.delete(schema.material);
		await db.delete(schema.job);
		await db.delete(schema.event);
		await db.delete(schema.userRole);
		await db.delete(schema.session);
		await db.delete(schema.emailVerificationToken);
		await db.delete(schema.user);
	});
}

export default globalSetup;
