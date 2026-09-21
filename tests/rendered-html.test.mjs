import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    DB: { prepare() { throw new Error("DB should not be accessed during shell render"); } },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the AI PULSE application shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /AI PULSE/);
  assert.match(html, /每日人工智能情报站/);
  assert.match(html, /今天的 AI 世界/);
  assert.match(html, /获取最新/);
  assert.match(html, /X 热议/);
  assert.match(html, /今天，AI 大V/);
  assert.match(html, /机器翻译仅供参考/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/);
});

