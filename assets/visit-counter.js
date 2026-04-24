(function () {
  // TODO: replace with your Worker URL after deploying worker/worker.js.
  const API_BASE = 'https://cv-counter.deqing1997.workers.dev';

  const root = document.getElementById('visit-counter');
  if (!root || API_BASE.includes('YOUR-SUBDOMAIN')) return;

  const totalEl = root.querySelector('[data-total]');
  const countriesEl = root.querySelector('[data-countries]');
  const flagsEl = root.querySelector('[data-flags]');

  const SEEN_KEY = 'cv_visit_day';
  const today = new Date().toISOString().slice(0, 10);
  const alreadyHit = localStorage.getItem(SEEN_KEY) === today;
  if (!alreadyHit) localStorage.setItem(SEEN_KEY, today);

  function flag(cc) {
    if (!cc || cc.length !== 2 || cc === 'XX' || cc === 'T1') return '🌐';
    const base = 0x1F1E6;
    return String.fromCodePoint(
      base + cc.charCodeAt(0) - 65,
      base + cc.charCodeAt(1) - 65
    );
  }

  const fmt = (n) => n.toLocaleString();

  function render({ total, countries }) {
    const entries = Object.entries(countries || {})
      .filter(([cc]) => cc && cc !== 'XX' && cc !== 'T1')
      .sort((a, b) => b[1] - a[1]);
    totalEl.textContent = fmt(total);
    countriesEl.textContent = entries.length;
    flagsEl.innerHTML = entries
      .slice(0, 12)
      .map(
        ([cc, n]) =>
          '<span class="vc-flag" title="' + cc + ': ' + fmt(n) + '">' +
          '<span class="vc-flag-emoji">' + flag(cc) + '</span>' +
          '<span class="vc-flag-n">' + fmt(n) + '</span>' +
          '</span>'
      )
      .join('');
  }

  async function call(path, init) {
    const r = await fetch(API_BASE + path, init);
    if (!r.ok) throw new Error(String(r.status));
    return r.json();
  }

  (async function () {
    try {
      if (!alreadyHit) await call('/hit', { method: 'POST' });
      render(await call('/stats'));
      root.classList.add('ready');
    } catch (_) {
      root.classList.add('error');
    }
  })();
})();
