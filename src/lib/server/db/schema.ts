import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	age: integer('age')
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const event = sqliteTable('event', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	description: text('description'),
	date: text('date').notNull(),
	time: text('time').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const job = sqliteTable('job', {
	id: text('id').primaryKey(),
	eventId: text('event_id')
		.notNull()
		.references(() => event.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	description: text('description'),
	startTime: text('start_time').notNull(),
	endTime: text('end_time').notNull(),
	numberOfPeople: integer('number_of_people').notNull()
});

export const material = sqliteTable('material', {
	id: text('id').primaryKey(),
	eventId: text('event_id')
		.notNull()
		.references(() => event.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	description: text('description')
});

export const eventRelations = relations(event, ({ many }) => ({
	jobs: many(job),
	materials: many(material)
}));

export const jobRelations = relations(job, ({ one }) => ({
	event: one(event, {
		fields: [job.eventId],
		references: [event.id]
	})
}));

export const materialRelations = relations(material, ({ one }) => ({
	event: one(event, {
		fields: [material.eventId],
		references: [event.id]
	})
}));

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Event = typeof event.$inferSelect;
export type Job = typeof job.$inferSelect;
export type Material = typeof material.$inferSelect;
export type NewEvent = typeof event.$inferInsert;
export type NewJob = typeof job.$inferInsert;
export type NewMaterial = typeof material.$inferInsert;
