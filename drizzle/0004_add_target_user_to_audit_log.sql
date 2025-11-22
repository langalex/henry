ALTER TABLE `audit_log` ADD COLUMN `target_user_id` text REFERENCES `user`(`id`) ON DELETE set null;
--> statement-breakpoint
ALTER TABLE `audit_log` ADD COLUMN `target_user_name` text;
--> statement-breakpoint
ALTER TABLE `audit_log` ADD COLUMN `target_user_email` text;

