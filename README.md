# nbdevlab

A personal playground for Nathan Bullock to experiment with Astro, Cloudflare Workers, and a growing collection of homelab notes. The site documents projects, publishes long-form write ups, and tracks the state of the infrastructure that powers nbdevlab.com.

## Highlights
- **Living lab notebook** – project logs and field notes captured as Markdown content collections.
- **Status + telemetry** – lightweight dashboards surface uptime snapshots and current areas of focus.
- **Hand-crafted UI** – Tailwind CSS, shadcn/ui, and custom theming create a cohesive dark interface without starter template clutter.

## Tech Stack
- [Astro](https://astro.build/) for static-first site generation with islands of interactivity.
- [Cloudflare Workers](https://workers.cloudflare.com/) + [Wrangler](https://developers.cloudflare.com/workers/wrangler/) for edge deployment.
- [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/) for component styling.
- [Decap CMS](https://decapcms.org/) for authenticated content editing via GitHub OAuth.

## Local Development
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Start the dev server**
   ```bash
   npm run dev
   ```
   The site becomes available at the address printed in the terminal.
3. **Generate content types (optional)**
   ```bash
   npm run sync
   ```
   Syncs content collections defined in `src/content/config.ts`.

## Deployment
Deployments target Cloudflare Workers via `wrangler`. Build locally and publish with:
```bash
npm run build
npm run deploy
```

## License
This repository represents personal work. Please reach out before reusing significant portions of the design or content.
