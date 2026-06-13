import type { APIRoute } from "astro";
import { runToolCheck } from "@lib/tool-checkers";

export const prerender = false;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

export const GET: APIRoute = async ({ params, request }) => {
  const tool = params.tool;
  const url = new URL(request.url);
  const target = url.searchParams.get("target") ?? "";

  if (!tool) return json({ ok: false, error: "Tool tidak ditemukan." }, 404);
  if (!target.trim()) return json({ ok: false, error: "Input wajib diisi." }, 400);

  try {
    const data = await runToolCheck(tool, {
      target,
      record: url.searchParams.get("record"),
      selector: url.searchParams.get("selector"),
      port: url.searchParams.get("port")
    });

    return json({ ok: true, data });
  } catch (error) {
    const status = error instanceof Error && "status" in error ? Number(error.status) : 500;
    return json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Terjadi error saat menjalankan tool."
      },
      Number.isInteger(status) ? status : 500
    );
  }
};
