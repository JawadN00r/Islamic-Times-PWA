const CACHE_NAME = "version-1";
const assetsToCache = [
    '/',
    '/SalatTimeTable24.minify.json',
    '/english_hijri_mapping.json',
    '/index.html',
    '/images/bg.jpeg',
    '/images/logo.png',
    '/images/favicon-32x32.png',
    '/images/browserconfig.xml',
    '/images/apple-touch-icon.png',
    '/images/android-chrome-512x512.png',
    '/images/favicon.ico',
    '/images/safari-pinned-tab.svg',
    '/images/favicon-16x16.png',
    '/images/mstile-150x150.png',
    '/images/android-chrome-192x192.png',
    '/manifest.json',
    '/scripts/index.js',
    '/styles/style.css',
    '/serviceworker.js'
];

const assetsToRequest = [
    '/english_hijri_mapping.json',
    '/index.html',
    '/manifest.json',
    '/scripts/index.js',
    '/styles/style.css',
    '/serviceworker.js'
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

// cache first, if miss fetch

// self.addEventListener('fetch', function (event) {
//     event.respondWith(
//         caches.open(CACHE_NAME).then(function (cache) {
//             return cache.match(event.request).then(function (response) {
//                 return (
//                     response ||
//                     fetch(event.request).then(function (response) {
//                         cache.put(event.request, response.clone());
//                         return response;
//                     })
//                 );
//             });
//         }),
//     );
// });

// stale while revitalate
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.match(event.request).then(function (response) {
                var fetchPromise = fetch(event.request).then(function (networkResponse) {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
                return response || fetchPromise;
            });
        }),
    );
});

// // network first, if network put updated content in cache
// self.addEventListener('fetch', function (event) {
//     event.respondWith(
//         caches.open(CACHE_NAME).then(function (cache) {
//             return cache.match(event.request).then(function (response) {
//                 var fetchPromise = fetch(event.request).then(function (networkResponse) {
//                     cache.put(event.request, networkResponse.clone());
//                     return networkResponse;
//                 });
//                 return fetchPromise || response;
//             });
//         }),
//     );
// });

// // specific assets to fetch
// // network first, if network put updated content in cache
// self.addEventListener('fetch', function (event) {
//     event.respondWith(
//         caches.open(CACHE_NAME).then(function (cache) {
//             return cache.match(event.request).then(function (response) {
//                 var requestedAsset = event.request.url.split(event.request.referrer).pop();
//                 if (!requestedAsset) {
//                     requestedAsset = '/';
//                 } else if (requestedAsset !== '/') {
//                     requestedAsset = "/" + requestedAsset;
//                 }
//                 if (assetsToRequest.includes(requestedAsset)) {
//                     var fetchPromise = fetch(event.request).then(function (networkResponse) {
//                         cache.put(event.request, networkResponse.clone());
//                         return networkResponse;
//                     });
//                     return fetchPromise || response;
//                 } else {
//                     return response;
//                 }

//             });
//         }),
//     );
// });

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