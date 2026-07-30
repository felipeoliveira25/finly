CREATE TABLE `car_trips` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`fixed_route_id` integer,
	`distance_meters` integer NOT NULL,
	`description` text,
	`config_id` integer NOT NULL,
	`cost_cents` integer NOT NULL,
	`period_id` integer,
	`created_at` text NOT NULL,
	FOREIGN KEY (`fixed_route_id`) REFERENCES `fixed_routes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`config_id`) REFERENCES `car_usage_configs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`period_id`) REFERENCES `reimbursement_periods`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `car_usage_configs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`price_per_liter_cents` integer NOT NULL,
	`avg_consumption_cdkm` integer NOT NULL,
	`effective_from` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `fixed_routes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`distance_meters` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reimbursement_periods` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`label` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`total_km_meters` integer NOT NULL,
	`total_cost_cents` integer NOT NULL,
	`closed_at` text NOT NULL,
	`created_at` text NOT NULL
);
