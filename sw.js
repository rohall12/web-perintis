const CACHE_NAME = 'roni-portfolio-v2'; // Ubah v1 jadi v2
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/app-icon.png' // Tambahkan icon baru ke cache
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});