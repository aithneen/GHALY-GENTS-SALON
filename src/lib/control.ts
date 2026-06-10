const allowedStatuses = ["new", "acknowledged", "completed", "cancelled"] as const;

export type OrderStatus = (typeof allowedStatuses)[number];
export const isOrderStatus = (value: unknown): value is OrderStatus =>
  typeof value === "string" && allowedStatuses.includes(value as OrderStatus);

export const getControlIdentity = (request: Request, allowedEmails?: string) => {
  const email = request.headers.get("cf-access-authenticated-user-email")?.trim().toLowerCase();
  if (!email) return null;
  const allowlist = allowedEmails
    ?.split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return !allowlist?.length || allowlist.includes(email) ? email : null;
};

export const controlJson = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
