import type { KVNamespace, PagesFunction } from "@cloudflare/workers-types";

type NormalizedEvent = {
  type: "PushEvent" | "PullRequestEvent" | "IssuesEvent" | "ReleaseEvent";
  repo: string;
  url: string;
  title: string;
  timestamp: string;
};

type CachedPayload = {
  etag?: string;
  body: { items: NormalizedEvent[] };
  cachedAt: string;
};

type GitHubEvent = {
  type: string;
  repo: { name: string };
  created_at: string;
  payload: any;
};

const SUPPORTED_TYPES = new Set<NormalizedEvent["type"]>([
  "PushEvent",
  "PullRequestEvent",
  "IssuesEvent",
  "ReleaseEvent",
]);

const headers = new Headers({
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "cache-control": "public, max-age=60, s-maxage=900",
});

async function readCache(env: EnvBindings, key: string): Promise<CachedPayload | null> {
  try {
    const raw = await env.GITHUB_CACHE.get(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPayload;
    if (!parsed.body || !Array.isArray(parsed.body.items)) return null;
    return parsed;
  } catch (error) {
    console.error("github-cache-read", error);
    return null;
  }
}

async function writeCache(env: EnvBindings, key: string, payload: CachedPayload): Promise<void> {
  try {
    await env.GITHUB_CACHE.put(key, JSON.stringify(payload));
  } catch (error) {
    console.error("github-cache-write", error);
  }
}

function normalizeEvents(events: GitHubEvent[]): NormalizedEvent[] {
  const normalized: NormalizedEvent[] = [];
  for (const event of events) {
    if (!SUPPORTED_TYPES.has(event.type as NormalizedEvent["type"])) continue;
    const base: Pick<NormalizedEvent, "type" | "repo" | "timestamp"> = {
      type: event.type as NormalizedEvent["type"],
      repo: event.repo?.name ?? "unknown",
      timestamp: event.created_at,
    };

    switch (event.type) {
      case "PushEvent": {
        const commits = event.payload?.commits ?? [];
        const count = Array.isArray(commits) ? commits.length : 0;
        const message = count > 0 ? commits[0]?.message ?? "Pushed commits" : "Pushed commits";
        normalized.push({
          ...base,
          url: `https://github.com/${base.repo}/commits/${event.payload?.head ?? ""}`,
          title: count > 1 ? `${message} (+${count - 1} more)` : message,
        });
        break;
      }
      case "PullRequestEvent": {
        const pr = event.payload?.pull_request;
        normalized.push({
          ...base,
          url: pr?.html_url ?? `https://github.com/${base.repo}`,
          title: pr?.title ?? "Updated a pull request",
        });
        break;
      }
      case "IssuesEvent": {
        const issue = event.payload?.issue;
        normalized.push({
          ...base,
          url: issue?.html_url ?? `https://github.com/${base.repo}`,
          title: `${event.payload?.action ?? "updated"} issue: ${issue?.title ?? "Untitled"}`,
        });
        break;
      }
      case "ReleaseEvent": {
        const release = event.payload?.release;
        normalized.push({
          ...base,
          url: release?.html_url ?? `https://github.com/${base.repo}`,
          title: release?.name ?? release?.tag_name ?? "Published a release",
        });
        break;
      }
    }
    if (normalized.length >= 5) break;
  }
  return normalized.slice(0, 5);
}

type EnvBindings = {
  GITHUB_CACHE: KVNamespace;
  GITHUB_TOKEN?: string;
  GITHUB_USERNAME?: string;
};

export const onRequestGet: PagesFunction<EnvBindings> = async ({ env, request }) => {
  const username = env.GITHUB_USERNAME?.trim() || "nbullock";
  const key = `feed:v1:${username.toLowerCase()}`;

  const cached = await readCache(env, key);
  const requestHeaders = new Headers({
    "User-Agent": "nbdevlab-pages-function",
    Accept: "application/vnd.github+json",
  });
  if (env.GITHUB_TOKEN) {
    requestHeaders.set("Authorization", `Bearer ${env.GITHUB_TOKEN}`);
  }
  if (cached?.etag) {
    requestHeaders.set("If-None-Match", cached.etag);
  }

  try {
    const apiUrl = `https://api.github.com/users/${encodeURIComponent(username)}/events/public`;
    const ghResponse = await fetch(apiUrl, {
      headers: requestHeaders,
    });

    if (ghResponse.status === 304 && cached) {
      return new Response(JSON.stringify(cached.body), { status: 200, headers });
    }

    if (!ghResponse.ok) {
      if (cached) {
        return new Response(JSON.stringify(cached.body), { status: 200, headers });
      }
      return new Response(JSON.stringify({ items: [] }), { status: 200, headers });
    }

    const etag = ghResponse.headers.get("etag") ?? undefined;
    const rawEvents = (await ghResponse.json()) as GitHubEvent[];
    const items = normalizeEvents(rawEvents).slice(0, 5);
    const body = { items };

    await writeCache(env, key, {
      etag,
      body,
      cachedAt: new Date().toISOString(),
    });

    return new Response(JSON.stringify(body), { status: 200, headers });
  } catch (error) {
    console.error("github-fetch-error", error);
    if (cached) {
      return new Response(JSON.stringify(cached.body), { status: 200, headers });
    }
    return new Response(JSON.stringify({ items: [] }), { status: 200, headers });
  }
};

/*
Example request:
  curl -i https://<your-pages-domain>/api/github

Local bindings for Pages dev:
  wrangler pages dev --kv GITHUB_CACHE --binding GITHUB_USERNAME=nbullock
*/
