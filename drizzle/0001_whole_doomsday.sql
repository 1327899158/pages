CREATE TABLE `x_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` text NOT NULL,
	`author_username` text NOT NULL,
	`author_name` text NOT NULL,
	`creator_category` text NOT NULL,
	`creator_tier` text NOT NULL,
	`text` text NOT NULL,
	`url` text NOT NULL,
	`lang` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`archive_date` text NOT NULL,
	`like_count` integer DEFAULT 0 NOT NULL,
	`repost_count` integer DEFAULT 0 NOT NULL,
	`reply_count` integer DEFAULT 0 NOT NULL,
	`quote_count` integer DEFAULT 0 NOT NULL,
	`impression_count` integer DEFAULT 0 NOT NULL,
	`engagement_score` integer DEFAULT 0 NOT NULL,
	`profile_image_url` text,
	`captured_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_x_posts_post_id_unique` ON `x_posts` (`post_id`);--> statement-breakpoint
CREATE INDEX `idx_x_posts_archive_score` ON `x_posts` (`archive_date`,`engagement_score`);--> statement-breakpoint
CREATE INDEX `idx_x_posts_author` ON `x_posts` (`author_username`);--> statement-breakpoint
CREATE TABLE `x_refresh_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`archive_date` text NOT NULL,
	`started_at` text NOT NULL,
	`finished_at` text NOT NULL,
	`creator_total` integer NOT NULL,
	`query_total` integer NOT NULL,
	`query_ok` integer NOT NULL,
	`fetched` integer NOT NULL,
	`inserted` integer NOT NULL,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_x_refresh_runs_date` ON `x_refresh_runs` (`archive_date`);
