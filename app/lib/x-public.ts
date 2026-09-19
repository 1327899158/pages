function snowflakeDate(postId: string) {
  try {
    const milliseconds = Number((BigInt(postId) >> 22n) + 1288834974657n);
    const date = new Date(milliseconds);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  } catch {
    return null;
  }
}

function cleanPublicPost(value: string) {
  const primary = value.split(/\s{3,}\[!\[Image/i)[0];
  return primary
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\bShow more\b/gi, " ")
    .replace(/\s+\d[\d.]*[KMB]?(?:\s+\d[\d.]*[KMB]?){3,5}\s*$/i, " ")
    .replace(/^\s*[*-]\s*/, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 4000);
}

export function parsePublicXProfile(markdown: string, username: string): Array<{ postId: string; text: string; createdAt: string; url: string }> {
  const escaped = username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const marker = new RegExp(`\\[([^\\]]+)\\]\\(https:\\/\\/(?:x|twitter)\\.com\\/${escaped}\\/status\\/(\\d+)\\)`, "gi");
  const matches = [...markdown.matchAll(marker)];
  const seen = new Set<string>();
  const posts: Array<{ postId: string; text: string; createdAt: string; url: string }> = [];

  for (let index = 0; index < matches.length && posts.length < 10; index += 1) {
    const postId = matches[index][2];
    if (seen.has(postId)) continue;
    seen.add(postId);
    const start = (matches[index].index ?? 0) + matches[index][0].length;
    const end = matches[index + 1]?.index ?? markdown.length;
    const postText = cleanPublicPost(markdown.slice(start, end));
    const createdAt = snowflakeDate(postId);
    if (!createdAt || !postText || /^Replying to\b/i.test(postText)) continue;
    posts.push({ postId, text: postText, createdAt, url: `https://x.com/${username}/status/${postId}` });
  }
  return posts;
}

