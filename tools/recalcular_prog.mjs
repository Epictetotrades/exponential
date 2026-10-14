// Recalcula prog.json pasando todos los registros por la misma lógica de la app (app.js),
// en el orden real en que se guardaron (campo «t»). Así la progresión guardada coincide con
// lo que la app calcularía hoy.
// Uso: node recalcular_prog.mjs <carpeta de la app> <carpeta del repo exponential-datos>
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const [appDir, datosDir] = process.argv.slice(2);
const leer = p => JSON.parse(fs.readFileSync(p, "utf8"));

// La app espera un navegador: se le da uno mínimo que no dibuja nada.
const nodo = () => new Proxy(function () {}, {
  get: (t, k) => (k === Symbol.toPrimitive ? () => "" : k === "dataset" ? {} : nodo()),
  set: () => true, apply: () => nodo(),
});
const contexto = {
  console, TextEncoder, TextDecoder, Uint8Array, URL, Blob: class {},
  btoa: s => Buffer.from(s, "binary").toString("base64"), atob: s => Buffer.from(s, "base64").toString("binary"),
  setTimeout: () => 0, clearTimeout: () => {},
  localStorage: {getItem: () => null, setItem: () => {}},
  navigator: {onLine: false},
  document: {querySelector: () => nodo(), querySelectorAll: () => [], addEventListener: () => {}, body: nodo(), activeElement: null},
  window: {addEventListener: () => {}, scrollTo: () => {}},
  fetch: async () => ({json: async () => leer(path.join(appDir, "data", "plan.json"))}),
};
contexto.globalThis = contexto;
vm.createContext(contexto);
vm.runInContext(fs.readFileSync(path.join(appDir, "app.js"), "utf8") + "\n;globalThis.__app = {aplicarProgresion, itemDeClave, get PROG() { return PROG; }, reset() { PROG = {}; progBorrados = []; }, cargar(d) { DATA = d; W = d.semanas; G = d.grupos; P64 = d.p64; }};", contexto);
const app = contexto.__app;
app.cargar(leer(path.join(appDir, "data", "plan.json")));

const todos = [];
for (const f of fs.readdirSync(path.join(datosDir, "semanas")).filter(f => /^w\d+\.json$/.test(f))) {
  const w = Number(f.slice(1, -5)), e = leer(path.join(datosDir, "semanas", f)).e || {};
  for (const [k, en] of Object.entries(e)) if (/^d\d+:/.test(k)) todos.push({w, k, en});
}
todos.sort((a, b) => (a.en.t || 0) - (b.en.t || 0));
app.reset();
for (const {w, k, en} of todos) {
  const it = app.itemDeClave(w, k);
  if (it && en.sets && en.sets.length && !en.omitido) app.aplicarProgresion(w, it, en, k);
}
const antes = leer(path.join(datosDir, "prog.json")).ex || {}, nuevo = app.PROG;
for (const id of new Set([...Object.keys(antes), ...Object.keys(nuevo)])) {
  const a = antes[id], b = nuevo[id];
  if (!a || !b || a.next !== b.next || a.kg !== b.kg || a.w !== b.w)
    console.log(`${id}: ${a ? `${a.kg}→${a.next} S${a.w}` : "—"} ⇒ ${b ? `${b.kg}→${b.next} S${b.w} · ${b.motivo}` : "—"}`);
}
fs.writeFileSync(path.join(datosDir, "prog.json"), JSON.stringify({ex: nuevo, v: 2}, null, 1) + "\n");
console.log(`prog.json: ${Object.keys(nuevo).length} ejercicios`);
