import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";
import tailwindcss from "@tailwindcss/vite";
import { unified } from "@astrojs/markdown-remark";
import rehypeCallouts from "rehype-callouts";

export default defineConfig({
  site: "https://wildanisme.com",
  adapter: netlify(),
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport"
  },
  vite: {
    plugins: [tailwindcss()]
  },
  markdown: {
    processor: unified({
      rehypePlugins: [
        [
          rehypeCallouts,
          {
            theme: "obsidian",
            aliases: {
              warning: ["alert"]
            }
          }
        ]
      ]
    })
  },
  build: {
    format: "directory"
  }
});
