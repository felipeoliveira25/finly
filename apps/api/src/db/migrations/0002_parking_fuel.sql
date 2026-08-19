CREATE TABLE `parking_fees` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`description` text,
	`period_id` integer,
	`created_at` text NOT NULL,
	FOREIGN KEY (`period_id`) REFERENCES `reimbursement_periods`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `fuel_refills` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`description` text,
	`period_id` integer,
	`created_at` text NOT NULL,
	FOREIGN KEY (`period_id`) REFERENCES `reimbursement_periods`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `reimbursement_periods` ADD COLUMN `total_parking_cents` integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE `reimbursement_periods` ADD COLUMN `total_fuel_refill_cents` integer NOT NULL DEFAULT 0;
