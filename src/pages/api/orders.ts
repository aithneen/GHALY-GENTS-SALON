import type { APIRoute } from "astro";
import { OrderValidationError, validateOrder } from "../../lib/orders";
import { notifyTelegram } from "../../lib/telegram";

export const prerender = false;

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

export const POST: APIRoute = async ({ request, locals }) => {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return json({ ok: false, error: "Cross-origin submission is not allowed." }, 403);
  }
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return json({ ok: false, error: "Content-Type must be application/json." }, 415);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 10_000) return json({ ok: false, error: "Request body is too large." }, 413);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Request body must contain valid JSON." }, 400);
  }

  try {
    const order = validateOrder(body);
    const result = await locals.runtime.env.DB.prepare(`
      INSERT INTO orders (
        customer_name, phone, package_code, selected_services_json,
        arrival_date, arrival_time, staff_preference, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      order.customerName,
      order.phone,
      order.packageCode,
      JSON.stringify(order.selectedServiceIds),
      order.arrivalDate,
      order.arrivalTime,
      order.staffPreference,
      order.notes,
    ).run();

    const orderId = Number(result.meta.last_row_id);
    locals.runtime.ctx.waitUntil(notifyTelegram(locals.runtime.env, orderId, order));
    return json({ ok: true, orderId }, 201);
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return json({ ok: false, error: "Order validation failed.", fields: error.fields }, 422);
    }
    console.error("Failed to save order", error);
    return json({ ok: false, error: "Unable to save order." }, 500);
  }
};

export const ALL: APIRoute = () =>
  json({ ok: false, error: "Method not allowed." }, 405);
