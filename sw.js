/* ALUMIL BOQ Builder — service worker (flat layout, no subfolders) */
const VERSION = 'v2.0.0';
const CACHE = `alumil-boq-${VERSION}`;
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      // never let one missing optional file abort the whole install
      .then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put('index.html', c)); return res; })
        .catch(() => caches.match('index.html').then(r => r || caches.match('./')))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res && res.status === 200 && res.type === 'basic') {
        const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c));
      }
      return res;
    }).catch(() => hit))
  );
});
