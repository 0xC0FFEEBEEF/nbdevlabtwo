import "./polyfills/message-channel";

import type { SSRManifest } from "astro";
import { createExports as createBaseExports } from "@astrojs/cloudflare/entrypoints/server.js";
import type { ExecutionContext } from "@cloudflare/workers-types";

interface Env {
  ASSETS: { fetch: (input: Request | string) => Promise<Response> };
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GITHUB_REDIRECT_URI?: string;
  GITHUB_SCOPE?: string;
  [key: string]: unknown;
}

const OAUTH_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const OAUTH_TOKEN_URL = "https://github.com/login/oauth/access_token";

export function createExports(manifest: SSRManifest) {
  const base = createBaseExports(manifest);

  return {
    default: {
      async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);

        if (url.pathname === "/api/auth") {
          const clientId = env.GITHUB_CLIENT_ID;
          if (!clientId) {
            return new Response("Missing GITHUB_CLIENT_ID", { status: 500 });
          }

          const redirectUri = env.GITHUB_REDIRECT_URI || `${url.origin}/api/callback`;
          const scope = env.GITHUB_SCOPE || "repo,user";
          const state = cryptoRandomString();

          const authURL = new URL(OAUTH_AUTHORIZE_URL);
          authURL.searchParams.set("client_id", clientId);
          authURL.searchParams.set("redirect_uri", redirectUri);
          authURL.searchParams.set("scope", scope);
          authURL.searchParams.set("state", state);

          return Response.redirect(authURL.toString(), 302);
        }

        if (url.pathname === "/api/callback") {
          const code = url.searchParams.get("code");
          const error = url.searchParams.get("error");
          const clientId = env.GITHUB_CLIENT_ID;
          const clientSecret = env.GITHUB_CLIENT_SECRET;
          const redirectUri = env.GITHUB_REDIRECT_URI || `${url.origin}/api/callback`;

          if (error) {
            return htmlResponse(oauthErrorHtml(error));
          }

          if (!code) {
            return htmlResponse(oauthErrorHtml("Missing ?code from GitHub"));
          }

          if (!clientId || !clientSecret) {
            return htmlResponse(oauthErrorHtml("Missing client credentials"));
          }

          const tokenRes = await fetch(OAUTH_TOKEN_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              client_id: clientId,
              client_secret: clientSecret,
              redirect_uri: redirectUri,
              code,
            }),
          });

          if (!tokenRes.ok) {
            return htmlResponse(
              oauthErrorHtml(`Token exchange failed (${tokenRes.status})`),
            );
          }

          const data = (await tokenRes.json()) as { access_token?: string };
          const accessToken = data.access_token;
          if (!accessToken) {
            return htmlResponse(oauthErrorHtml("No access_token in response"));
          }

          const payload = JSON.stringify({ token: accessToken, provider: "github" });
          const message = `authorization:github:success:${payload}`;
          return htmlResponse(successHandshakeHtml(message));
        }

        return base.default.fetch(request, env, ctx);
      },
    },
  };
}

function htmlResponse(body: string): Response {
  return new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${body}`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

function oauthErrorHtml(message: string): string {
  const safe = escapeHtml(String(message));
  return `
<title>Decap Auth Error</title>
<p>Authentication error: ${safe}</p>
<script>
  try {
    window.opener && window.opener.postMessage("authorization:github:error:${safe}", "*");
  } catch (e) {}
</script>`;
}

function successHandshakeHtml(message: string): string {
  const jsMessage = JSON.stringify(message);
  return `
<title>Decap Auth</title>
<p>You can close this window.</p>
<script>
(function () {
  function receive(e) {
    try {
      window.opener.postMessage(${jsMessage}, e.origin);
    } catch (err) {}
    window.removeEventListener("message", receive, false);
    window.close();
  }
  window.addEventListener("message", receive, false);
  if (window.opener) {
    window.opener.postMessage("authorizing:github", "*");
  }
})();
</script>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cryptoRandomString(): string {
  const buffer = new Uint8Array(16);
  crypto.getRandomValues(buffer);
  return Array.from(buffer, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
