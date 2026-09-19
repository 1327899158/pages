import { XMLParser } from "fast-xml-parser";
import { env } from "cloudflare:workers";
import { AI_PATTERN, SOURCES, type NewsSource } from "./sources";

export type Article = {
  id?: number;
  title: string;
  url: string;
  sourceId: string;
  sourceName: string;
  sourceGroup: string;
  region: string;
  topic: string;
  excerpt: string;
  author: string;
  imageUrl: string | null;
  publishedAt: string;
  archiveDate: string;
  capturedAt?: string;
};

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", cdataPropName: "#cdata", processEntities: true });

const text = (value: unknown): string => {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return text(value[0]);
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return text(obj["#text"] ?? obj["#cdata"] ?? obj["@_href"] ?? "");
  }
  return "";
};

const clean = (value: unknown, max = 420) => text(value)
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;|&#160;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&lt;/gi, "<")
  .replace(/&gt;/gi, ">")
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
  .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 10)))
  .replace(/\s+/g, " ")
  .trim()
  .slice(0, max);

const shanghaiDate = (date = new Date()) => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit",
}).format(date);

const normalizeDate = (value: unknown) => {
  const parsed = new Date(text(value));
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

const topicFor = (title: string, excerpt: string) => {
  const value = `${title} ${excerpt}`;
  if (/policy|regulat|law|safety|copyright|governance|监管|政策|法规|安全|版权/i.test(value)) return "政策治理";
  if (/fund|rais|valuation|acqui|invest|融资|估值|收购|投资/i.test(value)) return "资本市场";
  if (/paper|research|benchmark|dataset|study|论文|研究|基准|数据集/i.test(value)) return "前沿研究";
  if (/open.?source|github|release|开源/i.test(value)) return "开源生态";
  if (/robot|embodied|autonomous|机器人|具身|自动驾驶/i.test(value)) return "具身智能";
  if (/chip|gpu|inference|training|datacenter|芯片|算力|推理|训练|数据中心/i.test(value)) return "算力基建";
  if (/launch|product|app|feature|tool|发布|产品|应用|功能|工具/i.test(value)) return "产品应用";
  return "模型动态";
};

const itemLink = (item: Record<string, unknown>) => {
  const link = item.link;
  if (Array.isArray(link)) {
    const alt = link.find((part) => typeof part === "object" && (part as Record<string, unknown>)["@_rel"] !== "enclosure");
    return text(alt ?? link[0]);
  }
  return text(link ?? item.guid ?? item.id);
};

const itemImage = (item: Record<string, unknown>) => {
  const media = item["media:content"] ?? item["media:thumbnail"] ?? item.enclosure;
  const candidate = Array.isArray(media) ? media[0] : media;
  if (candidate && typeof candidate === "object") return text((candidate as Record<string, unknown>)["@_url"]);
  const html = text(item["content:encoded"] ?? item.content ?? item.description ?? item.summary);
  return html.match(/<img[^>]+src=["']([^"']+)/i)?.[1] ?? null;
};

function fromXml(source: NewsSource, xml: string): Article[] {
  const data = parser.parse(xml) as Record<string, any>;
  const rssItems = data?.rss?.channel?.item ?? data?.RDF?.item ?? data?.["rdf:RDF"]?.item;
  const atomEntries = data?.feed?.entry;
  const items = (Array.isArray(rssItems ?? atomEntries) ? (rssItems ?? atomEntries) : [rssItems ?? atomEntries]).filter(Boolean);

  return items.slice(0, source.group === "研究论文" ? 16 : 24).map((raw: Record<string, unknown>) => {
    const title = clean(raw.title, 220);
    const excerpt = clean(raw.description ?? raw.summary ?? raw["content:encoded"] ?? raw.content, 520);
    const publishedAt = normalizeDate(raw.pubDate ?? raw.published ?? raw.updated ?? raw.date ?? raw["dc:date"]);
    return {
      title,
      url: itemLink(raw),
      sourceId: source.id,
      sourceName: source.name,
      sourceGroup: source.group,
      region: source.region,
      topic: topicFor(title, excerpt),
      excerpt,
      author: clean(raw.author ?? raw["dc:creator"] ?? raw.creator, 100),
      imageUrl: itemImage(raw),
      publishedAt,
      archiveDate: shanghaiDate(new Date(publishedAt)),
    };
  }).filter((item) => item.title && /^https?:\/\//i.test(item.url) && (!source.filter || AI_PATTERN.test(`${item.title} ${item.excerpt}`)));
}

function fromHackerNews(source: NewsSource, json: any): Article[] {
  return (json.hits ?? []).map((hit: any) => {
    const title = clean(hit.title ?? hit.story_title, 220);
    const url = hit.url ?? hit.story_url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`;
    const excerpt = `${hit.points ?? 0} points · ${hit.num_comments ?? 0} comments · Hacker News 社区讨论快照`;
    const publishedAt = normalizeDate(hit.created_at);
    return { title, url, sourceId: source.id, sourceName: source.name, sourceGroup: source.group, region: source.region, topic: topicFor(title, excerpt), excerpt, author: clean(hit.author, 100), imageUrl: null, publishedAt, archiveDate: shanghaiDate(new Date(publishedAt)) };
  }).filter((item: Article) => item.title && /^https?:\/\//i.test(item.url));
}

const safeUrl = (value: unknown, fallback: string) => {
  const candidate = clean(value, 1000);
  return /^https?:\/\//i.test(candidate) ? candidate : fallback;
};

const shanghaiTimestamp = (year: number, month: number, day: number, time = "08:00:00") => {
  const value = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${time}+08:00`;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

function fromUisdc(source: NewsSource, html: string): Article[] {
  const match = html.match(/var\s+uisdc_news\s*=\s*("(?:\\.|[^"\\])*")\s*;/);
  if (!match) return [];

  type UisdcItem = {
    title?: string; url?: string; content?: string; tag?: string; hot?: string;
    action?: string; images?: string; product?: { title?: string; permalink?: string } | string;
  };
  type UisdcDay = { id?: number; time?: number; dubao?: UisdcItem[] };

  let days: UisdcDay[] = [];
  try {
    const encoded = JSON.parse(match[1]) as string;
    days = JSON.parse(encoded) as UisdcDay[];
  } catch {
    return [];
  }

  const now = new Date();
  const headerDate = html.match(/class=["']n-date["'][\s\S]*?class=["']date["'][^>]*>(\d{1,2})月(\d{1,2})日/i);
  const shanghaiYear = Number(new Intl.DateTimeFormat("en", { timeZone: "Asia/Shanghai", year: "numeric" }).format(now));
  const shanghaiMonth = Number(new Intl.DateTimeFormat("en", { timeZone: "Asia/Shanghai", month: "numeric" }).format(now));
  const headerMonth = Number(headerDate?.[1] ?? shanghaiMonth);
  const headerDay = Number(headerDate?.[2] ?? new Intl.DateTimeFormat("en", { timeZone: "Asia/Shanghai", day: "numeric" }).format(now));
  const headerYear = headerMonth === 12 && shanghaiMonth === 1 ? shanghaiYear - 1 : shanghaiYear;
  const currentPublishedAt = shanghaiTimestamp(headerYear, headerMonth, headerDay);
  return days.flatMap((day, dayIndex) => {
    const publishedAt = day.time ? new Date(day.time * 1000).toISOString() : currentPublishedAt;
    return (day.dubao ?? []).map((item, itemIndex) => {
      const title = clean(item.title, 220);
      const insight = clean(item.content, 430);
      const action = clean(item.action, 160);
      const excerpt = clean(`${insight}${action ? ` 行动建议：${action}` : ""}`, 560);
      const fallback = `${source.siteUrl}#pulse-${day.id ?? dayIndex}-${itemIndex}`;
      const product = typeof item.product === "object" ? clean(item.product?.title, 100) : "";
      const imageUrl = text(item.images).split("|").find((value) => /^https?:\/\//i.test(value)) ?? null;
      return {
        title,
        url: safeUrl(item.url, fallback),
        sourceId: source.id,
        sourceName: source.name,
        sourceGroup: source.group,
        region: source.region,
        topic: clean(item.tag, 40) || topicFor(title, excerpt),
        excerpt,
        author: product || "优设编辑部",
        imageUrl,
        publishedAt,
        archiveDate: shanghaiDate(new Date(publishedAt)),
      } satisfies Article;
    });
  }).filter((item) => item.title);
}

function fromAiGuide(source: NewsSource, html: string): Article[] {
  const items: Article[] = [];
  const pattern = /<li>\s*<i[^>]*icon-point[^>]*><\/i>\s*<a[^>]*class=["']text-sm["'][^>]*href=["']([^"']+)["'][^>]*><span>([\s\S]*?)<\/span><\/a>[\s\S]*?<div[^>]*class=["']d-flex flex-fill text-xs text-muted["'][^>]*>([\s\S]*?)<\/div>\s*<\/li>/gi;
  for (const match of html.matchAll(pattern)) {
    const title = clean(match[2], 220);
    const meta = match[3];
    const date = meta.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    const category = clean(meta.match(/<a[^>]*>([\s\S]*?)<\/a>/i)?.[1], 80) || "最新收录";
    if (!title || !date) continue;
    const publishedAt = shanghaiTimestamp(Number(date[1]), Number(date[2]), Number(date[3]));
    const excerpt = `${category} · AI 智库导航最新公开收录，点击原文查看工具、模型或资讯详情。`;
    items.push({
      title,
      url: safeUrl(match[1], source.siteUrl),
      sourceId: source.id,
      sourceName: source.name,
      sourceGroup: source.group,
      region: source.region,
      topic: topicFor(title, excerpt),
      excerpt,
      author: "AI 智库导航",
      imageUrl: null,
      publishedAt,
      archiveDate: shanghaiDate(new Date(publishedAt)),
    });
  }
  return items.slice(0, 20);
}

function fromAiHub(source: NewsSource, html: string): Article[] {
  const items: Article[] = [];
  const pattern = /<h2>\s*<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>\s*<\/h2>\s*<div[^>]*class=["']post-excerpt["'][^>]*>([\s\S]*?)<\/div>[\s\S]*?<time[^>]*datetime=["'](\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{2}:\d{2}:\d{2})["']/gi;
  for (const match of html.matchAll(pattern)) {
    const title = clean(match[2], 220);
    const excerpt = clean(match[3], 560);
    if (!title) continue;
    const publishedAt = shanghaiTimestamp(Number(match[4]), Number(match[5]), Number(match[6]), match[7]);
    items.push({
      title,
      url: safeUrl(match[1], source.siteUrl),
      sourceId: source.id,
      sourceName: source.name,
      sourceGroup: source.group,
      region: source.region,
      topic: topicFor(title, excerpt),
      excerpt,
      author: "AIHub 编辑部",
      imageUrl: null,
      publishedAt,
      archiveDate: shanghaiDate(new Date(publishedAt)),
    });
  }
  return items.slice(0, 24);
}

function fromHtml(source: NewsSource, html: string): Article[] {
  if (source.id === "uisdc-ai") return fromUisdc(source, html);
  if (source.id === "aiguide") return fromAiGuide(source, html);
  if (source.id === "aihub") return fromAiHub(source, html);
  return [];
}

async function fetchSource(source: NewsSource) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(source.feedUrl, {
      headers: { "user-agent": "AIPulse-Daily/2.1 (public AI news archival service)", accept: "application/rss+xml, application/atom+xml, application/json, text/html, text/xml;q=0.9, */*;q=0.5" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (source.method === "API") return { ok: true, articles: fromHackerNews(source, await response.json()) };
    const body = await response.text();
    if (source.method === "HTML") return { ok: true, articles: fromHtml(source, body) };
    return { ok: true, articles: fromXml(source, body) };
  } catch (error) {
    return { ok: false, articles: [] as Article[], error: error instanceof Error ? error.message : "fetch failed" };
  } finally {
    clearTimeout(timer);
  }
}

export async function ensureSchema() {
  const db = env.DB;
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, url TEXT NOT NULL,
      source_id TEXT NOT NULL, source_name TEXT NOT NULL, source_group TEXT NOT NULL,
      region TEXT NOT NULL, topic TEXT NOT NULL, excerpt TEXT NOT NULL DEFAULT '',
      author TEXT NOT NULL DEFAULT '', image_url TEXT, published_at TEXT NOT NULL,
      archive_date TEXT NOT NULL, captured_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_url_unique ON articles(url)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_articles_archive_date_published ON articles(archive_date, published_at)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_articles_source_id ON articles(source_id)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_articles_topic ON articles(topic)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS refresh_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT, archive_date TEXT NOT NULL, started_at TEXT NOT NULL,
      finished_at TEXT NOT NULL, source_total INTEGER NOT NULL, source_ok INTEGER NOT NULL,
      fetched INTEGER NOT NULL, inserted INTEGER NOT NULL
    )`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_refresh_runs_date ON refresh_runs(archive_date)`),
  ]);
}

export async function refreshAll() {
  await ensureSchema();
  const startedAt = new Date().toISOString();
  const results = await Promise.all(SOURCES.map(fetchSource));
  const articles = results.flatMap((result) => result.articles);
  let inserted = 0;
  const db = env.DB;

  for (let i = 0; i < articles.length; i += 40) {
    const statements = articles.slice(i, i + 40).map((article) => db.prepare(`
      INSERT OR IGNORE INTO articles
      (title, url, source_id, source_name, source_group, region, topic, excerpt, author, image_url, published_at, archive_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(article.title, article.url, article.sourceId, article.sourceName, article.sourceGroup, article.region, article.topic, article.excerpt, article.author, article.imageUrl, article.publishedAt, article.archiveDate));
    const batch = await db.batch(statements);
    inserted += batch.reduce((sum, item) => sum + Number(item.meta.changes ?? 0), 0);
  }

  const finishedAt = new Date().toISOString();
  const sourceOk = results.filter((result) => result.ok).length;
  await db.prepare(`INSERT INTO refresh_runs (archive_date, started_at, finished_at, source_total, source_ok, fetched, inserted) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .bind(shanghaiDate(), startedAt, finishedAt, SOURCES.length, sourceOk, articles.length, inserted).run();
  await db.prepare("PRAGMA optimize").run();

  return {
    date: shanghaiDate(), startedAt, finishedAt, sourceTotal: SOURCES.length, sourceOk,
    fetched: articles.length, inserted,
    failures: results.map((result, index) => result.ok ? null : ({ id: SOURCES[index].id, name: SOURCES[index].name, error: result.error })).filter(Boolean),
  };
}

export { shanghaiDate };

