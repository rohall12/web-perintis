importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const CACHE_NAME = 'ronihalla-pwa-v2';
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

// Inisialisasi Firebase Configuration milik RoniHalla
firebase.initializeApp({
  apiKey: "AIzaSyDJE6Ua3tGM0ltnuBiXC5jvM-VLBZCmGqI",
  authDomain: "my-portofolio-c2eeb.firebaseapp.com",
  databaseURL: "https://my-portofolio-c2eeb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "my-portofolio-c2eeb",
  storageBucket: "my-portofolio-c2eeb.firebasestorage.app",
  messagingSenderId: "686049637486",
  appId: "1:686049637486:web:6362caafe9ed4fb37c227f",
  measurementId: "G-PW4ZTPWMF2"
});

const messaging = firebase.messaging();

// 1. Install Service Worker & Cache file
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// 2. Aktifkan Service Worker baru & bersihkan cache lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch dari Cache / Network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// 4. Tangkap Push Notification Real-time dari Firebase
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title || "Update RoniHalla!";
  const notificationOptions = {
    body: payload.notification.body || "Ada fitur baru nih di web portofolio!",
    icon: './assets/gojo.jpg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});