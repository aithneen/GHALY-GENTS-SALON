/// <reference types="astro/client" />

type D1Database = import("@cloudflare/workers-types").D1Database;

declare namespace App {
  interface Locals {
    runtime: {
      env: {
        DB: D1Database;
        TELEGRAM_BOT_TOKEN?: string;
        TELEGRAM_CHAT_ID?: string;
        CONTROL_DASHBOARD_URL?: string;
      };
      ctx: ExecutionContext;
    };
  }
}
