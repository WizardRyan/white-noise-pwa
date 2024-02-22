const CACHE_NAME = 'noise-app-v1.1';

const G_URL = "/wizardryan.github.io/white-noise-pwa/";

const urlsToCache = [
    `${G_URL}/`,
    `${G_URL}/index.html`,
    `${G_URL}/style.css`,
    `${G_URL}/app.js`,
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.log(`failed to add cache: ${err}`);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // Cache hit - serve from cache
                }
                // No cache hit - fetch from network
                return fetch(event.request).then(response => {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    // Clone the response and store it in the cache
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    return response;
                });
            })
    );
});