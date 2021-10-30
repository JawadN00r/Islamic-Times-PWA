const CACHE_NAME = "version-1";
const assetsToCache = [
    '/',
    '/SalatTimeTable24.minify.json',
    '/english_hijri_mapping.json',
    '/index.html',
    '/images/bg.jpeg',
    '/images/logo.png',
    // '/images/favicon-32x32.png',
    // '/images/browserconfig.xml',
    // '/images/android-chrome-512x512.png',
    '/images/favicon.ico',
    // '/images/safari-pinned-tab.svg',
    // '/images/favicon-16x16.png',
    // '/images/mstile-150x150.png',
    '/images/android-chrome-192x192.png',
    '/manifest.json',
    '/scripts/index.js',
    '/styles/style.css',
    '/serviceworker.js',
    '/images/splashscreens/apple-icon-180.png',
    // '/images/splashscreens/apple-splash-1125-2436.jpg',
    // '/images/splashscreens/apple-splash-1136-640.jpg',
    // '/images/splashscreens/apple-splash-1170-2532.jpg',
    // '/images/splashscreens/apple-splash-1242-2208.jpg',
    // '/images/splashscreens/apple-splash-1242-2688.jpg',
    // '/images/splashscreens/apple-splash-1284-2778.jpg',
    // '/images/splashscreens/apple-splash-1334-750.jpg',
    // '/images/splashscreens/apple-splash-1536-2048.jpg',
    // '/images/splashscreens/apple-splash-1620-2160.jpg',
    // '/images/splashscreens/apple-splash-1668-2224.jpg',
    // '/images/splashscreens/apple-splash-1668-2388.jpg',
    // '/images/splashscreens/apple-splash-1792-828.jpg',
    // '/images/splashscreens/apple-splash-2048-1536.jpg',
    // '/images/splashscreens/apple-splash-2048-2732.jpg',
    // '/images/splashscreens/apple-splash-2160-1620.jpg',
    // '/images/splashscreens/apple-splash-2208-1242.jpg',
    // '/images/splashscreens/apple-splash-2224-1668.jpg',
    // '/images/splashscreens/apple-splash-2388-1668.jpg',
    // '/images/splashscreens/apple-splash-2436-1125.jpg',
    // '/images/splashscreens/apple-splash-2532-1170.jpg',
    // '/images/splashscreens/apple-splash-2688-1242.jpg',
    // '/images/splashscreens/apple-splash-2732-2048.jpg',
    // '/images/splashscreens/apple-splash-2778-1284.jpg',
    // '/images/splashscreens/apple-splash-640-1136.jpg',
    // '/images/splashscreens/apple-splash-750-1334.jpg',
    // '/images/splashscreens/apple-splash-828-1792.jpg',
    // '/images/splashscreens/manifest-icon-192.maskable.png',
    // '/images/splashscreens/manifest-icon-512.maskable.png',
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