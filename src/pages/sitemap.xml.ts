import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { site } from "@data/site";
import { tools } from "@data/tools";

function url(path: string) {
  return new URL(path, site.url).toString();
}

export const GET: APIRoute = async () => {
  const projects = await getCollection("projects", ({ data }) => data.isPublished);
  const posts = await getCollection("blog", ({ data }) => data.isPublished);
  const clients = await getCollection("clients", ({ data }) => data.isPublished);
  const services = await getCollection("services", ({ data }) => data.isPublished);
  const staticRoutes = ["/", "/services", "/projects", "/projects/personal", "/clients", "/tools", "/blog", "/about", "/contact"];

  const routes = [
    ...staticRoutes,
    ...services.map((service) => `/services/${service.data.slug}`),
    ...projects.map((project) => `/projects/${project.data.slug}`),
    ...clients.map((client) => `/clients/${client.data.slug}`),
    ...tools.map((tool) => `/tools/${tool.slug}`),
    ...posts.map((post) => `/blog/${post.data.slug}`)
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((route) => `  <url><loc>${url(route)}</loc></url>`).join("\n")}
</urlset>`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" }
  });
};
