import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { site } from "@data/site";
import { getPublishedPosts } from "@lib/content";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export const GET: APIRoute = async () => {
  const posts = getPublishedPosts(await getCollection("blog"));
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(site.title)}</title>
    <description>${escapeXml(site.description)}</description>
    <link>${site.url}</link>
    <language>id</language>
${posts
  .map((post) => {
    const link = new URL(`/blog/${post.data.slug}`, site.url).toString();
    return `    <item>
      <title>${escapeXml(post.data.title)}</title>
      <description>${escapeXml(post.data.description)}</description>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${post.data.publishedAt.toUTCString()}</pubDate>
      <author>${escapeXml(site.email)} (${escapeXml(post.data.author)})</author>
    </item>`;
  })
  .join("\n")}
  </channel>
</rss>`;

  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" }
  });
};
