export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    if (url.pathname === '/api/auth') {
      const redirect_uri = 'https://www.nbdevlab.com/api/callback';
      const gh = new URL('https://github.com/login/oauth/authorize');
      gh.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      gh.searchParams.set('redirect_uri', redirect_uri);
      gh.searchParams.set('scope', 'repo,user'); // adjust if you only need public_repo
      gh.searchParams.set('state', crypto.randomUUID()); // optional: also store/validate state
      return Response.redirect(gh.toString(), 302);
    }

    if (url.pathname === '/api/callback') {
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      if (error) return postBackFailure(error);

      // exchange code -> token
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new URLSearchParams({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: 'https://www.nbdevlab.com/api/callback',
        }),
      });
      const json = await tokenRes.json();
      if (!json.access_token) {
        return postBackFailure(json.error_description || 'no access_token');
      }
      return postBackSuccess(json.access_token);
    }

    return new Response('Not found', { status: 404 });
  }
};

function postBackSuccess(token) {
  return htmlResponse(`
<!doctype html><meta charset="utf-8">
<script>
  (function() {
    try {
      window.opener && window.opener.postMessage(
        'authorization:github:success:' + JSON.stringify({ token: ${JSON.stringify(token)} }),
        '*'
      );
    } catch (e) {}
    window.close();
  })();
</script>`);
}

function postBackFailure(message) {
  return htmlResponse(`
<!doctype html><meta charset="utf-8">
<script>
  (function() {
    try {
      window.opener && window.opener.postMessage(
        'authorization:github:failure:' + JSON.stringify({ error: ${JSON.stringify(message)} }),
        '*'
      );
    } catch (e) {}
    window.close();
  })();
</script>`);
}

function htmlResponse(html) {
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}
