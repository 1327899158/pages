const GITHUB_PAGES_ORIGIN = "https://1327899158.github.io";

export function githubPagesCors(request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  if (origin !== GITHUB_PAGES_ORIGIN) return {};
  return {
    "access-control-allow-origin": GITHUB_PAGES_ORIGIN,
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    "vary": "Origin",
  };
}

export function corsJson(request: Request, body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  for (const [key, value] of Object.entries(githubPagesCors(request))) headers.set(key, value);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), { ...init, headers });
}

export function corsOptions(request: Request) {
  return new Response(null, { status: 204, headers: githubPagesCors(request) });
}

