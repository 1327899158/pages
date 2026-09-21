import { corsJson, corsOptions } from "../../lib/cors";

export const dynamic = "force-dynamic";

const MAX_ITEMS = 12;
const MAX_ITEM_LENGTH = 240;
const MAX_TOTAL_LENGTH = 1800;

type TranslationItem = { id: string; text: string };

function decodeEntities(value: string) {
  const named: Record<string, string> = { "&amp;": "&", "&quot;": "\"", "&#39;": "'", "&lt;": "<", "&gt;": ">" };
  return value.replace(/&(amp|quot|#39|lt|gt);/g, (entity) => named[entity] ?? entity)
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

async function translate(item: TranslationItem) {
  try {
    const params = new URLSearchParams({ q: item.text, langpair: "en|zh-CN" });
    const response = await fetch(`https://api.mymemory.translated.net/get?${params}`, {
      headers: { accept: "application/json", "user-agent": "AI-Pulse/1.0 (public news title translation)" },
      signal: AbortSignal.timeout(9_000),
    });
    if (!response.ok) throw new Error(`upstream ${response.status}`);
    const data = await response.json() as { responseData?: { translatedText?: unknown }; responseStatus?: number | string; responseDetails?: unknown };
    const translated = typeof data.responseData?.translatedText === "string" ? decodeEntities(data.responseData.translatedText.trim()) : "";
    if (!translated || Number(data.responseStatus ?? 200) >= 400) throw new Error(String(data.responseDetails || "empty translation"));
    return { id: item.id, translated, ok: true };
  } catch {
    return { id: item.id, translated: "", ok: false };
  }
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return corsJson(request, { error: "请求内容必须是 JSON" }, { status: 400 });
  }

  const rawItems = Array.isArray((payload as { items?: unknown })?.items) ? (payload as { items: unknown[] }).items : [];
  const items = rawItems.slice(0, MAX_ITEMS).flatMap((value): TranslationItem[] => {
    if (!value || typeof value !== "object") return [];
    const id = typeof (value as { id?: unknown }).id === "string" ? (value as { id: string }).id.trim() : "";
    const text = typeof (value as { text?: unknown }).text === "string" ? (value as { text: string }).text.trim().slice(0, MAX_ITEM_LENGTH) : "";
    return id && text ? [{ id: id.slice(0, 500), text }] : [];
  });
  const totalLength = items.reduce((sum, item) => sum + item.text.length, 0);
  if (!items.length || totalLength > MAX_TOTAL_LENGTH) {
    return corsJson(request, { error: "每次可翻译 1–12 个标题，总长度不超过 1800 字符" }, { status: 400 });
  }

  const results = await Promise.all(items.map(translate));
  return corsJson(request, {
    results,
    translated: results.filter((item) => item.ok).length,
    failed: results.filter((item) => !item.ok).length,
    provider: "MyMemory",
  });
}

export async function OPTIONS(request: Request) { return corsOptions(request); }

