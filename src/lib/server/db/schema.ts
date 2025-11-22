import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	name: text('name').notNull()
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const userRole = sqliteTable('user_role', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	role: text('role').notNull()
});

export const emailVerificationToken = sqliteTable('email_verification_token', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
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

export const jobAssignment = sqliteTable('job_assignment', {
	id: text('id').primaryKey(),
	jobId: text('job_id')
		.notNull()
		.references(() => job.id, { onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
});

export const materialAssignment = sqliteTable('material_assignment', {
	id: text('id').primaryKey(),
	materialId: text('material_id')
		.notNull()
		.references(() => material.id, { onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
});

export const auditLog = sqliteTable('audit_log', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
	action: text('action').notNull(),
	resourceType: text('resource_type'),
	resourceId: text('resource_id'),
	details: text('details'),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const userRelations = relations(user, ({ many }) => ({
	roles: many(userRole),
	sessions: many(session),
	emailVerificationTokens: many(emailVerificationToken),
	jobAssignments: many(jobAssignment),
	materialAssignments: many(materialAssignment),
	auditLogs: many(auditLog)
}));

export const userRoleRelations = relations(userRole, ({ one }) => ({
	user: one(user, {
		fields: [userRole.userId],
		references: [user.id]
	})
}));

export const eventRelations = relations(event, ({ many }) => ({
	jobs: many(job),
	materials: many(material)
}));

export const jobRelations = relations(job, ({ one, many }) => ({
	event: one(event, {
		fields: [job.eventId],
		references: [event.id]
	}),
	assignments: many(jobAssignment)
}));

export const jobAssignmentRelations = relations(jobAssignment, ({ one }) => ({
	job: one(job, {
		fields: [jobAssignment.jobId],
		references: [job.id]
	}),
	user: one(user, {
		fields: [jobAssignment.userId],
		references: [user.id]
	})
}));

export const materialRelations = relations(material, ({ one, many }) => ({
	event: one(event, {
		fields: [material.eventId],
		references: [event.id]
	}),
	assignments: many(materialAssignment)
}));

export const materialAssignmentRelations = relations(materialAssignment, ({ one }) => ({
	material: one(material, {
		fields: [materialAssignment.materialId],
		references: [material.id]
	}),
	user: one(user, {
		fields: [materialAssignment.userId],
		references: [user.id]
	})
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
	user: one(user, {
		fields: [auditLog.userId],
		references: [user.id]
	})
}));

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type UserRole = typeof userRole.$inferSelect;
export type EmailVerificationToken = typeof emailVerificationToken.$inferSelect;
export type Event = typeof event.$inferSelect;
export type Job = typeof job.$inferSelect;
export type Material = typeof material.$inferSelect;
export type JobAssignment = typeof jobAssignment.$inferSelect;
export type MaterialAssignment = typeof materialAssignment.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type NewUserRole = typeof userRole.$inferInsert;
export type NewEmailVerificationToken = typeof emailVerificationToken.$inferInsert;
export type NewEvent = typeof event.$inferInsert;
export type NewJob = typeof job.$inferInsert;
export type NewMaterial = typeof material.$inferInsert;
export type NewJobAssignment = typeof jobAssignment.$inferInsert;
export type NewMaterialAssignment = typeof materialAssignment.$inferInsert;
export type AuditLog = typeof auditLog.$inferSelect;
export type NewAuditLog = typeof auditLog.$inferInsert;
