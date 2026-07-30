// RAAZ4 Service Worker
// Version update karo jab bhi files change ho
const CACHE_NAME = 'raaz4-v1';

// Ye sab files cache hongi
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/home.html',
  '/activity.html',
  '/quiz.html',
  '/privacy.html',
  '/terms.html',
  '/about.html',
  '/manifest.json',
  '/data/topics.js'
];

// Install - files cache karo
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate - purana cache delete karo
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if(key !== CACHE_NAME){
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - cache se serve karo
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache mein mila to wahi do
        if(response){
          return response;
        }
        // Nahi mila to network se lo
        return fetch(event.request)
          .then(networkResponse => {
            // New response cache mein save karo
            if(
              networkResponse &&
              networkResponse.status === 200 &&
              networkResponse.type === 'basic'
            ){
              const responseToCache =
                networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(
                    event.request,
                    responseToCache
                  );
                });
            }
            return networkResponse;
          })
          .catch(() => {
            // Offline hai aur cache mein nahi
            // index.html do fallback mein
            if(event.request.destination === 'document'){
              return caches.match('/index.html');
            }
          });
      })
  );
});
