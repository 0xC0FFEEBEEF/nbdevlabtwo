// _worker.js — Cloudflare Worker for Decap + GitHub OAuth
//
// REQUIRED CF SECRETS (wrangler):
//   wrangler secret put GITHUB_CLIENT_ID
//   wrangler secret put GITHUB_CLIENT_SECRET
//
// GITHUB OAUTH APP CALLBACK must be EXACTLY:
//   https://www.nbdevlab.com/api/callback
//
// Decap config.yml:
// backend:
//   name: github
//   repo: <owner>/<repo>
//   branch: main
//   base_url: https://www.nbdevlab.com
//   auth_endpoint: /api/auth

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return new Response("ok", { headers: { "content-type": "text/plain" }});
    }

    if (url.pathname === "/api/auth") {
      return beginGitHubOAuth(request, env);
    }

    if (url.pathname === "/api/callback") {
      return handleGitHubCallback(request, env);
    }

    // everything else: serve your built Astro site
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response("Not found", { status: 404 });
  },
};

function randomState(len = 32) {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return [...bytes].map(b => b.toString(16).padStart(2, "0")).join("");
}

function htmlPostMessageSuccess(token) {
  // Decap listens for this exact string prefix + JSON payload
  return new Response(`<!doctype html><html><body><script>
  (function(){
    try {
      window.opener.postMessage(
        'authorization:github:success:' + JSON.stringify({ token: '${token}' }),
        '*'
      );
    } catch(e) {}
    window.close();
  })();
  </script></body></html>`,
  { headers: { "content-type": "text/html; charset=utf-8" }});
}

function htmlPostMessageFailure(message) {
  return new Response(`<!doctype html><html><body><script>
  (function(){
    try {
      window.opener.postMessage(
        'authorization:github:failure:' + JSON.stringify({ error: '${escapeJs(message)}' }),
        '*'
      );
    } catch(e) {}
    window.close();
  })();
  </script></body></html>`,
  { headers: { "content-type": "text/html; charset=utf-8" }});
}

function escapeJs(s) {
  return s.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n");
}

function setCookie(name, value, { path = "/", httpOnly = true, secure = true, sameSite = "Lax", maxAge } = {}) {
  const parts = [`${name}=${value}`];
  if (path) parts.push(`Path=${path}`);
  if (httpOnly) parts.push("HttpOnly");
  if (secure) parts.push("Secure");
  if (sameSite) parts.push(`SameSite=${sameSite}`);
  if (maxAge) parts.push(`Max-Age=${maxAge}`);
  return parts.join("; ");
}

function readCookie(request, name) {
  const cookie = request.headers.get("cookie") || "";
  return cookie.split(/;\s*/).map(kv => kv.split("=")).find(([k]) => k === name)?.[1];
}

async function beginGitHubOAuth(request, env) {
  const reqUrl = new URL(request.url);

  // Build redirect_uri from the current origin to avoid mismatches
  const redirectUri = `${reqUrl.origin}/api/callback`;

  const clientId = env.GITHUB_CLIENT_ID;
  if (!clientId) return new Response("Missing GITHUB_CLIENT_ID", { status: 500 });

  const state = randomState(16);

  const scope = "repo,user"; // adjust if you only need public_repo
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("scope", scope);
  authorize.searchParams.set("state", state);
  // (optional) allow_signup left default

  const headers = new Headers({
    "Location": authorize.toString(),
    "Set-Cookie": setCookie("oauth_state", state, {
      // Lax is fine for typical popup redirect flows
      sameSite: "Lax",
      maxAge: 300, // 5 minutes
    }),
  });

  return new Response(null, { status: 302, headers });
}

async function handleGitHubCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const stored = readCookie(request, "oauth_state");

  if (!code) return htmlPostMessageFailure("Missing code.");
  if (!state || !stored || state !== stored) {
    return htmlPostMessageFailure("Invalid state.");
  }

  const reqUrl = new URL(request.url);
  const redirectUri = `${reqUrl.origin}/api/callback`;

  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return htmlPostMessageFailure("Server is missing GitHub credentials.");
  }

  // Exchange the code for an access token
  const tokenResp = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      // GitHub does not require Authorization header for this grant
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResp.ok) {
    const t = await safeText(tokenResp);
    return htmlPostMessageFailure(`Token exchange failed (${tokenResp.status}). ${t}`);
  }

  const data = await tokenResp.json();
  if (data.error) {
    return htmlPostMessageFailure(`GitHub error: ${data.error_description || data.error}`);
  }

  const token = data.access_token;
  if (!token) {
    return htmlPostMessageFailure("No access token received.");
  }

  // Clear the state cookie (best-effort)
  const headers = new Headers(htmlPostMessageSuccess(token).headers);
  headers.append("Set-Cookie", setCookie("oauth_state", "", { maxAge: 0 }));

  return new Response((await (await htmlPostMessageSuccess(token)).text()), {
    headers,
  });
}

async function safeText(resp) {
  try { return await resp.text(); } catch { return ""; }
}
