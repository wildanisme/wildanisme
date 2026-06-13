import type { APIRoute } from "astro";

export const GET: APIRoute = () => {
  const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="8" fill="#00B894"/>
  <rect x="6" y="6" width="52" height="52" rx="6" fill="none" stroke="#151A18" stroke-width="4"/>
  <path d="M16 20h8l5 20 6-20h6l6 20 5-20h7l-9 30h-8l-5-17-5 17h-8L16 20Z" fill="#151A18"/>
</svg>`;
  return new Response(favicon, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
};
