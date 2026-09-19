ALTER TABLE `x_posts` ADD `capture_source` text DEFAULT 'X 官方 API' NOT NULL;--> statement-breakpoint
ALTER TABLE `x_posts` ADD `attribution_url` text;
