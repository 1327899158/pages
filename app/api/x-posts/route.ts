import { env } from "cloudflare:workers";
import { X_CREATORS } from "../../lib/x-creators";
import { ensureXSchema, refreshXPosts, xShanghaiDate } from "../../lib/x-ingest";
import { corsJson, corsOptions } from "../../lib/cors";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await ensureXSchema();
  const url = new URL(request.url);
  const date = url.searchParams.get("date") || xShanghaiDate();
  const category = url.searchParams.get("category") || "";
  const creator = url.searchParams.get("creator") || "";
  const conditions = ["archive_date = ?"];
  const values: unknown[] = [date];
  if (category) { conditions.push("creator_category = ?"); values.push(category); }
  if (creator) { conditions.push("LOWER(author_username) = LOWER(?)"); values.push(creator); }
  const rows = await env.DB.prepare(`SELECT id, post_id AS postId, author_username AS authorUsername,
    author_name AS authorName, creator_category AS creatorCategory, creator_tier AS creatorTier,
    text, url, lang, created_at AS createdAt, archive_date AS archiveDate,
    like_count AS likeCount, repost_count AS repostCount, reply_count AS replyCount,
    quote_count AS quoteCount, impression_count AS impressionCount,
    engagement_score AS engagementScore, profile_image_url AS profileImageUrl,
    capture_source AS captureSource, attribution_url AS attributionUrl,
    captured_at AS capturedAt FROM x_posts WHERE ${conditions.join(" AND ")}
    ORDER BY engagement_score DESC, created_at DESC LIMIT 300`).bind(...values).all();
  const dates = await env.DB.prepare("SELECT archive_date AS date, COUNT(*) AS count FROM x_posts GROUP BY archive_date ORDER BY archive_date DESC LIMIT 120").all();
  const lastRun = await env.DB.prepare(`SELECT archive_date AS archiveDate, finished_at AS finishedAt,
    creator_total AS creatorTotal, query_total AS queryTotal, query_ok AS queryOk,
    fetched, inserted, status FROM x_refresh_runs ORDER BY id DESC LIMIT 1`).first();
  const officialConfigured = Boolean((env as unknown as { X_BEARER_TOKEN?: string }).X_BEARER_TOKEN?.trim());
  const mode = officialConfigured ? "official_api" : "public_sources";
  return corsJson(request, { date, posts: rows.results, dates: dates.results, creators: X_CREATORS, configured: true, mode, officialConfigured, lastRun });
}

export async function POST(request: Request) {
  const summary = await refreshXPosts();
  return corsJson(request, { ok: summary.status !== "failed", summary }, { status: summary.status === "failed" ? 502 : 200 });
}

export async function OPTIONS(request: Request) { return corsOptions(request); }

