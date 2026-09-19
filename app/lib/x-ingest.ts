import { env } from "cloudflare:workers";
import { X_CREATORS, X_CREATOR_MAP } from "./x-creators";
import { parsePublicXProfile } from "./x-public";

type XApiPost = {
  id: string;
  text: string;
  author_id?: string;
  created_at?: string;
  lang?: string;
  public_metrics?: {
    like_count?: number;
    retweet_count?: number;
    reply_count?: number;
    quote_count?: number;
    impression_count?: number;
  };
};

type XApiUser = { id: string; name: string; username: string; profile_image_url?: string };

type NormalizedPost = {
  postId: string;
  authorUsername: string;
  authorName: string;
  creatorCategory: string;
  creatorTier: string;
  text: string;
  url: string;
  lang: string;
  createdAt: string;
  likeCount: number;
  repostCount: number;
  replyCount: number;
  quoteCount: number;
  impressionCount: number;
  engagementScore: number;
  profileImageUrl: string | null;
  captureSource: string;
  attributionUrl: string | null;
};

type AihotItem = {
  id?: string;
  title?: string | null;
  originalTitle?: string | null;
  summary?: string | null;
  source?: { name?: string | null };
  links?: { aihot?: string | null; original?: string | null };
  publishedAt?: string | null;
  discoveredAt?: string | null;
  attribution?: { name?: string | null; url?: string | null };
};

type AihotResponse = {
  items?: AihotItem[];
  page?: { hasMore?: boolean; nextCursor?: string | null };
};

const shanghaiDate = (date = new Date()) => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit",
}).format(date);

export async function ensureXSchema() {
  const db = env.DB;
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS x_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT, post_id TEXT NOT NULL, author_username TEXT NOT NULL,
      author_name TEXT NOT NULL, creator_category TEXT NOT NULL, creator_tier TEXT NOT NULL,
      text TEXT NOT NULL, url TEXT NOT NULL, lang TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL,
      archive_date TEXT NOT NULL, like_count INTEGER NOT NULL DEFAULT 0,
      repost_count INTEGER NOT NULL DEFAULT 0, reply_count INTEGER NOT NULL DEFAULT 0,
      quote_count INTEGER NOT NULL DEFAULT 0, impression_count INTEGER NOT NULL DEFAULT 0,
      engagement_score INTEGER NOT NULL DEFAULT 0, profile_image_url TEXT,
      capture_source TEXT NOT NULL DEFAULT 'X 官方 API', attribution_url TEXT,
      captured_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_x_posts_post_id_unique ON x_posts(post_id)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_x_posts_archive_score ON x_posts(archive_date, engagement_score)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_x_posts_author ON x_posts(author_username)"),
    db.prepare(`CREATE TABLE IF NOT EXISTS x_refresh_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT, archive_date TEXT NOT NULL, started_at TEXT NOT NULL,
      finished_at TEXT NOT NULL, creator_total INTEGER NOT NULL, query_total INTEGER NOT NULL,
      query_ok INTEGER NOT NULL, fetched INTEGER NOT NULL, inserted INTEGER NOT NULL, status TEXT NOT NULL
    )`),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_x_refresh_runs_date ON x_refresh_runs(archive_date)"),
  ]);
}

function startOfShanghaiDay(date = new Date()) {
  const dateString = shanghaiDate(date);
  return new Date(`${dateString}T00:00:00+08:00`).toISOString().replace(/\.000Z$/, "Z");
}

function buildQueries() {
  const batches: string[][] = [];
  let current: string[] = [];
  let length = 0;
  for (const creator of X_CREATORS) {
    const clause = `from:${creator.username}`;
    if (length + clause.length + 4 > 360 && current.length) {
      batches.push(current);
      current = [];
      length = 0;
    }
    current.push(clause);
    length += clause.length + 4;
  }
  if (current.length) batches.push(current);
  return batches.map((batch) => `(${batch.join(" OR ")}) -is:retweet -is:reply`);
}

function score(metrics: NonNullable<XApiPost["public_metrics"]> = {}) {
  return (metrics.like_count ?? 0) + (metrics.retweet_count ?? 0) * 3 +
    (metrics.quote_count ?? 0) * 4 + (metrics.reply_count ?? 0) * 2;
}

