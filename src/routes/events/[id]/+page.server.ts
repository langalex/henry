import { db } from '$lib/server/db';
import { event, job, material } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const evt = await db.select().from(event).where(eq(event.id, params.id)).limit(1);

	if (evt.length === 0) {
		throw error(404, 'Event nicht gefunden');
	}

	const [jobs, materials] = await Promise.all([
		db.select().from(job).where(eq(job.eventId, params.id)),
		db.select().from(material).where(eq(material.eventId, params.id))
	]);

	return {
		event: { ...evt[0], jobs, materials }
	};
};

