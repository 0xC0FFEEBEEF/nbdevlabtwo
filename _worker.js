if (typeof globalThis.MessageChannel === "undefined") {
  const scheduleMicrotask =
    typeof queueMicrotask === "function"
      ? queueMicrotask
      : (cb) => Promise.resolve().then(cb).catch(() => setTimeout(cb, 0));

  class MessagePortPolyfill {
    constructor() {
      this.onmessage = null;
      this._partner = null;
    }

    _setPartner(port) {
      this._partner = port;
    }

    postMessage(value) {
      if (!this._partner) return;
      const partner = this._partner;
      scheduleMicrotask(() => {
        const handler = partner.onmessage;
        if (typeof handler === "function") {
          handler({ data: value });
        }
      });
    }

    start() {}

    close() {
      this._partner = null;
      this.onmessage = null;
    }
  }

  class MessageChannelPolyfill {
    constructor() {
      const port1 = new MessagePortPolyfill();
      const port2 = new MessagePortPolyfill();
      port1._setPartner(port2);
      port2._setPartner(port1);
      this.port1 = port1;
      this.port2 = port2;
    }
  }

  globalThis.MessageChannel = MessageChannelPolyfill;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // ---- OAuth start ----
    if (url.pathname === "/api/auth") {
      const clientId = env.GITHUB_CLIENT_ID;
      if (!clientId) return new Response("Missing GITHUB_CLIENT_ID", { status: 500 });

      // IMPORTANT: this must EXACTLY match the callback configured in your GitHub OAuth App
      const redirectUri =
        env.GITHUB_REDIRECT_URI || `${url.origin}/api/callback`;

      const scope = env.GITHUB_SCOPE || "repo,user";
      const state = cryptoRandomString();

      const authURL = new URL("https://github.com/login/oauth/authorize");
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
      const redirectUri =
        env.GITHUB_REDIRECT_URI || `${url.origin}/api/callback`;

      if (error) {
        return htmlResponse(oauthErrorHtml(error));
      }
      if (!code) {
        return htmlResponse(oauthErrorHtml("Missing ?code from GitHub"));
      }
      if (!clientId || !clientSecret) {
        return htmlResponse(oauthErrorHtml("Missing client credentials"));
      }

      // Exchange code for access token
      const tokenRes = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            code,
          }),
        },
      );

      if (!tokenRes.ok) {
        return htmlResponse(oauthErrorHtml(`Token exchange failed (${tokenRes.status})`));
      }

      const data = await tokenRes.json();
      const accessToken = data.access_token;
      if (!accessToken) {
        return htmlResponse(oauthErrorHtml(`No access_token in response`));
      }

      // Build the EXACT message Decap expects
      const payload = JSON.stringify({ token: accessToken, provider: "github" });
      const message = `authorization:github:success:${payload}`;

      return htmlResponse(successHandshakeHtml(message));
    }
    // ---- OAuth end ----

    // Everything else: serve your Astro static site
    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response("Not found", { status: 404 });
  },
};

// ————— helpers —————
function htmlResponse(body) {
  return new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${body}`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

function oauthErrorHtml(msg) {
  const safe = escapeHtml(String(msg));
  return `
<title>Decap Auth Error</title>
<p>Authentication error: ${safe}</p>
<script>
  // Tell the opener about the error (Decap will show a toast)
  try {
    window.opener && window.opener.postMessage("authorization:github:error:${safe}", "*");
  } catch (e) {}
</script>`;
}

function successHandshakeHtml(message) {
  // We JSON.stringify the message so it becomes a proper JS string literal when embedded.
  const jsMessage = JSON.stringify(message);
  return `
<title>Decap Auth</title>
<p>You can close this window.</p>
<script>
(function () {
  function receive(e) {
    try {
      // Post the success message to the opener's exact origin,
      // which we learn from the handshake reply:
      window.opener.postMessage(${jsMessage}, e.origin);
    } catch (err) {}
    window.removeEventListener("message", receive, false);
    // Close the popup (may be ignored by some browsers if not user-initiated).
    window.close();
  }
  window.addEventListener("message", receive, false);
  // Kick off the handshake:
  if (window.opener) {
    window.opener.postMessage("authorizing:github", "*");
  }
})();
</script>`;
}

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cryptoRandomString() {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  return [...a].map(b => b.toString(16).padStart(2, "0")).join("");
}
