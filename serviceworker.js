const CACHE_NAME = "version-2";
const assetsToCache = [
    '/',
    '/SalatTimeTable24.json',
    '/english_hijri_mapping.json',
    '/index.html',
    '/images/bg.jpeg',
    '/images/logo.png',
    '/images/favicon.ico',
    '/images/android-chrome-192x192.png',
    '/manifest.json',
    '/scripts/index.js',
    '/styles/style.css',
    '/serviceworker.js',
    '/images/splashscreens/apple-icon-180.png',
];

// Data files that should trigger a UI refresh when updated
const dataFiles = [
    '/SalatTimeTable24.json',
    '/english_hijri_mapping.json',
];

const self = this;

function isDataFileRequest(requestUrl) {
    return dataFiles.some(function (filePath) {
        return requestUrl.pathname.endsWith(filePath);
    });
}

function notifyDataUpdated() {
    return self.clients.matchAll().then(function (clients) {
        clients.forEach(function (client) {
            client.postMessage({ type: 'DATA_UPDATED' });
        });
    });
}

// Install SW
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');

                return cache.addAll(assetsToCache);
            })
    )
});

// Listen for requests

// stale while revalidate - notify clients when data files are updated
self.addEventListener('fetch', function (event) {
    var requestUrl = new URL(event.request.url);
    var isHttpRequest = requestUrl.protocol === 'http:' || requestUrl.protocol === 'https:';
    var isSameOriginRequest = requestUrl.origin === self.location.origin;

    if (event.request.method !== 'GET' || !isHttpRequest || !isSameOriginRequest) {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.match(event.request).then(function (response) {
                var isDataFile = isDataFileRequest(requestUrl);
                var fetchPromise = fetch(event.request).then(function (networkResponse) {
                    if (!isDataFile || !response || !networkResponse.ok) {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    }

                    return Promise.all([
                        response.clone().text(),
                        networkResponse.clone().text()
                    ]).then(function (bodies) {
                        cache.put(event.request, networkResponse.clone());
                        if (bodies[0] !== bodies[1]) {
                            return notifyDataUpdated().then(function () {
                                return networkResponse;
                            });
                        }

                        return networkResponse;
                    });
                }).catch(function (error) {
                    if (response) {
                        return response;
                    }

                    throw error;
                });
                return response || fetchPromise;
            });
        }),
    );
});

// Activate the SW
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [];
    cacheWhitelist.push(CACHE_NAME);

    event.waitUntil(
        caches.keys().then((cacheNames) => Promise.all(
            cacheNames.map((cacheName) => {
                if (!cacheWhitelist.includes(cacheName)) {
                    return caches.delete(cacheName);
                }
            })
        ))

    )
});