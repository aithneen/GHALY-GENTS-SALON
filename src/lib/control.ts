const allowedStatuses = ["new", "acknowledged", "completed", "cancelled"] as const;

export type OrderStatus = (typeof allowedStatuses)[number];
export const isOrderStatus = (value: unknown): value is OrderStatus =>
  typeof value === "string" && allowedStatuses.includes(value as OrderStatus);

export const controlJson = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
