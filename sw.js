const CACHE_NAME = 'ronihalla-pwa-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './assets/gojo.jpg',
  './assets/new_hero_character.jpg',
  './assets/sung_jin_woo.jpg',
  './assets/blue_eyes_character.jpg',
  './js/telegram-bot.js'
];

// Install Service Worker & Cache file penting
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch dari Cache kalau ada, kalau nggak ambil dari internet
self.addEventListener('fetch', event => {
  event.respond_with(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});