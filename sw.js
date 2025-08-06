self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("customer-manager").then(cache => {
      return cache.addAll(["index.html", "app.js", "manifest.json", "Icon-192.png", "Icon-512.png"]);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});
