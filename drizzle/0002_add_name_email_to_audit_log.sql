-- Add name and email columns to audit_log table
ALTER TABLE `audit_log` ADD COLUMN `name` text;
--> statement-breakpoint
ALTER TABLE `audit_log` ADD COLUMN `email` text;

