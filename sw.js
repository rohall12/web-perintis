self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open('roni-halla-v1').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                'assets/gojo.jpg',
                'assets/sung_jin_woo.jpg',
                'assets/blue_eyes_character.jpg',
                'assets/new_hero_character.jpg'
            ]);
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});