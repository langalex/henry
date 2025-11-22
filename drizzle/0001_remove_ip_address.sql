-- Drop ip_address and user_agent columns from audit_log table
ALTER TABLE `audit_log` DROP COLUMN `ip_address`;
--> statement-breakpoint
ALTER TABLE `audit_log` DROP COLUMN `user_agent`;

