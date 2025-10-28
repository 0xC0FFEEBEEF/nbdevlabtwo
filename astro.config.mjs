import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

const workerUrlLogger = {
  name: "github-worker-url-logger",
  hooks: {
    "astro:build:done": () => {
      const siteUrl = (process.env.CF_PAGES_URL ?? process.env.DEPLOY_URL ?? "https://www.nbdevlab.com").replace(/\/$/, "");
      const workerName = "nbdevlab";
      const workerUrl = `https://${workerName}.workers.dev`;
      console.log(`Cloudflare GitHub activity worker available at ${siteUrl}/api/github`);
      console.log(`Cloudflare Worker URL: ${workerUrl}`);
    },
  },
};

export default defineConfig({
  site: "https://www.nbdevlab.com",
  integrations: [react(), mdx(), sitemap(), workerUrlLogger],
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
});
