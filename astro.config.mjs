// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

import cloudflare from "@astrojs/cloudflare";

import tailwindcss from "@tailwindcss/vite";
//import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://www.nbdevlab.com",
  integrations: [react(), mdx(), sitemap()],

  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
    workerEntryPoint: {
      path: "./src/worker.ts",
    },
  }),

  vite: {
    plugins: [tailwindcss()],
  },
});