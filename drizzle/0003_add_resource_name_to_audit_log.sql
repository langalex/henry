-- Add resource_name column to audit_log table
ALTER TABLE `audit_log` ADD COLUMN `resource_name` text;

