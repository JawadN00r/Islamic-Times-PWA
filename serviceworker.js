const CACHE_NAME = "version-1";
const assetsToCache = [
    '/',
    '/SalatTimeTable24.minify.json',
    '/english_hijri_mapping.json',
    '/index.html',
    '/images/bg.jpeg',
    '/images/logo.png',
    '/manifest.json',
    '/scripts/index.js?cb=1635158803201',
    '/styles/style.css?cb=1635158803201',
    '/serviceworker.js?cb=1635158803201'
];

const self = this;

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
// self.addEventListener('fetch', (event) => {
//     event.respondWith(
//         caches.match(event.request)
//             .then(() => {
//                 return fetch(event.request)
//                     .catch(() => caches.match('index.html'))
//             })
//     )
// });

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.match(event.request).then(function (response) {
                return (
                    fetch(event.request).then(function (response) {
                        cache.put(event.request, response.clone());
                        return response;
                    }) || response
                );
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