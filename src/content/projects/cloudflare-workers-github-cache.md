---
title: "Cloudflare Workers GitHub Cache"
slug: cloudflare-workers-github-cache
date: "2025-09-07"
status: "published"
tags:
  - observability
  - integrations
  - automation
problem: "GitHub's rate limits throttled our dashboards whenever teammates refreshed activity feeds during live streams."
constraints:
  - "Solution must run inside the existing Cloudflare Pages footprint with no extra servers."
  - "Responses need to stay under 200ms at edge POPs across North America."
  - "Cache staleness cannot exceed 5 minutes to keep stakeholder trust."
stack:
  - "Cloudflare Pages Functions"
  - "KV Storage"
  - "Astro"
  - "TypeScript"
lessons:
  - "ETag-aware fetches combined with KV storage drastically cut GitHub API volume."
  - "Normalizing event payloads server-side keeps the UI lightweight and accessible."
  - "Providing a fallback empty state prevents marketing pages from failing during outages."
links:
  repo: "https://github.com/0xC0FFEEBEEF/nbdevlab"
---

## Problem
Every launch stream we host includes a "what changed recently" segment. The prior implementation fetched GitHub events directly from the browser, instantly burning through rate limits and leaving the widget empty for the rest of the show.

## Approach
I moved the integration into a Cloudflare Pages Function with KV-based caching and optional token auth. The worker normalizes Push, PR, Issue, and Release events and exposes them to Astro through a reusable card component. On the front-end, I layered in accessible list semantics, hover/focus affordances, and skeleton states so marketing still looks polished when GitHub hiccups.

## Results
* Rate limit warnings disappeared entirely during rehearsal.
* Designers update copy inside Decap without touching the worker.
* Early tests show a 74% reduction in time-to-first-byte for the activity widget.

## Snippets
```ts
const cached = await env.GITHUB_CACHE.get(cacheKey, "json");
if (cached && cached.etag && request.headers.get("if-none-match") === cached.etag) {
  return new Response(JSON.stringify(cached.body), { status: 200, headers });
}
```
