const CACHE_NAME = "resinmath-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/river-table-epoxy-calculator/",
  "/river-table-epoxy-calculator/index.html",
  "/resin-coating-calculator/",
  "/resin-coating-calculator/index.html",
  "/resin-mold-volume-calculator/",
  "/resin-mold-volume-calculator/index.html",
  "/resin-mix-ratio-calculator/",
  "/resin-mix-ratio-calculator/index.html",
  "/resin-cost-calculator/",
  "/resin-cost-calculator/index.html",
  "/404.html",
  "/favicon.svg",
  "/assets/css/style.css",
  "/assets/img/resin-hero.jpg",
  "/assets/js/common.js",
  "/assets/js/river.js",
  "/assets/js/coating.js",
  "/assets/js/mold.js",
  "/assets/js/mix.js",
  "/assets/js/cost.js",
  "/manifest.json"
];

// Install: Cache all static assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: Serve from cache first, fallback to network
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const toCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
        return response;
      }).catch(() => {
        if (event.request.mode === "navigate") {
          return caches.match("/404.html");
        }
      });
    })
  );
});
