const CACHE_NAME = "g9tool-cache-v1";
const urlsToCache = [
  "/G9-Tool-main/",
  "/G9-Tool-main/index.html",
  "/G9-Tool-main/dashboard.html",
  "/G9-Tool-main/admin.html",
  "/G9-Tool-main/fieldManager.html",
  "/G9-Tool-main/tutorial.html",
  "/G9-Tool-main/style.css",
  "/G9-Tool-main/script.js",
  "/G9-Tool-main/auth.js",
  "/G9-Tool-main/js/utils.js",
  "/G9-Tool-main/js/productGenerator.js",
  "/G9-Tool-main/js/admin.js",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css",
  // Add other assets like images, fonts, etc.
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache");
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});


