ALTER TABLE `event` ADD COLUMN `contributions_list_name` text;
--> statement-breakpoint
CREATE TABLE `contribution` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL REFERENCES `event`(`id`) ON DELETE cascade,
	`user_id` text NOT NULL REFERENCES `user`(`id`) ON DELETE cascade,
	`title` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL
);

