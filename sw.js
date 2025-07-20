const CACHE_NAME = "customer-manager-cache-v1";
const urlsToCache = [
  "index.html",
  "manifest.json",
  "Icon-192.png",
  "Icon-512.png"
];

// Install: cache app files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate: cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch: serve from cache if offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch(() => {
      return new Response("You're offline. Please connect to the internet.", {
        headers: { "Content-Type": "text/html" }
      });
    })
  );
});