// Service worker: aplikacija radi bez interneta.
// Vlastite datoteke: prvo iz spremnika, osvježavanje u pozadini. Firebase (gstatic): isto.
// Firestore API pozivi ne prolaze kroz spremnik (nju rješava Firestore offline podrška).
const VERSION = 'smartlift-v2';
const SHELL = [
  './', 'index.html', 'config.js', 'manifest.webmanifest', 'css/styles.css',
  'js/app.js', 'js/firebase.js', 'js/store.js', 'js/ui.js', 'js/util.js', 'js/auth.js', 'js/wizard.js',
  'js/home.js', 'js/workout.js', 'js/plan.js', 'js/picker.js', 'js/history.js', 'js/settings.js',
  'js/exercises.js', 'js/animations.js', 'js/recovery.js', 'js/progression.js', 'js/analysis.js', 'js/modules/index.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-180.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const own = url.origin === location.origin;
  const sdk = url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/');
  if (!own && !sdk) return;

  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const hit = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req).then((res) => { if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const res = await net;
    if (res) return res;
    if (req.mode === 'navigate') return (await cache.match('index.html')) || Response.error();
    return Response.error();
  })());
});
