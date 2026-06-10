import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://ghaly.aithneen.workers.dev",
  output: "server",
  adapter: cloudflare({ imageService: "compile" }),
  integrations: [icon()],
  vite: {
    plugins: [tailwindcss()],
  },
});
