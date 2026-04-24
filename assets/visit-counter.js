(function () {
  // TODO: replace with your Worker URL after deploying worker/worker.js.
  const API_BASE = 'https://cv-counter.deqing1997.workers.dev';

  const root = document.getElementById('visit-counter');
  if (!root || API_BASE.includes('YOUR-SUBDOMAIN')) return;

  const totalEl = root.querySelector('[data-total]');

  const SEEN_KEY = 'cv_visit_day';
  const today = new Date().toISOString().slice(0, 10);
  const alreadyHit = localStorage.getItem(SEEN_KEY) === today;
  if (!alreadyHit) localStorage.setItem(SEEN_KEY, today);

  const fmt = (n) => n.toLocaleString();

  function render({ total }) {
    totalEl.textContent = fmt(total);
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
