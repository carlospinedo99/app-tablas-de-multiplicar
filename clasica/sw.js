// Service worker de la versión Clásica: cachea el app shell para uso 100% offline.
const CACHE_NAME = 'tablas-camila-clasica-v4';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './css/theme-clasica.css',
  './js/main.js',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  '../shared/css/base.css',
  '../shared/js/app-core.js',
  '../shared/js/data/tables.js',
  '../shared/js/engine/state.js',
  '../shared/js/engine/questions.js',
  '../shared/js/engine/timer.js',
  '../shared/js/engine/audio.js',
  '../shared/js/engine/music.js',
  '../shared/js/engine/speech.js',
  '../shared/js/ui/router.js',
  '../shared/js/ui/components.js',
  '../shared/js/ui/screens.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request)
        .then(response => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
