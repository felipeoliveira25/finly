CREATE TABLE `finance_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`is_system` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recurring_transaction_models` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`category_id` integer NOT NULL,
	`default_amount_cents` integer NOT NULL,
	`day_of_month` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `finance_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`category_id` integer NOT NULL,
	`amount_cents` integer NOT NULL,
	`description` text,
	`date` text NOT NULL,
	`month_key` text NOT NULL,
	`recurring_model_id` integer,
	`is_confirmed` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `finance_categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recurring_model_id`) REFERENCES `recurring_transaction_models`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `finance_categories_name_unique` ON `finance_categories` (`name`);
--> statement-breakpoint
INSERT INTO `finance_categories` (`name`, `is_system`, `created_at`) VALUES
  ('Salário',           1, datetime('now')),
  ('VR',                1, datetime('now')),
  ('Moradia',           1, datetime('now')),
  ('Academia',          1, datetime('now')),
  ('Cartão de Crédito', 1, datetime('now')),
  ('Alimentação',       1, datetime('now')),
  ('Lazer',             1, datetime('now')),
  ('Transporte',        1, datetime('now')),
  ('Saúde',             1, datetime('now')),
  ('Diversos',          1, datetime('now'));