async function fetchBatch(query: string, token: string, startTime: string) {
  const params = new URLSearchParams({
    query,
    start_time: startTime,
    max_results: "100",
    "tweet.fields": "id,text,author_id,created_at,lang,public_metrics",
    expansions: "author_id",
    "user.fields": "id,name,username,profile_image_url,verified,public_metrics",
  });
  const response = await fetch(`https://api.x.com/2/tweets/search/recent?${params}`, {
    headers: { authorization: `Bearer ${token}`, "user-agent": "AIPulse-Daily/2.1" },
  });
  const body = await response.json() as { data?: XApiPost[]; includes?: { users?: XApiUser[] }; title?: string; detail?: string };
  if (!response.ok) throw new Error(body.detail || body.title || `X API HTTP ${response.status}`);
  return body;
}

async function fetchPublicProfile(creator: (typeof X_CREATORS)[number]) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 18_000);
  try {
    const response = await fetch(`https://r.jina.ai/https://x.com/${creator.username}`, {
      headers: { accept: "text/plain", "user-agent": "AIPulse-Daily/2.1" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`public reader HTTP ${response.status}`);
    const markdown = await response.text();
    if (/requiring captcha|performing security verification|attention required! \| cloudflare/i.test(markdown.slice(0, 5000))) {
      throw new Error("public reader challenge");
    }
    return parsePublicXProfile(markdown, creator.username).map((post) => ({
      ...post,
      authorUsername: creator.username,
      authorName: creator.name,
      creatorCategory: creator.category,
      creatorTier: creator.tier,
      lang: "",
      likeCount: 0,
      repostCount: 0,
      replyCount: 0,
      quoteCount: 0,
      impressionCount: 0,
      engagementScore: 0,
      profileImageUrl: null,
      captureSource: "X 公开主页",
      attributionUrl: `https://x.com/${creator.username}`,
    } satisfies NormalizedPost));
  } finally {
    clearTimeout(timer);
  }
}

async function persistPosts(posts: NormalizedPost[]) {
  let inserted = 0;
  for (let index = 0; index < posts.length; index += 40) {
    const statements = posts.slice(index, index + 40).map((post) => env.DB.prepare(`INSERT OR IGNORE INTO x_posts
      (post_id, author_username, author_name, creator_category, creator_tier, text, url, lang,
       created_at, archive_date, like_count, repost_count, reply_count, quote_count,
       impression_count, engagement_score, profile_image_url, capture_source, attribution_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(post.postId, post.authorUsername, post.authorName, post.creatorCategory, post.creatorTier,
        post.text, post.url, post.lang, post.createdAt, shanghaiDate(new Date(post.createdAt)),
        post.likeCount, post.repostCount, post.replyCount, post.quoteCount, post.impressionCount,
        post.engagementScore, post.profileImageUrl, post.captureSource, post.attributionUrl));
    const batch = await env.DB.batch(statements);
    inserted += batch.reduce((sum, item) => sum + Number(item.meta.changes ?? 0), 0);
  }
  return inserted;
}

async function saveRun(startedAt: string, queryTotal: number, queryOk: number, fetched: number, inserted: number, status: string) {
  const finishedAt = new Date().toISOString();
  const archiveDate = shanghaiDate();
  await env.DB.prepare(`INSERT INTO x_refresh_runs
    (archive_date, started_at, finished_at, creator_total, query_total, query_ok, fetched, inserted, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(archiveDate, startedAt, finishedAt, X_CREATORS.length, queryTotal, queryOk, fetched, inserted, status).run();
  return { date: archiveDate, finishedAt };
}

async function refreshWithOfficialApi(token: string, startedAt: string) {
  const queries = buildQueries();
  const results = await Promise.allSettled(queries.map((query) => fetchBatch(query, token, startOfShanghaiDay())));
  const queryOk = results.filter((result) => result.status === "fulfilled").length;
  const posts: NormalizedPost[] = [];

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    const users = new Map((result.value.includes?.users ?? []).map((user) => [user.id, user]));
    for (const post of result.value.data ?? []) {
      const user = users.get(post.author_id ?? "");
      const creator = user ? X_CREATOR_MAP.get(user.username.toLowerCase()) : null;
      if (!user || !creator) continue;
      const metrics = post.public_metrics ?? {};
      const createdAt = post.created_at || new Date().toISOString();
      posts.push({
        postId: post.id,
        authorUsername: user.username,
        authorName: user.name || creator.name,
        creatorCategory: creator.category,
        creatorTier: creator.tier,
        text: post.text.slice(0, 4000),
        url: `https://x.com/${user.username}/status/${post.id}`,
        lang: post.lang || "",
        createdAt,
        likeCount: metrics.like_count ?? 0,
        repostCount: metrics.retweet_count ?? 0,
        replyCount: metrics.reply_count ?? 0,
        quoteCount: metrics.quote_count ?? 0,
        impressionCount: metrics.impression_count ?? 0,
        engagementScore: score(metrics),
        profileImageUrl: user.profile_image_url ?? null,
        captureSource: "X 官方 API",
        attributionUrl: "https://developer.x.com/",
      });
    }
  }

  const inserted = await persistPosts(posts);
  const status = queryOk === queries.length ? "official_complete" : queryOk ? "official_partial" : "failed";
  const run = await saveRun(startedAt, queries.length, queryOk, posts.length, inserted, status);
  return { configured: true, mode: "official_api", status, creatorTotal: X_CREATORS.length, queryTotal: queries.length, queryOk, fetched: posts.length, inserted, ...run };
}

async function fetchAihotXPosts() {
  const posts: NormalizedPost[] = [];
  const coveredCreators = new Set<string>();
  let cursor = "";
  let pageCount = 0;

  while (pageCount < 5) {
    const params = new URLSearchParams({ mode: "all", window: "24h", by: "timeline", limit: "100" });
    if (cursor) params.set("cursor", cursor);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch(`https://aihot.virxact.com/api/v1/items?${params}`, {
        headers: {
          accept: "application/json",
          "user-agent": "AI-Pulse-Daily/2.2 (+https://ai-pulse-daily-cn.tanijkhan814.chatgpt.site)",
        },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`AIHOT API HTTP ${response.status}`);
      const body = await response.json() as AihotResponse;
      pageCount += 1;

      for (const item of body.items ?? []) {
        const originalUrl = item.links?.original?.trim() ?? "";
        const match = originalUrl.match(/^https?:\/\/(?:www\.)?(?:x|twitter)\.com\/([^/?#]+)\/status\/(\d+)/i);
        if (!match) continue;
        const username = match[1].toLowerCase();
        const creator = X_CREATOR_MAP.get(username);
        if (!creator) continue;
        const text = (item.originalTitle || item.summary || item.title || "").trim();
        const createdAt = item.publishedAt || item.discoveredAt;
        if (!text || !createdAt) continue;
        coveredCreators.add(username);
        posts.push({
          postId: match[2],
          authorUsername: creator.username,
          authorName: creator.name,
          creatorCategory: creator.category,
          creatorTier: creator.tier,
          text: text.slice(0, 4000),
          url: originalUrl,
          lang: "",
          createdAt,
          likeCount: 0,
          repostCount: 0,
          replyCount: 0,
          quoteCount: 0,
          impressionCount: 0,
          engagementScore: 0,
          profileImageUrl: null,
          captureSource: item.attribution?.name || "AIHOT 公开 API",
          attributionUrl: item.attribution?.url || item.links?.aihot || "https://aihot.virxact.com/",
        });
      }

      cursor = body.page?.nextCursor ?? "";
      if (!body.page?.hasMore || !cursor) break;
    } finally {
      clearTimeout(timer);
    }
  }

  return { posts, coveredCreators, pageCount };
}

async function refreshWithPublicSources(startedAt: string) {
  let aihotPosts: NormalizedPost[] = [];
  let coveredCreators = new Set<string>();
  let aihotOk = 0;
  try {
    const result = await fetchAihotXPosts();
    aihotPosts = result.posts;
    coveredCreators = result.coveredCreators;
    aihotOk = 1;
  } catch {
    aihotOk = 0;
  }

  const directCreators = X_CREATORS.filter((creator) => !coveredCreators.has(creator.username.toLowerCase()));
  const results = await Promise.allSettled(directCreators.map(fetchPublicProfile));
  const directOk = results.filter((result) => result.status === "fulfilled").length;
  const directPosts = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  const deduped = new Map([...aihotPosts, ...directPosts].map((post) => [post.postId, post]));
  const posts = [...deduped.values()];
  const queryOk = directOk + aihotOk;
  const queryTotal = directCreators.length + 1;
  const inserted = await persistPosts(posts);
  const status = queryOk === queryTotal ? "public_complete" : queryOk ? "public_partial" : "failed";
  const run = await saveRun(startedAt, queryTotal, queryOk, posts.length, inserted, status);
  return { configured: true, mode: "public_sources", status, creatorTotal: X_CREATORS.length, queryTotal, queryOk, fetched: posts.length, inserted, ...run };
}

export async function refreshXPosts() {
  await ensureXSchema();
  const startedAt = new Date().toISOString();
  const token = (env as unknown as { X_BEARER_TOKEN?: string }).X_BEARER_TOKEN?.trim();
  return token ? refreshWithOfficialApi(token, startedAt) : refreshWithPublicSources(startedAt);
}

export { shanghaiDate as xShanghaiDate };

