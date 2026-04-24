(function () {
  const API_BASE = 'https://cv-counter.deqing1997.workers.dev';
  const SCRIPT_URL =
    (document.currentScript && document.currentScript.src) || '';

  const root = document.getElementById('visit-counter');
  if (!root || API_BASE.includes('YOUR-SUBDOMAIN')) return;

  const totalEl = root.querySelector('[data-total]');
  const mapEl = root.querySelector('[data-map]');

  const SEEN_KEY = 'cv_visit_day';
  const today = new Date().toISOString().slice(0, 10);
  const alreadyHit = localStorage.getItem(SEEN_KEY) === today;
  if (!alreadyHit) localStorage.setItem(SEEN_KEY, today);

  const fmt = (n) => n.toLocaleString();

  async function call(path, init) {
    const r = await fetch(API_BASE + path, init);
    if (!r.ok) throw new Error(String(r.status));
    return r.json();
  }

  async function loadDots() {
    try {
      const url = SCRIPT_URL
        ? new URL('world-dots.json', SCRIPT_URL).href
        : 'assets/world-dots.json';
      const r = await fetch(url);
      if (!r.ok) return null;
      return r.json();
    } catch (_) {
      return null;
    }
  }

  function renderMap(dotData, countries) {
    if (!mapEl || !dotData) return;
    const { dots } = dotData;
    const hit = new Set(
      Object.keys(countries || {}).filter(
        (cc) => countries[cc] > 0 && cc !== 'XX' && cc !== 'T1'
      )
    );
    const parts = [
      '<defs>' +
        '<linearGradient id="vc-grad" x1="0" y1="0" x2="90" y2="36" gradientUnits="userSpaceOnUse">' +
        '<stop offset="0" class="vc-g-a"/>' +
        '<stop offset="1" class="vc-g-b"/>' +
        '</linearGradient>' +
        '</defs>',
    ];
    for (const [x, y, iso] of dots) {
      const cls = hit.has(iso) ? ' class="on"' : '';
      parts.push(
        '<circle cx="' + (x + 0.5) + '" cy="' + (y + 0.5) + '" r="0.38"' + cls + '/>'
      );
    }
    mapEl.innerHTML = parts.join('');
  }

  (async function () {
    try {
      const [dotData] = await Promise.all([
        loadDots(),
        alreadyHit ? Promise.resolve() : call('/hit', { method: 'POST' }),
      ]);
      const stats = await call('/stats');
      totalEl.textContent = fmt(stats.total);
      renderMap(dotData, stats.countries);
      root.classList.add('ready');
    } catch (_) {
      root.classList.add('error');
    }
  })();
})();
