/* Guarda la app en el teléfono para que abra sin señal.
   Con señal, siempre pide la versión más nueva y la guarda; sin señal, usa la guardada.
   Las llamadas a GitHub (tus registros) nunca pasan por la caché. */
const CACHE = "exponential-2.9";  // igual a la versión de app.js
const SHELL = ["./", "index.html", "styles.css", "app.js", "data/plan.json", "data/plan-base.json", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== "exp-catalogo" && k !== "exp-libro").map(k => caches.delete(k))))  // el catálogo y el libro abiertos desde archivo se quedan
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.hostname === "api.github.com") return;
  const propio = url.origin === self.location.origin;
  const fuentes = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (!propio && !fuentes) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    try {
      const r = await fetch(e.request, {cache: "no-cache"});
      if (r && (r.ok || r.type === "opaque")) c.put(e.request, r.clone());
      return r;
    } catch (err) {
      return (await c.match(e.request, {ignoreSearch: propio})) || new Response("Sin conexión", {status: 503});
    }
  }));
});
