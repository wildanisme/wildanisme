import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import { unified } from "@astrojs/markdown-remark";
import rehypeCallouts from "rehype-callouts";

export default defineConfig({
  site: "https://wildanisme.com",
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
  integrations: [
    tailwind({
      applyBaseStyles: false
    })
  ],
  build: {
    format: "directory"
  }
});
