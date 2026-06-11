import type { APIRoute } from "astro";
import { controlJson, isOrderStatus } from "../../../lib/control";

export const prerender = false;

export const GET: APIRoute = async ({ locals, url }) => {
  const status = url.searchParams.get("status");
  const date = url.searchParams.get("date");
  const source = url.searchParams.get("source");
  if (status && !isOrderStatus(status)) return controlJson({ ok: false, error: "Invalid status." }, 400);
  if (date && date !== "today") return controlJson({ ok: false, error: "Invalid date filter." }, 400);
  if (source && source !== "home" && source !== "in_salon") return controlJson({ ok: false, error: "Invalid source." }, 400);

  const conditions: string[] = [];
  const bindings: string[] = [];
  if (status) {
    conditions.push("status = ?");
    bindings.push(status);
  }
  if (date === "today") conditions.push("arrival_date = date('now', '+4 hours')");
  if (source) {
    conditions.push("order_source = ?");
    bindings.push(source);
  }

  const query = `
    SELECT id, created_at, updated_at, order_source, customer_name, phone, package_code,
      selected_services_json, arrival_date, arrival_time, staff_preference, notes, status
    FROM orders
    ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
    ORDER BY created_at DESC
    LIMIT 200
  `;
  const result = await locals.runtime.env.DB.prepare(query).bind(...bindings).all();
  const orders = result.results.map((row) => ({
    ...row,
    selectedServiceIds: JSON.parse(String(row.selected_services_json)),
    selected_services_json: undefined,
  }));
  return controlJson({ ok: true, orders });
};

export const ALL: APIRoute = () => controlJson({ ok: false, error: "Method not allowed." }, 405);
