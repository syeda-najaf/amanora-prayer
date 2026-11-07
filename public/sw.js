// Amanora service worker: makes the app installable and usable offline.
const CACHE = "amanora-v6-app-look";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./amanora-pwa-192.png", "./amanora-pwa-512.png", "./amanora-maskable-512.png", "./amanora-pwa-180.png", "./favicon.svg"];
const API_HOSTS = /(api\.alquran\.cloud|api\.aladhan\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|mp3quran\.net|bigdatacloud\.net)/;

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.destination === "audio" || req.destination === "video" || req.headers.has("range")) return;
  const url = new URL(req.url);

  // Page loads: network first, fall back to cached app
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then((r) => { const c = r.clone(); caches.open(CACHE).then((x) => x.put("./index.html", c)); return r; })
      .catch(() => caches.match("./index.html")));
    return;
  }

  // App shell assets are cache-first. Live APIs are network-first so prayer
  // times and approved daily content do not remain stale indefinitely.
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((r) => {
        if (r && r.status === 200) {
          const copy = r.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return r;
      }))
    );
    return;
  }

  if (API_HOSTS.test(url.host)) {
    e.respondWith(
      fetch(req).then((r) => {
        if (r && r.status === 200) {
          const copy = r.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return r;
      }).catch(() => caches.match(req))
    );
  }
});

