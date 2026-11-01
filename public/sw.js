// Amanora service worker: makes the app installable and usable offline.
const CACHE = "amanora-v1";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./favicon.svg"];
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

  // Our own files + data APIs: show cached copy fast, refresh in the background
  if (url.origin === location.origin || API_HOSTS.test(url.host)) {
    e.respondWith(
      caches.match(req).then((cached) => {
        const fresh = fetch(req).then((r) => {
          if (r && (r.status === 200 || r.type === "opaque")) { const c = r.clone(); caches.open(CACHE).then((x) => x.put(req, c)); }
          return r;
        }).catch(() => cached);
        return cached || fresh;
      })
    );
  }
});
