(function () {
  const API_BASE = 'https://cv-counter.deqing1997.workers.dev';
  const SCRIPT_URL =
    (document.currentScript && document.currentScript.src) || '';
  const SVG_NS = 'http://www.w3.org/2000/svg';

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
    const url = SCRIPT_URL
      ? new URL('world-dots.json', SCRIPT_URL).href
      : 'assets/world-dots.json';
    const r = await fetch(url);
    if (!r.ok) throw new Error('dots ' + r.status);
    return r.json();
  }

  function svgEl(name, attrs) {
    const el = document.createElementNS(SVG_NS, name);
    if (attrs) for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function renderMap(dotData, countries) {
    if (!mapEl || !dotData) return;
    const hit = new Set(
      Object.keys(countries || {}).filter(
        (cc) => countries[cc] > 0 && cc !== 'XX' && cc !== 'T1'
      )
    );
    while (mapEl.firstChild) mapEl.removeChild(mapEl.firstChild);

    const defs = svgEl('defs');
    const grad = svgEl('linearGradient', {
      id: 'vc-grad',
      x1: '0', y1: '0', x2: '180', y2: '72',
      gradientUnits: 'userSpaceOnUse',
    });
    grad.appendChild(svgEl('stop', { offset: '0', class: 'vc-g-a' }));
    grad.appendChild(svgEl('stop', { offset: '1', class: 'vc-g-b' }));
    defs.appendChild(grad);
    mapEl.appendChild(defs);

    for (const [x, y, iso] of dotData.dots) {
      const c = svgEl('circle', {
        cx: String(x + 0.5),
        cy: String(y + 0.5),
        r: '0.4',
      });
      if (hit.has(iso)) c.setAttribute('class', 'on');
      mapEl.appendChild(c);
    }
    root.classList.add('has-map');
  }

  (async function () {
    // /hit is best-effort; never blocks the UI.
    if (!alreadyHit) {
      call('/hit', { method: 'POST' }).catch((e) =>
        console.warn('[visit-counter] /hit failed', e)
      );
    }
    // /stats feeds the total + active-country set. Independent of /hit.
    let stats = null;
    try {
      stats = await call('/stats');
      totalEl.textContent = fmt(stats.total);
    } catch (e) {
      console.warn('[visit-counter] /stats failed', e);
    }
    // Map renders regardless (all dots muted if stats missing).
    try {
      const dotData = await loadDots();
      renderMap(dotData, stats && stats.countries);
    } catch (e) {
      console.warn('[visit-counter] map failed', e);
    }
  })();
})();
