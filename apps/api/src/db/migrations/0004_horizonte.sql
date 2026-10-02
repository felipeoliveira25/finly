CREATE TABLE `trip_expenses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`desc` text NOT NULL,
	`cat` text NOT NULL,
	`valor_cents` integer NOT NULL,
	`data` text NOT NULL,
	`parcelas` integer NOT NULL DEFAULT 1,
	`paid` text NOT NULL DEFAULT '[]',
	`created_at` text NOT NULL
);
