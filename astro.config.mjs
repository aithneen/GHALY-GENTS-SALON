import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://ghalysalon.example",
  integrations: [icon()],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: cloudflare()
});