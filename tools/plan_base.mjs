// Plan base para quien entra con su correo: sale de data/plan.json sin lo personal.
// Quita las cargas fijas de accesorios («tu carga de…», «desde tu…»), los números y metas propios
// (1RM 111, AMRAP con 100 kg), el lado izquierdo, el tenis y la semana 11 con días juntos.
// Uso: node tools/plan_base.mjs   (desde la carpeta app) → escribe data/plan-base.json
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const app = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const P = JSON.parse(fs.readFileSync(path.join(app, "data", "plan.json"), "utf8"));
const copia = x => JSON.parse(JSON.stringify(x));

const AMRAP = "AMRAP con el 70 % de tu máximo en banca (la tabla de p.64 da 11–12 reps)";
const NOTAS = {
  11: "Nuevo bloque de fuerza sobre los máximos del test de la S10. Re-test al cierre de la S14.",
  12: "Cargas absolutas más altas que cualquier semana anterior.",
  13: "Pico de la primera ola: las cargas más altas del bloque.",
  14: "Descarga. Re-test 1RM: puedes hacerlo a RPE 8–9 en vez de al fallo y estimar el 1RM (p.118).",
  15: "Segunda ola sobre el máximo del re-test.",
  16: "Acercándose al pico final del bloque.",
  17: "Pico final del bloque.",
  18: `Cierre. Test de 1RM y ${AMRAP}.`,
};
const BLOQUE = {11: "Ola 1 (1)", 12: "Ola 1 (2)", 13: "Ola 1 (pico)", 14: "Descarga y re-test", 15: "Ola 2 (1)", 16: "Ola 2 (2)", 17: "Ola 2 (pico)", 18: "Test"};
const limpiar = t => typeof t !== "string" ? t : t
  .replace(/AMRAP con 100 kg en banca, que es tu meta/g, AMRAP)
  .replace(/el lado izquierdo/g, "el lado más débil").replace(/la pierna izquierda/g, "la pierna más débil")
  .replace(/Tu M3 son dos olas\./g, "Este bloque son dos olas.");

const S11 = P.semanas.find(s => s.w === 11), S15 = P.semanas.find(s => s.w === 15);
// Tu S11 juntó los días 4 y 6. La base usa la semana normal del bloque (la S15 tiene los mismos accesorios),
// con las intensidades de la S11 en los básicos: es la primera ola, más liviana que la S15 (83 % contra 85 %).
function s11Base() {
  const dias = copia(S15.dias), propios = new Map();
  S11.dias.forEach(d => d.items.forEach(it => { if (it.k === "main" && !propios.has(it.slot)) propios.set(it.slot, it); }));
  dias.forEach(d => d.items.forEach(it => {
    const o = it.k === "main" && propios.get(it.slot);
    if (o) for (const k of ["sets", "reps", "pct", "rpe"]) it[k] = o[k];
  }));
  return dias;
}
const base = copia(P);
base.rm_inicial = {};  // cada persona pone los suyos al entrar
base.semanas = base.semanas.map(s => {
  if (s.w === 11) s.dias = s11Base();
  if (NOTAS[s.w]) s.nota = NOTAS[s.w];
  if (BLOQUE[s.w]) { s.bloque = "Fuerza · " + BLOQUE[s.w]; s.etiqueta = BLOQUE[s.w]; s.macro = "Fuerza"; }
  s.nota = limpiar(s.nota); s.nota_libro = limpiar(s.nota_libro);
  s.dias.forEach(d => d.items.forEach(it => {
    delete it.kg; delete it.desde;
    if (it.txt) it.txt = limpiar(it.txt);
    if (it.k === "pot" && / \d+ kg$/.test(it.n)) it.n = it.n.replace(/ \d+ kg$/, "");  // «Kettlebell swing 48 kg»: la pesa es tuya
    if (it.k === "amrap") it.n = it.n.replace(/ · AMRAP con 100 kg$/, " · AMRAP");  // el nombre se ve en Hoy; su carga es el 70 % de su máximo
  }));
  return s;
});

// lo que no debe quedar en el plan base
const txt = JSON.stringify(base);
const restos = ["tu carga", "desde tu", "1RM 111", "bench 111", "100kg", "100 kg", "que es tu meta", "izquierd", "tenis", "M3", "FxM", "48 kg"].filter(x => txt.includes(x));
const s11 = base.semanas[10].dias.flatMap(d => d.items).filter(it => it.k === "main").map(it => `${it.slot} ${it.pct}%`).join(", ");
if (!/banca_p 83%/.test(s11) || !/jalon 75%/.test(s11)) { console.error("La S11 base no quedó con las intensidades de la S11: " + s11); process.exit(1); }
if (restos.length) { console.error("Quedan textos personales: " + restos.join(", ")); process.exit(1); }
fs.writeFileSync(path.join(app, "data", "plan-base.json"), JSON.stringify(base));
console.log(`plan-base.json: ${base.semanas.length} semanas, ${(txt.length / 1024).toFixed(0)} KB, sin textos personales.`);
