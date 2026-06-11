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
    SELECT o.id, o.created_at, o.updated_at, o.order_source, o.customer_name, o.phone, o.package_code,
      o.selected_services_json, o.arrival_date, o.arrival_time, o.staff_preference, o.notes, o.status,
      CASE WHEN o.order_source = 'in_salon' AND o.status IN ('new', 'acknowledged') THEN (
        SELECT COUNT(*) FROM orders q
        WHERE q.order_source = 'in_salon'
          AND q.status IN ('new', 'acknowledged')
          AND (q.created_at < o.created_at OR (q.created_at = o.created_at AND q.id <= o.id))
      ) ELSE NULL END AS queue_position
    FROM orders o
    ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
    ORDER BY o.created_at DESC
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
