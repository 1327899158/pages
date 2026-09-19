import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const articles = sqliteTable(
  "articles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    url: text("url").notNull(),
    sourceId: text("source_id").notNull(),
    sourceName: text("source_name").notNull(),
    sourceGroup: text("source_group").notNull(),
    region: text("region").notNull(),
    topic: text("topic").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    author: text("author").notNull().default(""),
    imageUrl: text("image_url"),
    publishedAt: text("published_at").notNull(),
    archiveDate: text("archive_date").notNull(),
    capturedAt: text("captured_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_articles_url_unique").on(table.url),
    index("idx_articles_archive_date_published").on(table.archiveDate, table.publishedAt),
    index("idx_articles_source_id").on(table.sourceId),
    index("idx_articles_topic").on(table.topic),
  ],
);

export const refreshRuns = sqliteTable(
  "refresh_runs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    archiveDate: text("archive_date").notNull(),
    startedAt: text("started_at").notNull(),
    finishedAt: text("finished_at").notNull(),
    sourceTotal: integer("source_total").notNull(),
    sourceOk: integer("source_ok").notNull(),
    fetched: integer("fetched").notNull(),
    inserted: integer("inserted").notNull(),
  },
  (table) => [index("idx_refresh_runs_date").on(table.archiveDate)],
);

export const xPosts = sqliteTable(
  "x_posts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    postId: text("post_id").notNull(),
    authorUsername: text("author_username").notNull(),
    authorName: text("author_name").notNull(),
    creatorCategory: text("creator_category").notNull(),
    creatorTier: text("creator_tier").notNull(),
    text: text("text").notNull(),
    url: text("url").notNull(),
    lang: text("lang").notNull().default(""),
    createdAt: text("created_at").notNull(),
    archiveDate: text("archive_date").notNull(),
    likeCount: integer("like_count").notNull().default(0),
    repostCount: integer("repost_count").notNull().default(0),
    replyCount: integer("reply_count").notNull().default(0),
    quoteCount: integer("quote_count").notNull().default(0),
    impressionCount: integer("impression_count").notNull().default(0),
    engagementScore: integer("engagement_score").notNull().default(0),
    profileImageUrl: text("profile_image_url"),
    captureSource: text("capture_source").notNull().default("X 官方 API"),
    attributionUrl: text("attribution_url"),
    capturedAt: text("captured_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_x_posts_post_id_unique").on(table.postId),
    index("idx_x_posts_archive_score").on(table.archiveDate, table.engagementScore),
    index("idx_x_posts_author").on(table.authorUsername),
  ],
);

export const xRefreshRuns = sqliteTable(
  "x_refresh_runs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    archiveDate: text("archive_date").notNull(),
    startedAt: text("started_at").notNull(),
    finishedAt: text("finished_at").notNull(),
    creatorTotal: integer("creator_total").notNull(),
    queryTotal: integer("query_total").notNull(),
    queryOk: integer("query_ok").notNull(),
    fetched: integer("fetched").notNull(),
    inserted: integer("inserted").notNull(),
    status: text("status").notNull(),
  },
  (table) => [index("idx_x_refresh_runs_date").on(table.archiveDate)],
);

