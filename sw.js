// ==========================================
// SERVICE WORKER - AUTO CACHE BUSTING ENGINE
// ==========================================
const CACHE_NAME = 'portfolio-cache-v1.0.1';

// File yang di-cache
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css?v=1.0.1',
    '/script.js?v=1.0.1'
];

// 1. INSTALLATION: Paksa Service Worker baru langsung aktif tanpa menunggu
self.addEventListener('install', (event) => {
    self.skipWaiting(); 
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
});

// 2. ACTIVATION: Hapus semua cache versi lama secara otomatis
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Menghapus Cache Lama:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Langsung ambil alih halaman
    );
});

// 3. FETCH STRATEGY: Network First (Utamakan Ambil File Terbaru dari Server)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Jika koneksi online, selalu berikan file terbaru dari server
                return networkResponse;
            })
            .catch(() => {
                // Jika offline, baru gunakan cache
                return caches.match(event.request);
            })
    );
});