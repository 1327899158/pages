CREATE TABLE `articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`source_id` text NOT NULL,
	`source_name` text NOT NULL,
	`source_group` text NOT NULL,
	`region` text NOT NULL,
	`topic` text NOT NULL,
	`excerpt` text DEFAULT '' NOT NULL,
	`author` text DEFAULT '' NOT NULL,
	`image_url` text,
	`published_at` text NOT NULL,
	`archive_date` text NOT NULL,
	`captured_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_articles_url_unique` ON `articles` (`url`);--> statement-breakpoint
CREATE INDEX `idx_articles_archive_date_published` ON `articles` (`archive_date`,`published_at`);--> statement-breakpoint
CREATE INDEX `idx_articles_source_id` ON `articles` (`source_id`);--> statement-breakpoint
CREATE INDEX `idx_articles_topic` ON `articles` (`topic`);--> statement-breakpoint
CREATE TABLE `refresh_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`archive_date` text NOT NULL,
	`started_at` text NOT NULL,
	`finished_at` text NOT NULL,
	`source_total` integer NOT NULL,
	`source_ok` integer NOT NULL,
	`fetched` integer NOT NULL,
	`inserted` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_refresh_runs_date` ON `refresh_runs` (`archive_date`);
