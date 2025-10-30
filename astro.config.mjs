import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

import netlify from "@astrojs/netlify";

export default defineConfig({
  site: "https://www.nbdevlab.com",
  integrations: [react(), mdx(), sitemap()],
  output: "static",

  vite: {
    plugins: [tailwindcss()],
    server: {
      // Allow Netlify Dev’s remote devserver host and any *.netlify.app
      // This unblocks proxied dev (e.g., devserver-main--nbdev2.netlify.app)
      allowedHosts: [
        'devserver-main--nbdev2.netlify.app',
        /\.netlify\.app$/,
      ],
    },
  },

  adapter: netlify(),
});
