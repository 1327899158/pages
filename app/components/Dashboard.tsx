"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Article = {
  id: number; title: string; url: string; sourceId: string; sourceName: string;
  sourceGroup: string; region: string; topic: string; excerpt: string; author: string;
  imageUrl: string | null; publishedAt: string; archiveDate: string; capturedAt: string;
};
type ArchiveDate = { date: string; count: number };
type Source = { id: string; name: string; group: string; region: string; method: string; siteUrl: string; note: string };
type Watch = { name: string; type: string; reason: string; url: string };
type LastRun = { archiveDate: string; finishedAt: string; sourceTotal: number; sourceOk: number; fetched: number; inserted: number } | null;
type XPost = {
  id: number; postId: string; authorUsername: string; authorName: string;
  creatorCategory: string; creatorTier: string; text: string; url: string; lang: string;
  createdAt: string; archiveDate: string; likeCount: number; repostCount: number;
  replyCount: number; quoteCount: number; impressionCount: number; engagementScore: number;
  profileImageUrl: string | null; captureSource: string; attributionUrl: string | null; capturedAt: string;
};
type XCreator = { username: string; name: string; category: string; tier: string; focus: string; reason: string };
type XLastRun = { archiveDate: string; finishedAt: string; creatorTotal: number; queryTotal: number; queryOk: number; fetched: number; inserted: number; status: string } | null;
type TranslationItem = { id: string; text: string };

const GROUPS = ["全部", "官方动态", "中文媒体", "国际媒体", "研究论文", "开发者社区", "行业通讯"];
const TOPICS = ["全部", "模型动态", "产品应用", "前沿研究", "开源生态", "具身智能", "算力基建", "资本市场", "政策治理"];
const groupIcons: Record<string, string> = { 官方动态: "公", 中文媒体: "中", 国际媒体: "闻", 研究论文: "研", 开发者社区: "码", 行业通讯: "报" };
const X_CATEGORIES = ["全部", "研究领袖", "产业领袖", "AI 工程与产品", "高传播资讯"];

function chinaToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00+08:00`);
  return new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "short", timeZone: "Asia/Shanghai" }).format(parsed);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Shanghai" }).format(new Date(value));
}

function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  if (diff < 60_000) return "刚刚";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`;
  return formatTime(value);
}

function initials(name: string) {
  const compact = name.replace(/[^a-zA-Z\u4e00-\u9fff]/g, "");
  return /[\u4e00-\u9fff]/.test(compact) ? compact.slice(0, 2) : compact.slice(0, 2).toUpperCase();
}

function compactNumber(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}K`;
  return String(value || 0);
}

function isEnglishTitle(value: string) {
  const latin = (value.match(/[A-Za-z]/g) ?? []).length;
  const chinese = (value.match(/[\u3400-\u9fff]/g) ?? []).length;
  return latin >= 8 && latin > chinese * 2;
}

async function translateDirect(items: TranslationItem[]) {
  const settled = await Promise.allSettled(items.map(async (item) => {
    const params = new URLSearchParams({ q: item.text, langpair: "en|zh-CN" });
    const response = await fetch(`https://api.mymemory.translated.net/get?${params}`, { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(`translation ${response.status}`);
    const data = await response.json();
    const translated = typeof data?.responseData?.translatedText === "string" ? data.responseData.translatedText.trim() : "";
    if (!translated || Number(data?.responseStatus ?? 200) >= 400) throw new Error("empty translation");
    return { id: item.id, translated: translated.replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#39;/g, "'") };
  }));
  return settled.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
}

