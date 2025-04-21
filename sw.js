const cacheName = 'v1.0';
const OFFLINE_URL = 'offline.html';

async function cacheOffline() {
    const cache = await caches.open(cacheName);
    await cache.add(OFFLINE_URL);
}

function deleteOldCaches() {
    return caches.keys().then((cacheNames) => {
        return Promise.all(
            cacheNames.map((cache) => {
                if (cache !== cacheName) {
                    return caches.delete(cache);
                }
            })
        );
    });
}

async function onlineOrOffline() {
    try {
        const response = await fetch('/');
        return response.ok;
    } catch (error) {
        return false; 
    }
}

self.addEventListener('install', (event) => {
    event.waitUntil(cacheOffline());
});

self.addEventListener('activate', (event) => {
    event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(OFFLINE_URL);
            })
        );
    } else {
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
    }
});