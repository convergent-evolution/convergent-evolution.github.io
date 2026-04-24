// Cloudflare Worker: visit counter for convergent-evolution.github.io
//
// Deploy (no CLI needed):
//   1. Sign up at https://dash.cloudflare.com (free, no credit card).
//   2. Workers & Pages → Create application → Create Worker.
//      Name it e.g. "cv-counter". Click Deploy (placeholder), then Edit Code.
//      Paste this file. Save and deploy.
//   3. On the worker page: Settings → Bindings → Add → KV Namespace.
//      Variable name: COUNTER
//      KV namespace: Create new → "cv-counter-kv".
//      Save, then Deploy again so the binding takes effect.
//   4. Copy the Worker URL (e.g. https://cv-counter.<subdomain>.workers.dev)
//      and paste it into assets/visit-counter.js as API_BASE.

const ALLOWED_ORIGINS = [
  'https://convergent-evolution.github.io',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const allowed = ALLOWED_ORIGINS.includes(origin);
    const cors = {
      'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    try {
      if (url.pathname === '/hit' && request.method === 'POST') {
        const country = (request.cf && request.cf.country) || 'XX';
        const total = await inc(env, 'total');
        await inc(env, 'c:' + country);
        return json({ total }, 200, cors);
      }
      if (url.pathname === '/stats' && request.method === 'GET') {
        const totalRaw = await env.COUNTER.get('total');
        const total = parseInt(totalRaw || '0', 10);
        const countries = {};
        const list = await env.COUNTER.list({ prefix: 'c:' });
        await Promise.all(list.keys.map(async (k) => {
          const v = await env.COUNTER.get(k.name);
          countries[k.name.slice(2)] = parseInt(v || '0', 10);
        }));
        return json({ total, countries }, 200, cors);
      }
    } catch (_) {
      return json({ error: 'server' }, 500, cors);
    }
    return json({ error: 'not_found' }, 404, cors);
  },
};

async function inc(env, key) {
  const raw = await env.COUNTER.get(key);
  const n = parseInt(raw || '0', 10) + 1;
  await env.COUNTER.put(key, String(n));
  return n;
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}
