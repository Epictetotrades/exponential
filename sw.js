/* Guarda la app en el teléfono para que abra sin señal.
   La app y el plan se sirven desde la caché y se actualizan en segundo plano;
   las llamadas a GitHub (tus registros) nunca pasan por la caché. */
const CACHE = "exponential-v1";
const SHELL = ["./", "index.html", "styles.css", "app.js", "data/plan.json", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.hostname === "api.github.com") return;
  const propio = url.origin === self.location.origin;
  const fuentes = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (!propio && !fuentes) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const enCache = await c.match(e.request, {ignoreSearch: propio});
    const red = fetch(e.request).then(r => { if (r && (r.ok || r.type === "opaque")) c.put(e.request, r.clone()); return r; }).catch(() => null);
    if (enCache) { e.waitUntil(red); return enCache; }
    return (await red) || new Response("Sin conexión", {status: 503});
  }));
});
