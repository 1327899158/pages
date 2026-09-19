import { env } from "cloudflare:workers";
import { ensureSchema, refreshAll, shanghaiDate } from "../../lib/ingest";
import { corsJson, corsOptions } from "../../lib/cors";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await ensureSchema();
  const url = new URL(request.url);
  const date = url.searchParams.get("date") || shanghaiDate();
  const topic = url.searchParams.get("topic") || "";
  const group = url.searchParams.get("group") || "";
  const query = url.searchParams.get("q")?.trim() || "";
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 300), 1), 500);
  const conditions = ["archive_date = ?"];
  const values: unknown[] = [date];
  if (topic) { conditions.push("topic = ?"); values.push(topic); }
  if (group) { conditions.push("source_group = ?"); values.push(group); }
  if (query) { conditions.push("(title LIKE ? OR excerpt LIKE ? OR source_name LIKE ?)"); values.push(`%${query}%`, `%${query}%`, `%${query}%`); }

  const result = await env.DB.prepare(`SELECT
    id, title, url, source_id AS sourceId, source_name AS sourceName,
    source_group AS sourceGroup, region, topic, excerpt, author,
    image_url AS imageUrl, published_at AS publishedAt, archive_date AS archiveDate,
    captured_at AS capturedAt
    FROM articles WHERE ${conditions.join(" AND ")}
    ORDER BY published_at DESC LIMIT ?`).bind(...values, limit).all();
  const dates = await env.DB.prepare("SELECT archive_date AS date, COUNT(*) AS count FROM articles GROUP BY archive_date ORDER BY archive_date DESC LIMIT 120").all();
  const lastRun = await env.DB.prepare("SELECT archive_date AS archiveDate, finished_at AS finishedAt, source_total AS sourceTotal, source_ok AS sourceOk, fetched, inserted FROM refresh_runs ORDER BY id DESC LIMIT 1").first();

  return corsJson(request, { date, articles: result.results, dates: dates.results, lastRun });
}

export async function POST(request: Request) {
  const summary = await refreshAll();
  return corsJson(request, { ok: true, summary });
}

export async function OPTIONS(request: Request) { return corsOptions(request); }

