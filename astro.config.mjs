import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import { unified } from "@astrojs/markdown-remark";
import remarkCallouts from "./src/lib/remark-callouts.mjs";


export default defineConfig({
  site: "https://wildanisme.com",
  markdown: {
    processor: unified({
      remarkPlugins: [remarkCallouts]
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
