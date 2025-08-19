// _worker.js
async function auth(request, env) {
  const url = new URL(request.url);
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  authorize.searchParams.set("scope", "repo,user:email");
  authorize.searchParams.set("redirect_uri", `${url.origin}/api/callback`);
  return Response.redirect(authorize.toString(), 302);
}

async function callback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) return new Response("Missing code", { status: 400 });

  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Accept": "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${url.origin}/api/callback`,
    }),
  });
  const json = await res.json();
  const token = json.access_token || "";

  const html = `<!doctype html><meta charset="utf-8" />
<script>
  (function(){
    var token = ${JSON.stringify(token)};
    if (window.opener && token) {
      window.opener.postMessage({ token: token }, "${url.origin}");
    }
    window.close();
  })();
</script>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/auth") return auth(request, env);
    if (pathname === "/api/callback") return callback(request, env);
    // otherwise serve the built Astro site
    return env.ASSETS.fetch(request);
  }
};
