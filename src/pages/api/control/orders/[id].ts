import type { APIRoute } from "astro";
import { controlJson, isOrderStatus } from "../../../../lib/control";

export const prerender = false;

export const PATCH: APIRoute = async ({ request, locals, params }) => {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return controlJson({ ok: false, error: "Content-Type must be application/json." }, 415);
  }

  const id = Number(params.id);
  if (!Number.isSafeInteger(id) || id < 1) return controlJson({ ok: false, error: "Invalid order ID." }, 400);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return controlJson({ ok: false, error: "Invalid JSON." }, 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).length !== 1) {
    return controlJson({ ok: false, error: "Only status may be updated." }, 422);
  }
  const status = (body as Record<string, unknown>).status;
  if (!isOrderStatus(status)) return controlJson({ ok: false, error: "Invalid status." }, 422);

  const result = await locals.runtime.env.DB.prepare(
    "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
  ).bind(status, id).run();
  if (!result.meta.changes) return controlJson({ ok: false, error: "Order not found." }, 404);
  return controlJson({ ok: true, id, status });
};

export const ALL: APIRoute = () => controlJson({ ok: false, error: "Method not allowed." }, 405);
