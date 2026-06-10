import type { ValidOrder } from "./orders";

type TelegramEnv = {
  DB: D1Database;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  CONTROL_DASHBOARD_URL?: string;
};

export const notifyTelegram = async (env: TelegramEnv, orderId: number, order: ValidOrder) => {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;
  const text = [
    `New Ghaly request #${orderId}`,
    "",
    `Package: ${order.packageCode}`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Services selected: ${order.selectedServiceIds.length}`,
    `Staff preference: ${order.staffPreference || "Any available staff"}`,
    "",
    `Open dashboard:`,
    env.CONTROL_DASHBOARD_URL || "https://ghaly.aithneen.workers.dev/control/orders",
  ].join("\n");

  try {
    const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text }),
    });
    if (!response.ok) throw new Error(`Telegram returned ${response.status}`);
    await env.DB.prepare(
      "UPDATE orders SET telegram_notified_at = CURRENT_TIMESTAMP, telegram_error = NULL WHERE id = ?",
    ).bind(orderId).run();
  } catch (error) {
    await env.DB.prepare("UPDATE orders SET telegram_error = ? WHERE id = ?")
      .bind(error instanceof Error ? error.message.slice(0, 500) : "Unknown Telegram error", orderId).run();
  }
};
