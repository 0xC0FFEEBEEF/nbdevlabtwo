# nbdevlab

nbdevlab is Nathan Bullock's living lab notebook for experiments across Astro, Cloudflare Pages, and a growing catalogue of homelab projects. The site documents active builds, publishes deep-dive write ups, and tracks the infrastructure that powers nbdevlab.com.

## Highlights
- **Living lab notebook** – project logs and field notes captured as Markdown content collections.
- **Status + telemetry** – lightweight dashboards surface uptime snapshots and current areas of focus.
- **Hand-crafted UI** – Tailwind CSS, shadcn/ui, and custom theming create a cohesive dark interface without starter template clutter.

## Tech Stack
- [Astro](https://astro.build/) for static-first site generation with islands of interactivity.
- [Cloudflare Pages](https://pages.cloudflare.com/) for globally distributed static hosting.
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
Cloudflare Pages handles all deployments. Configure the project with:

- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Deploy command (production & preview)**: leave blank so Pages automatically uploads `dist/`

Every non-`main` branch build produces a Preview URL. The `main` branch is the only branch mapped to `https://www.nbdevlab.com` and `https://nbdevlab.com`.

## License
This repository represents personal work. Please reach out before reusing significant portions of the design or content.
