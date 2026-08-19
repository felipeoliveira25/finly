CREATE TABLE `stock_positions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ticker` text NOT NULL,
	`quantity` integer NOT NULL,
	`avg_price_cents` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stock_positions_ticker_unique` ON `stock_positions` (`ticker`);
--> statement-breakpoint
CREATE TABLE `stock_purchases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ticker` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price_cents` integer NOT NULL,
	`total_cost_cents` integer NOT NULL,
	`purchase_date` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `treasury_applications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title_code` text NOT NULL,
	`maturity_date` text NOT NULL,
	`investment_amount_cents` integer NOT NULL,
	`contracted_rate_bps` integer NOT NULL,
	`purchase_date` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `treasury_redemptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`application_id` integer NOT NULL,
	`redeemed_amount_cents` integer NOT NULL,
	`redemption_date` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `treasury_applications`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `option_positions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`underlying_asset` text NOT NULL,
	`option_type` text NOT NULL,
	`strategy_label` text,
	`quantity` integer NOT NULL,
	`premium_received_cents` integer NOT NULL,
	`strike_cents` integer NOT NULL,
	`breakeven_cents` integer NOT NULL,
	`pop_bps` integer NOT NULL,
	`expiry_date` text NOT NULL,
	`is_active` integer NOT NULL DEFAULT 1,
	`created_at` text NOT NULL,
	`closed_at` text
);
--> statement-breakpoint
CREATE TABLE `portfolio_snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`snapshot_date` text NOT NULL,
	`stocks_value_cents` integer NOT NULL,
	`treasury_value_cents` integer NOT NULL,
	`total_value_cents` integer NOT NULL,
	`data_source` text NOT NULL DEFAULT 'cron',
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `portfolio_snapshots_snapshot_date_unique` ON `portfolio_snapshots` (`snapshot_date`);
--> statement-breakpoint
CREATE TABLE `cron_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`job_name` text NOT NULL,
	`ran_at` text NOT NULL,
	`status` text NOT NULL,
	`error_msg` text,
	`created_at` text NOT NULL
);