export default function Dashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [dates, setDates] = useState<ArchiveDate[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [watchlist, setWatchlist] = useState<Watch[]>([]);
  const [selectedDate, setSelectedDate] = useState(chinaToday());
  const [group, setGroup] = useState("全部");
  const [topic, setTopic] = useState("全部");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRun, setLastRun] = useState<LastRun>(null);
  const [preview, setPreview] = useState<Article | null>(null);
  const [panel, setPanel] = useState<"history" | "sources" | null>(null);
  const [toast, setToast] = useState("");
  const [xPosts, setXPosts] = useState<XPost[]>([]);
  const [xCreators, setXCreators] = useState<XCreator[]>([]);
  const [xMode, setXMode] = useState<"official_api" | "public_sources">("public_sources");
  const [xLoading, setXLoading] = useState(true);
  const [xRefreshing, setXRefreshing] = useState(false);
  const [xCategory, setXCategory] = useState("全部");
  const [xCreator, setXCreator] = useState("");
  const [xLastRun, setXLastRun] = useState<XLastRun>(null);
  const [titleTranslations, setTitleTranslations] = useState<Record<string, string>>({});
  const [translationsVisible, setTranslationsVisible] = useState(true);
  const [translating, setTranslating] = useState(false);

  const load = useCallback(async (date = selectedDate) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/articles?date=${encodeURIComponent(date)}&limit=500`, { cache: "no-store" });
      if (!response.ok) throw new Error("加载失败");
      const data = await response.json();
      setArticles(data.articles ?? []);
      setDates(data.dates ?? []);
      setLastRun(data.lastRun ?? null);
    } catch {
      setToast("资讯库暂时无法连接，请稍后重试");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const loadX = useCallback(async (date = selectedDate) => {
    setXLoading(true);
    try {
      const response = await fetch(`/api/x-posts?date=${encodeURIComponent(date)}`, { cache: "no-store" });
      if (!response.ok) throw new Error("X load failed");
      const data = await response.json();
      setXPosts(data.posts ?? []);
      setXCreators(data.creators ?? []);
      setXMode(data.mode === "official_api" ? "official_api" : "public_sources");
      setXLastRun(data.lastRun ?? null);
    } catch {
      setToast("X 专区暂时无法连接，主资讯库不受影响");
    } finally {
      setXLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => { load(selectedDate); }, [selectedDate, load]);
  useEffect(() => { loadX(selectedDate); }, [selectedDate, loadX]);
  useEffect(() => {
    fetch("/api/sources").then((r) => r.json()).then((data) => { setSources(data.sources ?? []); setWatchlist(data.watchlist ?? []); });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3600);
    return () => clearTimeout(timer);
  }, [toast]);

  const filtered = useMemo(() => articles.filter((item) => {
    const groupOk = group === "全部" || item.sourceGroup === group;
    const topicOk = topic === "全部" || item.topic === topic;
    const q = query.trim().toLowerCase();
    const queryOk = !q || `${item.title} ${item.excerpt} ${item.sourceName}`.toLowerCase().includes(q);
    return groupOk && topicOk && queryOk;
  }), [articles, group, topic, query]);

  const stats = useMemo(() => {
    const sourceCount = new Set(articles.map((item) => item.sourceId)).size;
    const cn = articles.filter((item) => item.region === "中国").length;
    const paper = articles.filter((item) => item.sourceGroup === "研究论文").length;
    return { sourceCount, cn, global: articles.length - cn, paper };
  }, [articles]);

  const englishTitles = useMemo(() => filtered.filter((article) => isEnglishTitle(article.title)), [filtered]);
  const translatedTitleCount = useMemo(() => englishTitles.filter((article) => titleTranslations[article.url]).length, [englishTitles, titleTranslations]);
  const untranslatedTitleCount = englishTitles.length - translatedTitleCount;

  const filteredXPosts = useMemo(() => xPosts.filter((post) => {
    const categoryOk = xCategory === "全部" || post.creatorCategory === xCategory;
    const creatorOk = !xCreator || post.authorUsername.toLowerCase() === xCreator.toLowerCase();
    return categoryOk && creatorOk;
  }), [xPosts, xCategory, xCreator]);

  const activeXCreators = useMemo(() => new Set(xPosts.map((post) => post.authorUsername.toLowerCase())).size, [xPosts]);

  const refresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    setToast("正在并行获取全部公开来源…");
    try {
      const response = await fetch("/api/articles", { method: "POST" });
      if (!response.ok) throw new Error("refresh failed");
      const data = await response.json();
      const summary = data.summary;
      setSelectedDate(summary.date);
      await load(summary.date);
      setToast(`获取完成：${summary.sourceOk}/${summary.sourceTotal} 个来源成功，新存档 ${summary.inserted} 条`);
    } catch {
      setToast("获取遇到问题：已保留历史数据，请稍后重试");
    } finally {
      setRefreshing(false);
    }
  };

  const refreshX = async () => {
    if (xRefreshing) return;
    setXRefreshing(true);
    setToast(xMode === "official_api" ? "正在通过 X 官方 API 获取观察池今日发言…" : "正在从 X 公开主页与合规公开聚合源建立今日快照…");
    try {
      const response = await fetch("/api/x-posts", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error("X refresh failed");
      await loadX(data.summary.date);
      const modeLabel = data.summary.mode === "official_api" ? "官方 API" : "公开来源组合";
      setToast(`X 获取完成：${modeLabel} ${data.summary.queryOk}/${data.summary.queryTotal} 个请求成功，发现 ${data.summary.fetched} 条，新存档 ${data.summary.inserted} 条`);
    } catch {
      setToast("X 获取失败，历史快照已保留，请稍后重试");
    } finally {
      setXRefreshing(false);
    }
  };

  const translateEnglishTitles = async () => {
    if (translating || !englishTitles.length) return;
    if (!untranslatedTitleCount) {
      setTranslationsVisible((visible) => !visible);
      return;
    }

    const batch = englishTitles.filter((article) => !titleTranslations[article.url]).slice(0, 12)
      .map((article) => ({ id: article.url, text: article.title.slice(0, 240) }));
    setTranslating(true);
    setTranslationsVisible(true);
    try {
      let results: Array<{ id: string; translated: string }> = [];
      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ items: batch }),
        });
        if (!response.ok) throw new Error("translation proxy unavailable");
        const data = await response.json();
        results = (data.results ?? []).filter((item: { id?: unknown; translated?: unknown; ok?: unknown }) => item.ok && typeof item.id === "string" && typeof item.translated === "string");
        const translatedIds = new Set(results.map((item) => item.id));
        const missing = batch.filter((item) => !translatedIds.has(item.id));
        if (missing.length) results = [...results, ...await translateDirect(missing)];
      } catch {
        results = await translateDirect(batch);
      }

      if (!results.length) throw new Error("no translations");
      setTitleTranslations((current) => Object.fromEntries([
        ...Object.entries(current),
        ...results.map((item) => [item.id, item.translated]),
      ]));
      const failed = batch.length - results.length;
      setToast(failed ? `已翻译 ${results.length} 条，另有 ${failed} 条暂时失败；可稍后继续` : `已翻译 ${results.length} 条英文标题，机器翻译仅供参考`);
    } catch {
      setToast("翻译服务暂时繁忙，英文原题不受影响，请稍后再试");
    } finally {
      setTranslating(false);
    }
  };

  const changeDate = (date: string) => {
    setSelectedDate(date);
    setPanel(null);
    setGroup("全部"); setTopic("全部"); setQuery("");
    setXCategory("全部"); setXCreator("");
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="AI Pulse 首页">
          <span className="brand-mark"><i /><i /><i /><i /></span>
          <span><b>AI PULSE</b><small>每日人工智能情报站</small></span>
        </a>
        <nav className="topnav" aria-label="主要导航">
          <a className="active" href="#feed">今日简报</a>
          <a href="#x-zone">X 热议</a>
          <button onClick={() => setPanel(panel === "history" ? null : "history")}>历史归档</button>
          <button onClick={() => setPanel(panel === "sources" ? null : "sources")}>来源雷达</button>
        </nav>
        <div className="header-actions">
          <label className="searchbox"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索标题、来源或关键词" aria-label="搜索资讯" /></label>
          <button className="refresh-button" onClick={refresh} disabled={refreshing}>
            <span className={refreshing ? "spin" : ""}>↻</span>{refreshing ? "获取中…" : "获取最新"}
          </button>
        </div>
      </header>

      {panel === "history" && (
        <section className="drawer" aria-label="历史归档">
          <div className="drawer-head"><div><span className="eyebrow">ARCHIVE</span><h2>每日资讯档案</h2></div><button onClick={() => setPanel(null)}>关闭 ×</button></div>
          <div className="date-grid">
            {dates.length ? dates.map((item) => <button key={item.date} className={selectedDate === item.date ? "selected" : ""} onClick={() => changeDate(item.date)}><b>{formatDate(item.date)}</b><span>{item.count} 条存档</span></button>) : <p>首次点击“获取最新”后，每日档案会出现在这里。</p>}
          </div>
        </section>
      )}

      {panel === "sources" && (
        <section className="drawer source-drawer" aria-label="来源雷达">
          <div className="drawer-head"><div><span className="eyebrow">SOURCE RADAR</span><h2>来源雷达 · {sources.length + watchlist.length} 个渠道</h2></div><button onClick={() => setPanel(null)}>关闭 ×</button></div>
          <p className="drawer-intro">公开 RSS、Atom 与 API 可一键抓取；需登录、授权或付费的平台明确标注接入方式，不绕过验证码、登录和付费墙。</p>
          <div className="source-grid">
            {sources.map((source) => <a key={source.id} href={source.siteUrl} target="_blank" rel="noreferrer"><span className="source-avatar">{initials(source.name)}</span><span><b>{source.name}</b><small>{source.group} · {source.method}</small><em>{source.note}</em></span><i className="status live">自动</i></a>)}
            {watchlist.map((source) => <a key={source.name} href={source.url} target="_blank" rel="noreferrer"><span className="source-avatar muted">{initials(source.name)}</span><span><b>{source.name}</b><small>{source.type}</small><em>{source.reason}</em></span><i className="status auth">需接入</i></a>)}
          </div>
        </section>
      )}

      <section id="top" className="hero">
        <div className="hero-copy">
          <span className="dateline"><i /> {selectedDate === chinaToday() ? "LIVE INTELLIGENCE" : "HISTORICAL SNAPSHOT"} · {formatDate(selectedDate)}</span>
          <h1>{selectedDate === chinaToday() ? <>今天的 AI 世界，<br /><em>一页读懂。</em></> : <>{formatDate(selectedDate)}，<br /><em>资讯快照。</em></>}</h1>
          <p>聚合全球实验室、科技媒体、论文社区、开发者动态与行业通讯。每次获取都会去重并永久写入当日档案。</p>
          <div className="hero-actions">
            <button className="primary-cta" onClick={refresh} disabled={refreshing}>{refreshing ? "正在获取全部来源" : "立即获取今日资讯"}<span>→</span></button>
            <button className="secondary-cta" onClick={() => setPanel("sources")}>查看全部来源 <span>↗</span></button>
          </div>
          {lastRun && <div className="last-run"><i /> 最近更新 {formatTime(lastRun.finishedAt)} · {lastRun.sourceOk}/{lastRun.sourceTotal} 来源响应 · 本次发现 {lastRun.fetched} 条</div>}
        </div>
        <aside className="brief-card">
          <div className="brief-card-top"><span>DAILY SIGNAL</span><b>{String(new Date(`${selectedDate}T00:00:00+08:00`).getDate()).padStart(2, "0")}</b></div>
          <div className="signal-visual"><span /><span /><span /><span /><span /><span /><div>AI</div></div>
          <div className="brief-metrics">
            <div><b>{articles.length || "—"}</b><span>条资讯</span></div>
            <div><b>{stats.sourceCount || "—"}</b><span>来源入选</span></div>
            <div><b>{stats.paper || "—"}</b><span>研究论文</span></div>
          </div>
          <p>公开信号持续采集<br />历史档案自动保存</p>
        </aside>
      </section>

      <section className="ticker" aria-label="覆盖信息">
        <span>覆盖网络</span><div><b>{sources.length}</b> 自动来源</div><i /><div><b>{watchlist.length}</b> 授权/监测渠道</div><i /><div><b>{stats.cn}</b> 中文资讯</div><i /><div><b>{stats.global}</b> 国际资讯</div><i /><div>每日永久归档</div>
      </section>

      <section id="x-zone" className="x-zone">
        <div className="x-zone-head">
          <div>
            <span className="x-kicker"><i>𝕏</i> CREATOR INTELLIGENCE</span>
            <h2>今天，AI 大V<br /><em>在说什么？</em></h2>
            <p>跟踪 {xCreators.length || 38} 位研究领袖、产业掌舵者、AI 工程创作者与高传播资讯账号。默认组合 X 公开主页与注明出处的公开聚合数据，配置官方 API 后自动切换高可靠模式；发言按北京时间归档，重要结论应回到原帖复核。</p>
          </div>
          <div className="x-zone-summary">
            <div><b>{xPosts.length}</b><span>今日发言</span></div>
            <div><b>{activeXCreators}</b><span>今日活跃</span></div>
            <div><b>{xCreators.length || 38}</b><span>观察账号</span></div>
            <button onClick={refreshX} disabled={xRefreshing}><span className={xRefreshing ? "spin" : ""}>↻</span>{xRefreshing ? "获取中…" : "获取 X 最新发言"}</button>
          </div>
        </div>

        <div className="x-filterbar">
          <div className="x-category-tabs">{X_CATEGORIES.map((item) => <button key={item} className={xCategory === item ? "active" : ""} onClick={() => { setXCategory(item); setXCreator(""); }}>{item}</button>)}</div>
          <label><span>@</span><select value={xCreator} onChange={(event) => setXCreator(event.target.value)} aria-label="按 X 博主筛选"><option value="">全部观察账号</option>{xCreators.filter((creator) => xCategory === "全部" || creator.category === xCategory).map((creator) => <option value={creator.username} key={creator.username}>{creator.name} (@{creator.username})</option>)}</select></label>
        </div>

        {xLoading ? <div className="x-loading"><span /><span /><span />正在打开 X 每日档案…</div> : filteredXPosts.length ? (
          <div className="x-post-grid">
            {filteredXPosts.map((post, index) => (
              <article className="x-post-card" key={post.postId}>
                <div className="x-card-rank">{String(index + 1).padStart(2, "0")}</div>
                <div className="x-author">
                  {post.profileImageUrl ? <img src={post.profileImageUrl} alt="" referrerPolicy="no-referrer" /> : <i>{initials(post.authorName)}</i>}
                  <div><b>{post.authorName}</b><a href={`https://x.com/${post.authorUsername}`} target="_blank" rel="noreferrer">@{post.authorUsername}</a></div>
                  <span className={post.creatorTier === "核心观察" ? "core" : "signal"}>{post.creatorTier}</span>
                </div>
                <p className="x-post-text">{post.text}</p>
                <div className="x-post-meta"><span>{post.creatorCategory}</span><span>{formatTime(post.createdAt)}</span>{post.attributionUrl ? <a href={post.attributionUrl} target="_blank" rel="noreferrer">来源：{post.captureSource}</a> : <span>来源：{post.captureSource}</span>}</div>
                <div className="x-metrics"><span>♥ <b>{compactNumber(post.likeCount)}</b></span><span>↻ <b>{compactNumber(post.repostCount)}</b></span><span>◌ <b>{compactNumber(post.replyCount)}</b></span>{post.impressionCount > 0 && <span>◉ <b>{compactNumber(post.impressionCount)}</b></span>}</div>
                <a className="x-original" href={post.url} target="_blank" rel="noreferrer">查看原帖 <span>↗</span></a>
              </article>
            ))}
          </div>
        ) : (
          <div className="x-empty">
            <div className="x-empty-mark">𝕏</div>
            <div><b>{formatDate(selectedDate)} 暂无已采集发言</b><p>{xMode === "official_api" ? "这些账号当天可能尚未发布原创帖，也可以点击获取再次检查。" : "公开来源可能受缓存、限流或页面变化影响；平台不会绕过登录或保存账户 Cookie，可点击再次检查。"}</p></div>
            <button onClick={refreshX}>重新获取</button>
          </div>
        )}

        <div className="x-watchlist">
          <div className="x-watchlist-head"><span>CREATOR WATCHLIST</span><b>{xCreators.length || 38} 位博主观察池</b><p>“爆火”不是单一粉丝榜：综合行业身份、原创质量、议题影响力与持续活跃度。</p></div>
          <div className="x-creator-strip">{xCreators.slice(0, 18).map((creator) => <a key={creator.username} href={`https://x.com/${creator.username}`} target="_blank" rel="noreferrer"><i>{initials(creator.name)}</i><span><b>{creator.name}</b><small>@{creator.username} · {creator.focus}</small></span></a>)}</div>
        </div>
        {xLastRun && <div className="x-last-run">最近检查 {formatTime(xLastRun.finishedAt)} · {xLastRun.queryOk}/{xLastRun.queryTotal} 请求响应 · {xMode === "official_api" ? "官方 API" : "公开来源组合"} · 状态 {xLastRun.status}</div>}
      </section>

      <section id="feed" className="content-layout">
        <aside className="filter-rail">
          <div className="filter-block"><span className="filter-title">信息频道</span>{GROUPS.map((item) => <button key={item} className={group === item ? "active" : ""} onClick={() => setGroup(item)}><span>{item === "全部" ? "综" : groupIcons[item]}</span>{item}<i>{item === "全部" ? articles.length : articles.filter((a) => a.sourceGroup === item).length}</i></button>)}</div>
          <div className="filter-block"><span className="filter-title">主题标签</span><div className="topic-tags">{TOPICS.map((item) => <button key={item} className={topic === item ? "active" : ""} onClick={() => setTopic(item)}>{item}</button>)}</div></div>
          <div className="ethics-note"><b>采集边界</b><p>尊重 robots.txt、登录、付费墙与版权。快照仅保存标题、摘要和元数据，阅读全文始终跳转原站。</p><button onClick={() => setPanel("sources")}>查看接入说明 →</button></div>
        </aside>

        <div className="feed-column">
          <div className="section-heading">
            <div><span className="eyebrow">INTELLIGENCE FEED</span><h2>{group === "全部" ? "全域资讯流" : group}</h2></div>
            <div className="heading-tools">
              <button className="translate-toggle" onClick={translateEnglishTitles} disabled={translating || !englishTitles.length} title="仅翻译当前筛选结果中的英文标题；机器翻译仅供参考">
                <span>译</span>{translating ? "正在翻译…" : !englishTitles.length ? "暂无英文标题" : !untranslatedTitleCount ? (translationsVisible ? "隐藏中文翻译" : "显示中文翻译") : translatedTitleCount ? `继续翻译（剩 ${untranslatedTitleCount}）` : "翻译英文标题"}
              </button>
              <div className="results-count"><b>{filtered.length}</b> 条结果 <span /> 按时间排序</div>
            </div>
          </div>

          {loading ? <div className="loading-state"><span /><span /><span /><p>正在打开资讯档案…</p></div> : filtered.length === 0 ? (
            <div className="empty-state"><b>这里还没有资讯</b><p>{articles.length ? "试试清除筛选条件。" : selectedDate === chinaToday() ? "点击“获取最新”，从全部公开来源建立今天的首份档案。" : "这一天尚未建立存档。"}</p>{!articles.length && selectedDate === chinaToday() && <button onClick={refresh}>获取今日资讯</button>}</div>
          ) : (
            <div className="article-list">
              {filtered.map((article, index) => (
                <article className="article-card" key={`${article.id}-${article.url}`}>
                  <button className="article-main" onClick={() => setPreview(article)} aria-label={`预览 ${article.title}`}>
                    <div className="article-index">{String(index + 1).padStart(2, "0")}</div>
                    <div className="article-body">
                      <div className="article-meta"><span className="publisher"><i>{initials(article.sourceName)}</i>{article.sourceName}</span><span>{article.sourceGroup}</span><span>{relativeTime(article.publishedAt)}</span></div>
                      <h3>{article.title}</h3>
                      {translationsVisible && titleTranslations[article.url] && <p className="article-translation"><span>中译</span>{titleTranslations[article.url]}</p>}
                      <p>{article.excerpt || "该来源未提供摘要，点击查看标题与采集快照。"}</p>
                      <div className="article-footer"><span className="topic-pill">{article.topic}</span>{article.author && <span>作者 {article.author}</span>}<span>快照 {formatTime(article.capturedAt)}</span></div>
                    </div>
                  </button>
                  <div className="card-actions"><button onClick={() => setPreview(article)}>预览快照</button><a href={article.url} target="_blank" rel="noreferrer">原文 ↗</a></div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer>
        <div className="footer-brand"><b>AI PULSE</b><span>把分散的 AI 信号，变成可追溯的每日情报。</span></div>
        <div><span>数据策略</span><b>RSS / Atom / Public API / Public HTML / Source Link</b></div>
        <div><span>时区</span><b>Asia / Shanghai</b></div>
      </footer>

      {preview && (
        <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setPreview(null); }} role="presentation">
          <section className="snapshot-modal" role="dialog" aria-modal="true" aria-label="资讯快照">
            <button className="modal-close" onClick={() => setPreview(null)} aria-label="关闭">×</button>
            <div className="snapshot-stamp"><span>CAPTURED SNAPSHOT</span><b>{preview.archiveDate}</b></div>
            <div className="snapshot-source"><i>{initials(preview.sourceName)}</i><div><b>{preview.sourceName}</b><span>{preview.sourceGroup} · {preview.region} · {formatTime(preview.publishedAt)}</span></div></div>
            <h2>{preview.title}</h2>
            {translationsVisible && titleTranslations[preview.url] && <p className="snapshot-translation"><span>中文机器翻译</span>{titleTranslations[preview.url]}</p>}
            <p className="snapshot-excerpt">{preview.excerpt || "该来源没有在公开 Feed 中提供摘要。"}</p>
            <div className="snapshot-details"><div><span>主题</span><b>{preview.topic}</b></div><div><span>作者</span><b>{preview.author || "来源未注明"}</b></div><div><span>存档时间</span><b>{formatTime(preview.capturedAt)}</b></div></div>
            <div className="snapshot-notice"><b>快照说明</b><p>本页保存的是抓取当时的公开标题、摘要与元数据，用于历史检索和信息溯源。文章版权归原作者及来源网站所有。</p></div>
            <div className="snapshot-actions"><button onClick={() => setPreview(null)}>返回资讯流</button><a href={preview.url} target="_blank" rel="noreferrer">前往原文阅读 <span>↗</span></a></div>
          </section>
        </div>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}

