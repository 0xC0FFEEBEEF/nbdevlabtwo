// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import cloudflare from "@astrojs/cloudflare";

import tailwindcss from "@tailwindcss/vite";
//import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://www.nbdevlab.com",
  integrations: [mdx(), sitemap()],

  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),

  vite: {
    plugins: [tailwindcss()],
  },
});