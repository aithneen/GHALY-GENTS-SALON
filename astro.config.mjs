import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import cloudflare from "@astrojs/cloudflare";
import svelte from "@astrojs/svelte";

export default defineConfig({
  site: "https://ghaly.aithneen.workers.dev",
  output: "server",
  adapter: cloudflare({ imageService: "compile" }),
  integrations: [
    svelte(),
    icon({
      include: {
        solar: ["crown-star-bold", "scissors-square-bold", "close-circle-linear", "check-circle-bold", "file-download-bold", "refresh-bold", "phone-calling-bold", "menu-dots-bold", "copy-bold", "clipboard-text-bold", "waterdrop-bold", "user-circle-bold"],
        mdi: ["whatsapp"],
        hugeicons: ["bathtub-02", "body-soap", "hair-dryer", "nose", "ear", "thread", "towels", "shoulder", "shampoo"],
        mingcute: ["bath-line", "flame-line", "snowflake-line", "hand-line", "foot-line", "steam-line"],
        "icon-park-outline": ["facial-mask", "facial-cleanser", "nail-polish"],
        "lucide-lab": ["scissors-hair-comb"],
        "material-symbols": ["massage-outline", "footprint-outline", "barefoot-outline"],
        "game-icons": ["beard"],
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
