// Sri Vijay Seeds — Service Worker
// Save this file as sw.js in the SAME folder as index.html
// Version: 4

const CACHE = 'svseeds-v4';

// Files to pre-cache on install (the app shell)
const PRE_CACHE = [
  './',
  './index.html'
];

// ── Install: pre-cache the app shell ────────────────────────────────────────
self.addEventListener('install', e => {
  // NOTE: skipWaiting() is no longer called automatically here.
  // The new SW will sit in "waiting" state until the user taps
  // "Update Now" in the app, which sends a SKIP_WAITING message.
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRE_CACHE).catch(() => {}))
  );
});

// ── Listen for messages from the page (e.g. "Update Now" button) ─────────────
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ── Activate: delete old caches ──────────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: network-first with cache fallback ─────────────────────────────────
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  // Skip cross-origin requests (fonts, placeholders, Firebase etc.)
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache a clone of every successful same-origin response
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
