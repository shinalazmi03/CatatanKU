const CACHE_NAME = 'catatanku-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://fonts.googleapis.com/icon?family=Material+Icons'
];

// Install Event - Caching aset
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Activate Event - Clean up cache lama
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
});

// Fetch Event - Offline First Strategy
self.addEventListener('fetch', (event) => {
    // Lewati request ke Google Apps Script (jangan dicache, biarkan fetch error agar masuk queue app.js)
    if (event.request.url.includes('script.google.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
        .then((response) => {
            return response || fetch(event.request).then((fetchRes) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, fetchRes.clone());
                    return fetchRes;
                });
            });
        })
    );
});