"use strict";
/* Exponential · app de entrenamiento.
   El plan (52 semanas) viene de data/plan.json. Los registros se guardan en este
   teléfono al instante y se suben a tu repositorio privado de GitHub cuando hay señal.
   Formato de los registros: igual que en el artefacto anterior (wNN = {e: {"d3:remo": {...}}}). */

/* ── utilidades ── */
const $ = (s, r = document) => r.querySelector(s);
const esc = t => String(t ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const f = x => (Math.round(x * 10) / 10).toString().replace(".", ",");
const kg = x => f(x) + " kg";
const r25 = x => Math.round(x / 2.5) * 2.5;
const r05 = x => Math.round(x * 2) / 2;
const num = v => { const n = parseFloat(String(v ?? "").replace(",", ".")); return isNaN(n) ? null : n; };
const ICON = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
};

/* ── constantes del plan ── */
let DATA = null, W = [], G = [], P64 = [];
const TESTS = [10, 14, 18, 31, 44, 52];
const LIFTS = [["banca", "Banca"], ["sentadilla", "Sentadilla"], ["peso_muerto", "Peso muerto"]];
const TRAMOS = [
  {d: "S1–S18", s: "hoy", desde: 1, hasta: 18},
  {d: "S19–S31", s: "test S18", desde: 19, hasta: 31},
  {d: "S32–S44", s: "test S31", desde: 32, hasta: 44},
  {d: "S45–S52", s: "test S44", desde: 45, hasta: 52},
  {d: "Año 2", s: "test S52", desde: 53, hasta: 99},
];
const CICLOS = [
  {id: "C1", n: "Ciclo 1", d: "S1–S10 Pirámide · S11–S18 tu fuerza renovada", w: [1, 18]},
  {id: "C2", n: "Ciclo 2 · Hipertrofia", d: "tablas de culturismo avanzado, p.268–272", w: [19, 31]},
  {id: "C3", n: "Ciclo 3 · Fuerza", d: "tablas de powerlifting avanzado, p.265–267", w: [32, 44]},
  {id: "C4", n: "Ciclo 4 · Cierre del año", d: "el ciclo de 8 semanas de p.132", w: [45, 52]},
];
const COLOR = {acc: "var(--f-acc)", pico: "var(--f-pico)", intro: "var(--f-intro)", int: "var(--f-int)",
  desc: "var(--f-desc)", taper: "var(--f-taper)", taper1: "var(--f-taper)", taper2: "var(--f-taper)", test: "var(--f-test)"};
const VIEJO_COL = {"#4f7a6e": "#5e7568", "#7a6430": "#7a6c4e", "#7a3040": "#7c5258", "#3a4a5a": "#3e4247",
  "#3a5a7a": "#4c5f72", "#4a6a8a": "#56677a", "#5a7a9a": "#64758a", "#4a8c7c": "#5f7f78"};
const NOPROG = ["desc", "taper", "taper1", "taper2", "test"];
const COMPUESTOS = new Set(["bulgara", "inclinado", "militar", "rumano", "prensa", "remo", "jalon", "cerrado", "fondos", "zancadas"]);
const ALT = {
  sentadilla: {c: "el día que la estabilidad o la espalda baja estén flojas: la máquina sostiene el tronco. Barra de seguridad si molestan hombros o codos", op: [["hack", "Hack squat"], ["sent_smith", "Sentadilla en Smith"], ["sent_safety", "Sentadilla con barra de seguridad"]]},
  pausa: {c: "si la espalda baja está cargada", op: [["hack_pausa", "Hack squat con pausa"]]},
  banca: {c: "si el hombro o la estabilidad fallan. Mejor solo en el día de volumen: en el pesado, la barra libre es lo que entrena tu test", op: [["press_pecho_maq", "Press de pecho en máquina"], ["banca_smith", "Press de banca en Smith"]]},
  peso_muerto: {c: "si la espalda baja está cargada", op: [["pm_hex", "Peso muerto con barra hexagonal"], ["hipthrust_maq", "Hip thrust en máquina"]]},
  rumano: {c: "isquios y glúteo con menos carga en la espalda baja", op: [["hiper45", "Hiperextensión a 45°"], ["ghd_cadera", "Extensión de cadera en GHD"]]},
  inclinado: {c: "si los hombros están inestables", op: [["inclinado_smith", "Press inclinado en Smith"]]},
  militar: {c: "si el tronco o la estabilidad fallan", op: [["militar_smith", "Press de hombro sentado en Smith"]]},
  cerrado: {c: "si la muñeca o el hombro molestan", op: [["cerrado_smith", "Press cerrado en Smith"]]},
  laterales: {c: "la máquina es tu preferida", op: [["lateral_maq", "Elevación lateral en máquina"], ["lateral_polea", "Elevación lateral en polea baja"]]},
  polea: {c: "", op: [["triceps_sobre_cabeza", "Extensión de tríceps sobre la cabeza en polea"]]},
  frances: {c: "si el codo molesta", op: [["triceps_sobre_cabeza", "Extensión de tríceps sobre la cabeza en polea"]]},
  prensa: {c: "", op: [["hack", "Hack squat"]]},
  femoral: {c: "si la máquina está ocupada; es más exigente, baja las series", op: [["nordico_ghd", "Curl nórdico asistido en GHD"]]},
  extension: {c: "si la máquina está ocupada", op: [["extension_polea", "Extensión de cuádriceps en polea"]]},
  gemelo_pie: {c: "", op: [["gemelo_smith", "Gemelos de pie en Smith"], ["gemelo_hack", "Gemelos en hack"]]},
  gemelo_sent: {c: "", op: [["gemelo_prensa", "Gemelos en prensa 45°"]]},
  remo: {c: "cuando la espalda baja o los isquios estén cargados", op: [["remo_pecho", "Remo con apoyo en el pecho"], ["remo_polea", "Remo en polea sentado"]]},
  jalon: {c: "", op: [["jalon_v", "Jalón agarre en V"], ["jalon_ancho", "Jalón agarre ancho"], ["dominada_banda", "Dominadas con banda"]]},
  curl_z: {c: "", op: [["curl_maq", "Curl de bíceps en máquina"]]},
  martillo: {c: "", op: [["martillo_polea", "Curl martillo en polea con cuerda"]]},
  predicador: {c: "", op: [["curl_maq", "Curl de bíceps en máquina"], ["scott_mancuerna", "Curl Scott con mancuerna a un brazo"]]},
  facepull: {c: "", op: [["pajaros_inclinado", "Pájaros en banco inclinado"], ["pecdeck_inv", "Pec deck invertido"]]},
  posteriores: {c: "", op: [["facepull", "Face pull en polea"], ["pecdeck_inv", "Pec deck invertido"]]},
  pecdeck: {c: "", op: [["aperturas_polea", "Aperturas en cruce de poleas"]]},
  zancadas: {c: "más estable", op: [["bulgara_smith", "Búlgara en Smith"]]},
  bulgara: {c: "más estable", op: [["bulgara_smith", "Búlgara en Smith"], ["prensa_unilateral", "Prensa 45° a una pierna"]]},
  copenhagen: {c: "", op: [["aductor_maq", "Aductores en máquina"]]},
  pallof: {c: "", op: [["pallof_banda", "Pallof press con banda"]]},
};

/* ── estado local ── */
const STORE = "exp-app-v1", CFG = "exp-cfg-v1";
let st = {actual: 13, rm: [{}, {}, {}, {}, {}], jalon: "", peso: ""};
let LOG = {}, PROG = {};
let dirty = {estado: false, prog: false, weeks: {}};
let cfg = {owner: "Epictetotrades", repo: "exponential-datos", token: ""};
let lastSync = null;
const ui = {tab: "hoy", week: 13, day: 0, mas: "bloques", dayTouched: false};
const loaded = {};
let sheet = null;

function readStore() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE) || "null");
    if (s) {
      st = Object.assign(st, s.st || {}); LOG = s.LOG || {}; PROG = s.PROG || {};
      dirty = Object.assign({estado: false, prog: false, weeks: {}}, s.dirty || {});
      lastSync = s.lastSync || null;
      if (s.ui) { ui.week = s.ui.week || st.actual; ui.mas = s.ui.mas || "bloques"; }
    }
    const c = JSON.parse(localStorage.getItem(CFG) || "null");
    if (c) cfg = Object.assign(cfg, c);
  } catch (e) {}
  if (!Array.isArray(st.rm) || st.rm.length < 5) st.rm = [{}, {}, {}, {}, {}];
}
function saveStore() {
  try {
    localStorage.setItem(STORE, JSON.stringify({st, LOG, PROG, dirty, lastSync, ui: {week: ui.week, mas: ui.mas}}));
    return true;
  } catch (e) { return false; }
}
function saveCfg() { try { localStorage.setItem(CFG, JSON.stringify(cfg)); } catch (e) {} }

/* ── sincronización con GitHub ── */
const conectado = () => !!(cfg.token && cfg.owner && cfg.repo);
let syncState = "local";
function setSync(s, msg) {
  syncState = s;
  const b = $("#sync"); if (!b) return;
  b.dataset.s = s;
  $("#sync-txt").textContent = {local: "Local", ok: "Al día", saving: "Guardando", offline: "Sin señal", error: "Revisar"}[s] || s;
  b.title = msg || "";
  if (ui.tab === "mas" && ui.mas === "datos" && !sheet) renderMas();
}
function b64enc(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
function b64dec(b64) {
  const bin = atob(String(b64).replace(/\s/g, ""));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
function gh(url, opt = {}) {
  return fetch(url, Object.assign({cache: "no-store"}, opt, {
    headers: Object.assign({
      Accept: "application/vnd.github+json",
      Authorization: "Bearer " + cfg.token,
      "X-GitHub-Api-Version": "2022-11-28",
    }, opt.body ? {"Content-Type": "application/json"} : {}),
  }));
}
const contentsUrl = p => `https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/${p}`;
async function httpErr(r) {
  let m = ""; try { m = (await r.json()).message || ""; } catch (e) {}
  const e = new Error(`GitHub respondió ${r.status}${m ? ": " + m : ""}`);
  e.status = r.status; return e;
}
async function getFile(path) {
  const r = await gh(contentsUrl(path));
  if (r.status === 404) return {sha: null, data: null};
  if (!r.ok) throw await httpErr(r);
  const j = await r.json();
  return {sha: j.sha, data: JSON.parse(b64dec(j.content))};
}
async function putFile(path, data, sha) {
  const body = {message: "app: " + path, content: b64enc(JSON.stringify(data, null, 1))};
  if (sha) body.sha = sha;
  const r = await gh(contentsUrl(path), {method: "PUT", body: JSON.stringify(body)});
  if (r.status === 409 || r.status === 422) { const e = new Error("conflicto"); e.conflict = true; throw e; }
  if (!r.ok) throw await httpErr(r);
}
const weekPath = w => `semanas/w${w}.json`;

let chain = Promise.resolve();
const enCola = fn => (chain = chain.catch(() => {}).then(fn));
let flushTimer = null;
function pedirGuardado(ms = 700) {
  saveStore();
  if (!conectado()) { setSync("local", "Guardado en este teléfono"); return; }
  setSync("saving", "Guardando…");
  clearTimeout(flushTimer);
  flushTimer = setTimeout(() => enCola(flush), ms);
}
const pendientes = () => (dirty.estado ? 1 : 0) + (dirty.prog ? 1 : 0) + Object.keys(dirty.weeks).length;
function errorDeRed(e) { return e instanceof TypeError || !navigator.onLine; }

async function flush() {
  if (!conectado()) return;
  if (!pendientes()) { setSync("ok", "Todo guardado en tu cuenta"); return; }
  if (!navigator.onLine) { setSync("offline", "Sin señal: guardado en el teléfono; se sube al volver"); return; }
  setSync("saving", "Guardando…");
  try {
    if (dirty.estado) {
      const r = await getFile("estado.json");
      await putFile("estado.json", {rm: st.rm, jalon: st.jalon, actual: st.actual, peso: st.peso || ""}, r.sha);
      dirty.estado = false;
    }
    if (dirty.prog) {
      const r = await getFile("prog.json");
      PROG = Object.assign({}, (r.data && r.data.ex) || {}, PROG);
      await putFile("prog.json", {ex: PROG, v: 2}, r.sha);
      dirty.prog = false;
    }
    for (const w of Object.keys(dirty.weeks)) {
      for (let intento = 0; ; intento++) {
        const r = await getFile(weekPath(w));
        LOG[w] = mezclar(LOG[w], r.data ? migrar(+w, r.data.e || {}) : {});
        try { await putFile(weekPath(w), {e: LOG[w], v: 2}, r.sha); break; }
        catch (e) { if (!e.conflict || intento >= 2) throw e; }
      }
      delete dirty.weeks[w];
    }
    lastSync = Date.now();
    saveStore();
    setSync("ok", "Guardado en tu cuenta");
  } catch (e) {
    saveStore();
    if (errorDeRed(e)) setSync("offline", "Sin señal: guardado en el teléfono; se sube al volver");
    else setSync("error", e.message);
  }
}
async function cargarSemana(w, forzar) {
  if (!conectado() || (!forzar && loaded[w])) return;
  loaded[w] = true;
  try {
    const r = await getFile(weekPath(w));
    if (r.data) {
      LOG[w] = mezclar(LOG[w], migrar(w, r.data.e || {}));
      saveStore();
      if (!sheet && (ui.week === w || ui.tab === "semana")) render();
    }
  } catch (e) { loaded[w] = false; }
}
async function pull() {
  if (!conectado()) { setSync("local", "Guardado solo en este teléfono"); return; }
  if (!navigator.onLine) { setSync("offline", "Sin señal"); return; }
  setSync("saving", "Leyendo tu cuenta…");
  try {
    const e = await getFile("estado.json");
    if (e.data && !dirty.estado) {
      const v = e.data;
      if (Array.isArray(v.rm)) st.rm = v.rm;
      if (v.jalon != null) st.jalon = v.jalon;
      if (v.actual) st.actual = v.actual;
      if (v.peso != null) st.peso = v.peso;
    }
    const p = await getFile("prog.json");
    if (p.data) PROG = dirty.prog ? Object.assign({}, p.data.ex || {}, PROG) : (p.data.ex || {});
    const semanas = [...new Set([st.actual, ui.week, st.actual - 1].filter(w => w >= 1 && w <= 52))];
    await Promise.all(semanas.map(w => cargarSemana(w, true)));
    saveStore();
    if (!ui.dayTouched) { ui.week = st.actual; autoDia(); }
    if (!sheet) render();
    if (pendientes()) await flush(); else setSync("ok", "Al día con tu cuenta");
  } catch (err) {
    if (errorDeRed(err)) setSync("offline", "Sin señal: usando lo guardado en el teléfono");
    else setSync("error", err.message);
  }
}
async function conectar(owner, repo, token) {
  const r = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, {
    cache: "no-store", headers: {Accept: "application/vnd.github+json", Authorization: "Bearer " + token},
  });
  if (r.status === 401) throw new Error("La clave no es válida o ya venció.");
  if (r.status === 404) throw new Error("No encuentro ese repositorio con esa clave. Revisa que la clave tenga acceso a él.");
  if (!r.ok) throw new Error("GitHub respondió " + r.status);
  cfg = {owner, repo, token};
  saveCfg();
  Object.keys(loaded).forEach(k => delete loaded[k]);
  await pull();
}

/* ── números (tabla de p.64) ── */
function pctDeReps(n) {
  if (n <= 1) return 100;
  for (let i = 0; i < P64.length - 1; i++) {
    const [r0, p0] = P64[i], [r1, p1] = P64[i + 1];
    if (n <= r1) return p0 + (p1 - p0) * (n - r0) / (r1 - r0);
  }
  return 70 - 2.5 * (n - 11.5);
}
function repsDePct(p) {
  if (p >= 100) return 1;
  for (let i = 0; i < P64.length - 1; i++) {
    const [r0, p0] = P64[i], [r1, p1] = P64[i + 1];
    if (p >= p1) return r0 + (r1 - r0) * (p0 - p) / (p0 - p1);
  }
  return 11.5 + (70 - p) / 2.5;
}
function repsTxt(x) { const a = Math.floor(x + 0.25), b = Math.ceil(x - 0.25); return a === b ? String(a) : a + "–" + b; }
function rango(r) { const m = String(r).split(/[–-]/).map(Number).filter(x => !isNaN(x)); return [m[0], m[m.length - 1]]; }
function e1rm(x) { const k = +x.kg, r = +x.reps, rp = +x.rpe; if (!k || !r || !rp) return 0; return k * 100 / pctDeReps(r + (10 - rp)); }
function tramo(w) { return TRAMOS.findIndex(t => w >= t.desde && w <= t.hasta); }
function rmDe(w, lift) {
  if (lift === "jalon") return Number(st.jalon) || DATA.rm_inicial.jalon;
  for (let i = tramo(w); i >= 0; i--) { const v = Number(st.rm[i] && st.rm[i][lift]); if (v > 0) return v; }
  return DATA.rm_inicial[lift];
}
function descanso(it) {
  if (it.k === "single") return "3–5 min";
  if (it.k === "main") return (Number(it.reps) || 5) <= 6 ? "3–5 min" : "2–3 min";
  if (it.k === "pot") return /sprint/i.test(it.n) ? "2–3 min" : "2 min";
  if (it.k === "acc") { if (it.aps) return "1 min en par"; return COMPUESTOS.has(it.ex) ? "2–3 min" : "1–2 min"; }
  return "";
}

/* ── registros ── */
const slug = t => String(t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
const idItem = it => it.slot || it.ex || slug(it.n);
const claveDe = (did, it) => did + ":" + idItem(it);
const nombrePlan = it => it.n.replace(/ \((pesado|volumen)\)$/, "").replace(/ · .*$/, "");
function itemDeClave(w, key) {
  const s = W[w - 1]; if (!s || !s.dias) return null;
  const [did, id] = key.split(":");
  const d = s.dias.find(d => d.id === did);
  return d && d.items.find(it => idItem(it) === id);
}
function migrar(w, e) {
  if (!e || typeof e !== "object") return {};
  const s = W[w - 1], out = {};
  for (const [k, v] of Object.entries(e)) {
    let nk = k;
    if (/^d\d+~\d+$/.test(k) && s && s.dias) {
      const [did, j] = k.split("~"); const d = s.dias.find(d => d.id === did); const it = d && d.items[+j];
      if (it) nk = claveDe(did, it);
    }
    if (v && typeof v === "object" && !Array.isArray(v) && v.nota && !v.hecho) v.hecho = {id: "otro:" + slug(v.nota), n: v.nota};
    if (!(nk in out) || ((v && v.t) || 0) >= ((out[nk] && out[nk].t) || 0)) out[nk] = v;
  }
  return out;
}
function mezclar(a, b) {
  const out = Object.assign({}, b || {});
  a = a || {};
  const del = [...new Set([...(out._del || []), ...(a._del || [])])];
  for (const k of Object.keys(a)) {
    if (k === "_del") continue;
    if (k.startsWith("x~")) {
      const vistos = new Map();
      [...(out[k] || []), ...(a[k] || [])].forEach(x => vistos.set(x.t, x));
      out[k] = [...vistos.values()].sort((x, y) => x.t - y.t);
    } else if (!out[k] || (a[k] && (a[k].t || 0) >= (out[k].t || 0))) out[k] = a[k];
  }
  for (const k of Object.keys(out)) if (k.startsWith("x~")) out[k] = out[k].filter(x => !del.includes(x.t));
  if (del.length) out._del = del;
  return out;
}
const opcionesHecho = it => [[it.ex, nombrePlan(it) + " (plan)"]].concat(ALT[it.ex] ? ALT[it.ex].op : []);
const hechoDe = (prev, it) => prev && prev.hecho ? prev.hecho : {id: it.ex, n: nombrePlan(it)};
const registrado = prev => !!(prev && (prev.omitido || (prev.sets && prev.sets.length)));
function cargaSugerida(s, it, hid) {
  if (hid && hid !== it.ex) { const p = PROG[hid]; return p ? (p.next || p.kg || "") : ""; }
  let planKg = "";
  if (it.k === "main") planKg = r25(rmDe(s.w, it.lift) * it.pct / 100);
  else if (it.k === "amrap") planKg = 100;
  else if (it.k === "single") planKg = r25(rmDe(s.w, it.lift) * 0.9);
  else if (it.kg) planKg = it.kg;
  const pr = it.k === "acc" && PROG[it.ex];
  if (pr && pr.w < s.w && pr.reps === String(it.reps) && pr.next) planKg = pr.next;
  return planKg;
}
function aplicarProgresion(w, it, entry, key) {
  const s = W[w - 1];
  if (it.k !== "acc" || NOPROG.includes(s.tipo) || !entry.sets.length) return;
  const [lo, hi] = rango(it.reps), rpeMax = it.rpe ? rango(it.rpe)[1] : 10;
  const carga = Math.max(...entry.sets.map(x => x.kg));
  if (!carga) return;
  const inc = /mancuerna|laterales|posteriores|pájaros/i.test(entry.hecho.n) ? 2 : 2.5;
  const repsTope = entry.sets.every(x => x.reps >= hi);
  const tope = repsTope && entry.sets.every(x => x.rpe == null || x.rpe <= rpeMax);
  const bajo = entry.sets.some(x => x.reps < lo);
  const next = tope ? carga + inc : bajo ? Math.max(0, carga - inc) : carga;
  const motivo = tope ? `llegaste al tope de ${hi} reps en todas las series`
    : bajo ? `quedaste bajo ${lo} reps en alguna serie`
    : repsTope ? `llegaste a ${hi} reps, pero con RPE sobre ${f(rpeMax)}: repite la carga`
    : `aún no llegas a ${hi} reps en todas`;
  PROG[entry.hecho.id] = {w, reps: String(it.reps), kg: carga, next, motivo, n: entry.hecho.n, key};
  dirty.prog = true;
}
function resumen(sets) {
  if (!sets || !sets.length) return "";
  const uno = x => (x.kg ? f(x.kg) + " × " : "") + x.reps + (x.kg ? "" : " reps");
  const iguales = sets.every(x => x.kg === sets[0].kg && x.reps === sets[0].reps);
  const rpes = sets.map(x => x.rpe).filter(x => x != null);
  const base = iguales ? `${uno(sets[0])} · ${sets.length} ${sets.length === 1 ? "serie" : "series"}` : sets.map(uno).join(" · ");
  return base + (rpes.length ? ` · RPE ${rpes.map(f).join(", ")}` : "");
}
/* S1–S10 se rediseñaron con la Pirámide cuando ya habían pasado: quedan como plantilla, no como pendientes. */
const esPlantilla = w => w <= 10 && w < st.actual;
function estadoItem(s, it, prev) {
  if (registrado(prev)) {
    if (prev.omitido) return ["omi", "No lo hice"];
    const h = hechoDe(prev, it);
    if (h.id !== it.ex) return ["cam", "Cambio"];
    const n = it.k === "single" || it.k === "amrap" ? 1 : +it.sets || 1;
    return prev.sets.length < n ? ["par", "Parcial"] : ["ok", "Hecho"];
  }
  if (esPlantilla(s.w)) return ["pend", "Plantilla"];
  if (s.w < st.actual) return ["fal", "Falta"];
  return ["pend", s.w === st.actual ? "Por hacer" : "Pendiente"];
}
function guardarEntrada(w, key, entry, it) {
  LOG[w] = LOG[w] || {};
  const prev = LOG[w][key];
  const idPrev = prev && prev.hecho && prev.hecho.id;
  if (idPrev && idPrev !== (entry.hecho && entry.hecho.id) && PROG[idPrev] && PROG[idPrev].key === key && PROG[idPrev].w === w) { delete PROG[idPrev]; dirty.prog = true; }
  LOG[w][key] = entry;
  if (it) aplicarProgresion(w, it, entry, key);
  dirty.weeks[w] = true;
  pedirGuardado(300);
}

/* ── textos del plan ── */
function colorSemana(s) {
  if (s.viejo) return VIEJO_COL[s.color] || s.color;
  if (s.tipo === "acc" && s.k === 0) return COLOR.intro;
  if (s.tipo === "acc" && s.ciclo === "C2" && s.k >= 3) return COLOR.pico;
  return COLOR[s.tipo] || "var(--f-desc)";
}
function etiqueta(s) { return s.viejo ? s.bloque : s.etiqueta + (s.pos ? " " + s.pos : ""); }
function ciclo(s) { return CICLOS.find(c => s.w >= c.w[0] && s.w <= c.w[1]); }
function planTxt(s, it) {
  if (it.k === "main") return `${it.sets} × ${it.reps} · ${kg(r25(rmDe(s.w, it.lift) * it.pct / 100))} · RPE ${it.rpe}`;
  if (it.k === "single") { const rm = rmDe(s.w, it.lift); return `${kg(r25(rm * .8))} → ${kg(r25(rm * .9))} → single a RPE ${it.rpe}`; }
  if (it.k === "amrap") return "1 serie al máximo con 100 kg";
  if (it.k === "pot") return it.pres + (it.pct ? " · " + kg(r25(rmDe(s.w, it.lift) * it.pct / 100)) : "");
  const pr = PROG[it.ex], usaReg = pr && pr.w < s.w && pr.reps === String(it.reps) && pr.next;
  const carga = it.pc ? " · peso corporal" : usaReg ? ` · ≈ ${kg(pr.next)}` : it.kg ? ` · ≈ ${kg(it.kg)}` : "";
  return `${it.sets} × ${it.reps}${carga} · RPE ${it.rpe}`;
}
function detalleTxt(s, it) {
  const sub = [];
  if (it.k === "main") {
    const rm = rmDe(s.w, it.lift), carga = r25(rm * it.pct / 100);
    sub.push(`${f(it.pct)} % de ${f(rm)}. Si la primera serie no cae en ese RPE, ajusta la carga (p.246).`);
    if (it.ola_cond) sub.push(`Segunda ola: si la primera te quedó bajo el RPE, usa ${kg(carga + it.ola_cond)} (p.243).`);
  } else if (it.k === "single") {
    sub.push(`Sube por el 80 % y el 90 % de ${f(rmDe(s.w, it.lift))}; el último, a RPE 8–9, sin llegar al fallo (p.118). Anota carga y RPE y la app estima tu máximo.`);
  } else if (it.k === "amrap") {
    const b = rmDe(s.w, "banca");
    sub.push(`Tu meta. Con asistente o barras de seguridad: aquí el fallo tiene un propósito (p.67). Con un 1RM de ${f(b)}, la tabla de p.64 da ≈ ${repsTxt(repsDePct(100 / b * 100))} reps.`);
  } else if (it.k === "acc") {
    const pr = PROG[it.ex], usaReg = pr && pr.w < s.w && pr.reps === String(it.reps) && pr.next;
    if (usaReg) sub.push(`Según tu registro de S${pr.w} (${kg(pr.kg)}): ${pr.motivo}.`);
    else if (pr && pr.w < s.w) sub.push(`Tu última vez: ${kg(pr.kg)} en S${pr.w}, con otro rango de reps; ajusta por RPE.`);
    else if (it.desde) sub.push(it.desde.charAt(0).toUpperCase() + it.desde.slice(1) + (it.desde.startsWith("desde") ? " (convertida con la tabla de p.64)." : "."));
    else if (!it.pc) sub.push("Elige la carga que te deje en ese RPE.");
    if (it.aps) sub.push(`En par con ${it.aps}, ~1 min entre series (p.179).`);
    if (it.lado) sub.push("Por lado: anota cada lado y empieza por el más débil.");
  }
  const a = ALT[it.ex];
  if (a) sub.push(`Si hoy no va: ${a.op.map(o => o[1]).join(" o ")}${a.c ? " — " + a.c : ""}. Elígela en «Hiciste» y carga por RPE.`);
  return sub;
}

/* ── render: cabecera ── */
function weekNav() {
  const s = W[ui.week - 1];
  return `<div class="wk">
    <button class="circ" data-step="-1" aria-label="Semana anterior" ${s.w === 1 ? "disabled" : ""}>${ICON.back}</button>
    <div class="wk-mid">
      <div class="wk-lbl"><span>Semana ${s.w}</span><span class="mut">de 52</span></div>
      <div class="wk-bar"><i style="width:${(s.w / 52 * 100).toFixed(1)}%"></i></div>
    </div>
    <button class="circ" data-step="1" aria-label="Semana siguiente" ${s.w === 52 ? "disabled" : ""}>${ICON.next}</button>
  </div>${s.w !== st.actual ? `<button class="link-btn" data-today>Volver a la semana ${st.actual}</button>` : ""}`;
}
function itemsEj(d) { return d.items.filter(it => ["main", "acc", "single", "amrap"].includes(it.k)); }
function dayNav(s) {
  return `<nav class="days" aria-label="Días">${s.dias.map((d, i) => {
    const ej = itemsEj(d), log = LOG[s.w] || {};
    const hechos = ej.filter(it => registrado(log[claveDe(d.id, it)])).length;
    const pct = ej.length ? Math.round(hechos / ej.length * 100) : 0;
    return `<button class="day" data-day="${i}" aria-pressed="${i === ui.day}" aria-label="Día ${i + 1}: ${esc(d.n)}">D${i + 1}<i><b style="width:${pct}%"></b></i></button>`;
  }).join("")}</nav>`;
}
function header() {
  const s = W[ui.week - 1];
  let eb = "Exponential", title = "", sub = "", extra = "";
  const wl = `S${s.w} · ${etiqueta(s)}${s.w === st.actual ? " · ahora" : ""}`;
  if (ui.tab === "hoy") {
    const d = s.dias[ui.day], ej = itemsEj(d), log = LOG[s.w] || {};
    const regs = ej.map(it => log[claveDe(d.id, it)]).filter(registrado);
    const series = regs.reduce((a, x) => a + (x.sets ? x.sets.length : 0), 0);
    eb = wl; title = d.n;
    sub = !ej.length ? "Sin ejercicios con series este día"
      : esPlantilla(s.w) && !regs.length ? `Plantilla de la Pirámide · ${ej.length} ejercicios`
      : s.w > st.actual && !regs.length ? `${ej.length} ejercicios por hacer`
      : `${regs.length} de ${ej.length} ejercicios · ${series} series`;
    extra = weekNav() + dayNav(s);
  } else if (ui.tab === "semana") {
    eb = wl; title = `Semana ${s.w}`; sub = `${ciclo(s).n} · ${etiqueta(s)}`; extra = weekNav();
  } else if (ui.tab === "ano") {
    title = "Tu año"; sub = `Vas en la semana ${st.actual}. Toca una semana para abrirla.`;
  } else {
    title = {bloques: "Bloques del año", volumen: "Volumen por músculo", reglas: "Reglas y herramientas", datos: "Tus datos"}[ui.mas];
    sub = {bloques: "Qué hace cada bloque y de qué página sale.", volumen: "Series por músculo, semana a semana.", reglas: "Checklist, calculadoras y las reglas del plan.", datos: "Dónde se guarda tu registro."}[ui.mas];
    extra = `<div class="seg" role="group" aria-label="Secciones">${[["bloques", "Bloques"], ["volumen", "Volumen"], ["reglas", "Reglas"], ["datos", "Datos"]].map(([id, n]) => `<button data-mas="${id}" aria-pressed="${ui.mas === id}">${n}</button>`).join("")}</div>`;
  }
  $("#h-eyebrow").textContent = eb;
  $("#h-title").textContent = title;
  $("#h-sub").textContent = sub;
  $("#h-extra").innerHTML = extra;
}

/* ── render: Hoy ── */
function itemRow(s, d, it) {
  if (it.k === "nota") return `<div class="row nota"><b>${esc(it.n)}</b><span>${esc(it.txt)}</span></div>`;
  if (it.k === "pot") return `<div class="row"><div class="ex-head"><div class="ex-name"><span class="tags"><span class="tag m">Potencia · descanso ${descanso(it)}</span></span><b>${esc(it.n)}</b></div></div>
    <div class="grid2" style="margin-top:8px"><span class="k">PLAN</span><span class="v">${esc(planTxt(s, it))}</span></div>${it.txt ? `<p class="small mut" style="margin:6px 0 0 58px">${esc(it.txt)}</p>` : ""}</div>`;
  const key = claveDe(d.id, it), prev = (LOG[s.w] || {})[key];
  const [cls, txt] = estadoItem(s, it, prev);
  const tags = [];
  if (["main", "single", "amrap"].includes(it.k)) tags.push('<span class="tag">Básico</span>');
  if (it.prio) tags.push('<span class="tag">Prioridad</span>');
  tags.push(`<span class="tag m">Descanso ${descanso(it)}</span>`);
  let hecho = "";
  if (registrado(prev)) {
    const h = hechoDe(prev, it);
    hecho = prev.omitido ? `<span class="k">HECHO</span><span class="v">No lo hiciste</span>`
      : `<span class="k">HECHO</span><span class="v strong">${h.id !== it.ex ? esc(h.n) + ": " : ""}${esc(resumen(prev.sets))}</span>`;
  }
  let fb = "";
  if (registrado(prev) && !prev.omitido) {
    const h = hechoDe(prev, it);
    if (h.id === it.ex && ["main", "single", "amrap"].includes(it.k) && it.ex !== "pausa") {
      const lift = it.lift || "banca", est = Math.max(0, ...prev.sets.map(e1rm));
      if (est) {
        const actual = rmDe(s.w, lift), v = r05(est);
        fb = `<div class="feedback">Tu registro estima un máximo de ≈ ${kg(v)} (usas ${kg(actual)}).${Math.abs(v - actual) / actual >= 0.02 ? ` <button class="link-btn" data-setrm="${lift}" data-v="${v}" data-w="${s.w}">Usar ${kg(v)} como máximo</button>` : ""}</div>`;
      } else fb = `<div class="feedback">Anota el RPE de alguna serie para estimar tu máximo.</div>`;
    }
    if (it.k === "acc" && PROG[h.id] && PROG[h.id].w === s.w) fb = `<div class="feedback">Próxima vez en ${esc(h.n)}: <b class="mono">${kg(PROG[h.id].next)}</b> · ${esc(PROG[h.id].motivo)}.</div>`;
  }
  const det = detalleTxt(s, it);
  return `<div class="row">
    <button class="ex" data-open="${esc(key)}">
      <div class="ex-head"><div class="ex-name"><span class="tags">${tags.join("")}</span><b>${esc(it.n)}</b></div><span class="chip ${cls}">${txt}</span></div>
      <div class="grid2"><span class="k">PLAN</span><span class="v">${esc(planTxt(s, it))}</span>${hecho}</div>
      ${prev && prev.com ? `<span class="quote">“${esc(prev.com)}”</span>` : ""}
    </button>
    ${fb ? `<div style="margin-top:10px">${fb}</div>` : ""}
    ${det.length ? `<details class="more"><summary>Detalles</summary><div>${det.map(esc).join("<br>")}</div></details>` : ""}
  </div>`;
}
function renderHoy() {
  const s = W[ui.week - 1], d = s.dias[ui.day], log = LOG[s.w] || {};
  const extras = log["x~" + d.id] || [];
  const nd = log["n~" + d.id];
  $("#v-hoy").innerHTML = `
    <div class="list">${d.items.map(it => itemRow(s, d, it)).join("") || '<p class="mut">Día libre o de movilidad.</p>'}</div>
    ${extras.length ? `<h2>Extras</h2><div class="list">${extras.map((x, i) => `<div class="row"><div class="ex-head"><div class="ex-name"><span class="tags"><span class="tag m">Extra</span></span><b>${esc(x.n)}</b></div>
      <button class="btn quiet" style="min-height:36px;padding:0 12px" data-delx="${d.id}" data-i="${i}">Borrar</button></div>
      <div class="grid2" style="margin-top:8px"><span class="k">HECHO</span><span class="v strong">${esc(resumen(x.sets))}</span></div></div>`).join("")}</div>` : ""}
    <div class="btn-row" style="margin-top:20px"><button class="btn ghost" data-extra-open="${d.id}">Añadir ejercicio extra</button></div>
    <h2>Notas del día</h2>
    <textarea class="inp" rows="3" data-dn="${d.id}" placeholder="Sueño, cansancio, tenis ese día, cambios de orden… (se guarda solo)" aria-label="Notas del día">${esc(nd && nd.txt ? nd.txt : "")}</textarea>`;
}

/* ── render: Semana ── */
function barras(vol) {
  return `<div class="vol">${G.map(g => {
    const v = vol[g.id] || 0, w = Math.min(100, v / 24 * 100);
    const c = v < 10 ? "#8a7a55" : v > 20 ? "#8a5a60" : "#6f8a78";
    return `<div class="vr"><span>${esc(g.n)}</span><div class="track"><i class="band"></i><i class="fill" style="width:${w}%;background:${c}"></i></div><span class="vn">${f(v)}</span></div>`;
  }).join("")}</div>`;
}
function renderSemana() {
  const s = W[ui.week - 1], log = LOG[s.w] || {};
  const c = ciclo(s);
  const lifts = [], notas = [], faltan = [];
  let tot = 0, hechos = 0, series = 0, diasCon = 0;
  s.dias.forEach((d, i) => {
    let alguno = false;
    itemsEj(d).forEach(it => {
      const prev = log[claveDe(d.id, it)];
      tot++;
      if (registrado(prev)) { hechos++; alguno = true; series += prev.sets ? prev.sets.length : 0; if (prev.com) notas.push([`D${i + 1} · ${nombrePlan(it)}`, prev.com]); }
      else if (s.w <= st.actual && !esPlantilla(s.w)) faltan.push(`D${i + 1} ${nombrePlan(it)}`);
      if (it.k === "main") lifts.push(`<div class="lift"><span class="k">D${i + 1} · ${esc(nombrePlan(it)).toUpperCase()}</span><span class="kg">${kg(r25(rmDe(s.w, it.lift) * it.pct / 100))}</span><span class="small mut">${it.sets} × ${it.reps} · RPE ${esc(it.rpe)}</span></div>`);
    });
    const nd = log["n~" + d.id]; if (nd && nd.txt) notas.push([`D${i + 1} · notas del día`, nd.txt]);
    if (alguno) diasCon++;
  });
  const plantilla = esPlantilla(s.w);
  const estado = s.w === st.actual ? "Semana actual" : plantilla ? "Plantilla" : s.w < st.actual ? "Ya pasó" : "Por venir";
  $("#v-semana").innerHTML = `
    <div class="chips"><span class="pill">${esc(c.n)}</span><span class="pill" style="border-color:transparent;background:${colorSemana(s)};color:#f2f0eb">${esc(etiqueta(s))}</span><span class="pill">${estado}</span></div>
    <p style="margin-top:14px">${esc(s.nota)}</p>${s.nota_libro ? `<p class="small mut">${esc(s.nota_libro)}</p>` : ""}
    ${plantilla ? `<p class="small mut">Esta semana se rediseñó con la Pirámide cuando ya había pasado, así que queda como plantilla: sirve de modelo para repetir el bloque, no tiene registros pendientes.</p>` : ""}
    ${s.w <= st.actual && !plantilla ? `<h2>Registro</h2><div class="stats"><div><span class="k">EJERCICIOS</span><span class="n">${hechos} / ${tot}</span></div><div><span class="k">SERIES</span><span class="n">${series}</span></div><div><span class="k">DÍAS</span><span class="n">${diasCon} / ${s.dias.length}</span></div></div>` : ""}
    ${lifts.length ? `<h2>Básicos</h2><div class="lifts">${lifts.join("")}</div>` : ""}
    ${notas.length ? `<h2>Tus notas</h2><div class="list">${notas.map(([t, x]) => `<div class="row"><span class="k">${esc(t.toUpperCase())}</span><p class="serif" style="font-style:italic;font-size:15.5px;margin:4px 0 0;color:var(--tx2)">“${esc(x)}”</p></div>`).join("")}</div>` : ""}
    ${faltan.length ? `<h2>Sin registrar · ${faltan.length}</h2><div class="chips">${faltan.map(x => `<span class="pill">${esc(x)}</span>`).join("")}</div>` : ""}
    <h2>Volumen de esta semana</h2>
    <p class="small mut">Series por músculo: directas cuentan 1 e indirectas 0,5. La franja clara es el rango 10–20 <span class="pg">p.62</span>. El día de potencia no cuenta <span class="pg">p.139</span>.</p>
    ${barras(s.vol)}
    ${s.w !== st.actual ? `<div class="btn-row" style="margin-top:24px"><button class="btn" data-actual="${s.w}">Marcar la semana ${s.w} como actual</button></div>` : ""}`;
}

/* ── render: Año ── */
function resumenBloques(ws) {
  const out = []; let cur = null;
  const NOMBRE = {M3: "M3 Fuerza renovada"};
  ws.forEach(s => {
    const n = s.viejo ? s.macro : s.etiqueta;
    if (!cur || cur.n !== n) { cur = {n, a: s.w, b: s.w}; out.push(cur); } else cur.b = s.w;
  });
  return out.map(o => `${esc(NOMBRE[o.n] || o.n)} <span class="mono">${o.a === o.b ? o.a : o.a + "–" + o.b}</span>`).join(" · ");
}
function metaBanca() {
  const b = rmDe(st.actual, "banca"), faltan = Math.max(0, 52 - st.actual);
  const tuRitmo = b + 0.3 * faltan, libro = b + 0.5 * faltan;
  const reps = x => repsTxt(repsDePct(100 / x * 100));
  const hechos = [1, 2, 3, 4].map(i => st.rm[i] && Number(st.rm[i].amrap) ? `S${[18, 31, 44, 52][i - 1]}: ${st.rm[i].amrap} reps` : null).filter(Boolean);
  return `<div class="kpis">
    <div class="kpi"><span class="k">HOY</span><div class="n">${kg(b)}</div><div class="d">con 100 kg ≈ ${reps(b)} reps (p.64)</div></div>
    <div class="kpi"><span class="k">S52 A TU RITMO</span><div class="n">≈ ${kg(r25(tuRitmo))}</div><div class="d">+3 kg cada 10 semanas → ≈ ${reps(tuRitmo)} reps con 100 kg</div></div>
    <div class="kpi"><span class="k">S52 RITMO DEL LIBRO</span><div class="n">≈ ${kg(r25(libro))}</div><div class="d">+2,5 kg cada ~5 semanas, intermedio (p.111) → ≈ ${reps(libro)} reps</div></div>
  </div>
  <p class="small mut" style="margin-top:10px">Veinte repeticiones con 100 kg quedan fuera de la tabla del libro, que llega a 11–12 reps al 70 % <span class="pg">p.64</span>. Es meta de varios años: se mide en cada test con un AMRAP a 100 kg.${hechos.length ? " Registrado: " + hechos.join(" · ") + "." : ""}</p>`;
}
function tablaMaximos() {
  const rows = TRAMOS.map((t, i) => `<tr><td><b class="mono">${t.d}</b><br><span class="small mut">${t.s}</span></td>${LIFTS.map(([id]) => {
    const v = st.rm[i] && st.rm[i][id] ? st.rm[i][id] : "";
    const ph = i === 0 ? DATA.rm_inicial[id] : rmDe(TRAMOS[i - 1].desde, id);
    return `<td class="n"><input class="inp" type="text" inputmode="decimal" value="${esc(v)}" placeholder="${ph}" data-rm="${i}" data-lift="${id}" aria-label="${id} ${t.d}"></td>`;
  }).join("")}<td class="n">${i === 0 ? "—" : `<input class="inp" type="text" inputmode="numeric" value="${esc(st.rm[i] && st.rm[i].amrap ? st.rm[i].amrap : "")}" placeholder="reps" data-rm="${i}" data-lift="amrap" aria-label="AMRAP 100 kg ${t.d}">`}</td></tr>`).join("");
  return `<div class="tw rm"><table><thead><tr><th>Semanas</th><th class="n">Banca</th><th class="n">Sent.</th><th class="n">P. muerto</th><th class="n">AMRAP</th></tr></thead><tbody>${rows}</tbody></table></div>
  <label class="fl" style="margin-top:12px">Jalón (S11–S18) <input class="inp mono" type="text" inputmode="decimal" value="${esc(st.jalon)}" placeholder="${DATA.rm_inicial.jalon}" data-jalon="1" style="max-width:140px"></label>`;
}
function renderAno() {
  const s = W[st.actual - 1];
  const prox = TESTS.filter(t => t >= st.actual).slice(0, 2);
  const b = rmDe(st.actual, "banca");
  const ciclos = CICLOS.map(c => {
    const ws = W.filter(x => x.w >= c.w[0] && x.w <= c.w[1]);
    return `<div class="cyc"><div class="cyc-h"><h3>${esc(c.n)}</h3><span class="small mut">S${c.w[0]}–S${c.w[1]} · ${esc(c.d)}</span></div>
      <div class="cells">${ws.map(x => `<button class="cell${x.w < st.actual ? " done" : ""}${x.w === st.actual ? " now" : ""}${TESTS.includes(x.w) ? " t" : ""}" style="background:${colorSemana(x)}" data-goweek="${x.w}" aria-label="Semana ${x.w}: ${esc(etiqueta(x))}">${x.w}</button>`).join("")}</div>
      <p class="small mut" style="margin-top:8px">${resumenBloques(ws)}</p></div>`;
  }).join("");
  $("#v-ano").innerHTML = `
    <div class="stats"><div><span class="k">ESTÁS EN</span><span class="n">S${st.actual}</span></div><div><span class="k">PRÓX. TEST</span><span class="n">${prox.length ? "S" + prox[0] : "año 2"}</span></div><div><span class="k">BANCA</span><span class="n">${f(b)}</span></div></div>
    <p class="small mut" style="margin-top:10px">${esc(etiqueta(s))}. Con 100 kg en banca hoy ≈ ${repsTxt(repsDePct(100 / b * 100))} reps <span class="pg">p.64</span>. El punto blanco marca las semanas de test.</p>
    ${ciclos}
    <div class="legend">
      <span><i class="sw" style="background:var(--f-intro)"></i>Intro</span><span><i class="sw" style="background:var(--f-acc)"></i>Volumen</span>
      <span><i class="sw" style="background:var(--f-pico)"></i>Pico de volumen</span><span><i class="sw" style="background:var(--f-desc)"></i>Descarga</span>
      <span><i class="sw" style="background:var(--f-int)"></i>Intensidad</span><span><i class="sw" style="background:var(--f-taper)"></i>Taper</span>
      <span><i class="sw" style="background:var(--f-test)"></i>Test</span>
    </div>
    <h2>Tu meta de banca</h2>${metaBanca()}
    <h2>Tus máximos</h2>
    <p class="small mut">Las cargas de cada tramo salen de estos números. Después de cada test, anota el resultado y las semanas siguientes se recalculan solas. Una casilla vacía usa la de arriba.</p>
    ${tablaMaximos()}
    <h2>¿Cuántas veces se repite el ciclo?</h2>
    <div class="rule"><p><b>Cuatro veces.</b> Acumulación, intensificación y test dejan entre 8 y 16 semanas de un test al siguiente en el programa avanzado del libro <span class="pg">p.248</span>. Por cómo progresas, el libro te pone en intermedio <span class="pg">p.109, p.114</span>, así que caben cuatro: S1–S18, S19–S31, S32–S44 y S45–S52.</p>
    <p><b>No es repetir lo mismo.</b> Cada vuelta parte con los máximos del test anterior, así que las cargas suben <span class="pg">p.110–111, p.243</span>. El énfasis alterna entre hipertrofia y fuerza <span class="pg">p.256–257</span>, y los compuestos de apoyo pueden cambiar entre mesociclos <span class="pg">p.218</span>.</p>
    <p class="small mut">S1–S10 siguen el ciclo de 8 semanas del libro con una semana intro y el taper aparte <span class="pg">p.104–105, p.132, p.136</span>. S11–S18 es tu fuerza renovada y no se toca, porque vienes progresando <span class="pg">p.122</span>.</p></div>`;
}

/* ── render: Más ── */
const BLOQUES = [
  {c: "C1", t: "Intro y volumen", w: "S1–S4", col: "var(--f-acc)", x: "Semana intro con ¾ de las series y un punto menos de RPE (p.104–105). Luego tres semanas de volumen: la carga sube y las reps bajan cada semana, 6-5-4 en el día pesado y 10-9-8 en el de volumen (p.132, p.268–270). Nada al fallo en los básicos (p.134)."},
  {c: "C1", t: "Descarga", w: "S5", col: "var(--f-desc)", x: "Entre volumen e intensidad (p.105, p.132): ⅔ de las series, 1 punto menos de RPE y 5 % menos de carga (p.246)."},
  {c: "C1", t: "Intensidad", w: "S6–S8", col: "var(--f-int)", x: "Pesado 5-4-3 al 82,5-85-87,5 %, volumen 9-8-7 al 67,5-70-72,5 % (p.135, p.270–272). Accesorios en rangos más bajos y más cerca del fallo."},
  {c: "C1", t: "Taper y test", w: "S9–S10", col: "var(--f-test)", x: "S9: unas 10 series por músculo con las mismas cargas, RPE 7–9 (p.136). S10: single a RPE 8–9 en los tres básicos y AMRAP con 100 kg (p.115, p.118)."},
  {c: "C1", t: "M3 · Fuerza renovada", w: "S11–S18", col: "var(--f-int)", x: "En curso. Dos olas de intensificación (S11–S13 y S15–S17), descarga con retest en S14 y test en S18. El libro pone uno o dos bloques de intensidad tras la acumulación, con test al final (p.248). Vienes progresando, así que no se cambia (p.122)."},
  {c: "C2", t: "Acumulación", w: "S19–S24", col: "var(--f-acc)", x: "Sube capacidad de trabajo y masa (p.134). Día pesado 6-5-4 reps al 80-82,5-85 %, día de volumen 10-9-8 al 65-67,5-70 % (p.268–270), en dos olas: la segunda repite los % y suma 2,5 kg en banca o 5 kg en sentadilla y peso muerto solo si la primera quedó bajo el RPE (p.243, p.246). Accesorios compuestos 8–12, aislamiento 12–15 (p.209). S19 es intro: ¾ de las series (p.105). S22–S24: +1 serie en banca y sentadilla pesadas y en el aislamiento de brazos, hombros e isquios, el pico de volumen (p.134, p.125)."},
  {c: "C2", t: "Descarga", w: "S25", col: "var(--f-desc)", x: "Entre volumen e intensidad (p.105): repite S24 con ⅔ de las series, 1 punto menos de RPE y 5 % menos de carga (p.246). Si el checklist da 0–1 «sí», puedes saltarla (p.123)."},
  {c: "C2", t: "Intensificación", w: "S26–S29", col: "var(--f-int)", x: "Menos volumen y más carga (p.135). Pesado 5-4-3-2 al 82,5-85-87,5-90 %, volumen 9-8-7-6 al 67,5-70-72,5-75 %. Las tres primeras semanas son la tabla de p.270–272; la cuarta termina en 2 y 6 reps, como pide p.135. Accesorios compuestos 6–8, aislamiento 8–12."},
  {c: "C2", t: "Taper y test", w: "S30–S31", col: "var(--f-test)", x: "S30: mitad de series con las cargas de S29 (p.136). S31: single a RPE 8–9 en banca, sentadilla y peso muerto (p.115, p.118), AMRAP con 100 kg en banca y accesorios a la mitad (p.136)."},
  {c: "C3", t: "Acumulación", w: "S32–S37", col: "var(--f-acc)", x: "Tabla de powerlifting avanzado: pesado 5-4-3 al 82,5-85-87,5 %, volumen 8-7-6 al 70-72,5-75 % (p.265), dos olas con la misma regla (p.243, p.246). Accesorios compuestos 6–8, aislamiento 10–12 (p.210). Los fondos pasan a press de banca agarre cerrado (p.218). Brazos y hombros quedan en su volumen base para no perder lo ganado (p.256)."},
  {c: "C3", t: "Descarga", w: "S38", col: "var(--f-desc)", x: "Igual que S25 (p.105, p.246)."},
  {c: "C3", t: "Intensificación", w: "S39–S41", col: "var(--f-int)", x: "Pesado 4-3-2 al 85-87,5-90 %, volumen 7-6-5 al 72,5-75-77,5 % (p.266–267)."},
  {c: "C3", t: "Taper de 2 semanas y test", w: "S42–S44", col: "var(--f-test)", x: "Es el ciclo más pesado y el taper dura según la fatiga acumulada (p.140). S42: un tercio menos de volumen con las mismas cargas. S43: 2–3 reps al 75–85 %, básicos a la mitad o menos y accesorios a la mitad (p.140–141). S44: test."},
  {c: "C4", t: "Volumen", w: "S45–S47", col: "var(--f-acc)", x: "El ciclo de 8 semanas del libro: volumen, descarga, intensidad, taper y test (p.132). Tablas de culturismo (p.268–270). S45 es intro (p.105)."},
  {c: "C4", t: "Descarga", w: "S48", col: "var(--f-desc)", x: "Semana 4 del ejemplo de p.132 (p.246)."},
  {c: "C4", t: "Intensidad", w: "S49–S51", col: "var(--f-int)", x: "Pesado 5-4-3 al 82,5-85-87,5 %, volumen 9-8-7 al 67,5-70-72,5 % (p.270–272)."},
  {c: "C4", t: "Taper y test del año", w: "S52", col: "var(--f-test)", x: "La semana 8 de p.132 junta taper y test. El AMRAP con 100 kg cierra el año; el AMRAP es el test que el libro usa para hipertrofia (p.136)."},
];
function masBloques() {
  return CICLOS.map(c => `<h2>${esc(c.n)} <span class="small mut mono">S${c.w[0]}–S${c.w[1]}</span></h2>${BLOQUES.filter(b => b.c === c.id).map(b => `
    <div class="rule"><h3><i class="sw" style="background:${b.col}"></i>${esc(b.t)} <span class="small mut mono">${b.w}</span></h3><p>${esc(b.x)}</p></div>`).join("")}`).join("");
}
function masVolumen() {
  const head = `<tr><th>Músculo</th>${W.map(s => `<th class="${s.w === 11 || s.w === 19 ? "sep" : ""}">S${s.w}</th>`).join("")}</tr>`;
  const body = G.map(g => `<tr><td>${esc(g.n)}</td>${W.map(s => {
    const v = s.vol[g.id] || 0;
    const bg = v < 10 ? "rgba(138,122,85,.28)" : v > 20 ? "rgba(138,90,96,.42)" : "rgba(111,138,120,.26)";
    return `<td class="${s.w === 11 || s.w === 19 ? "sep" : ""}" style="background:${bg}">${f(v)}</td>`;
  }).join("")}</tr>`).join("");
  return `<p class="small mut" style="margin-top:16px">Las rayas separan S1–S10 (Pirámide), S11–S18 (tu M3) y el plan nuevo desde S19. Verde: 10–20. Ocre: bajo 10. Rojo: sobre 20. Desliza la tabla hacia los lados.</p>
    <div class="tw"><table class="heat"><thead>${head}</thead><tbody>${body}</tbody></table></div>
    <div class="rule"><h3>Cómo se cuenta</h3><p>Cada serie directa vale 1 y cada indirecta 0,5: es tu regla (Pelland 2026). Qué es directo y qué indirecto sale de la tabla de músculos de p.214. <b>Conflicto de fuentes:</b> el libro cuenta primario y secundario igual (p.213), así que con su conteo estos números serían más altos. El día de potencia no cuenta (p.139, p.49).</p></div>
    <div class="rule"><h3>Rango y por qué no va más alto</h3><p>10–20 series por músculo y semana (p.62); para intermedio, 13–15 de partida (p.208). Con tenis tres veces por semana hay fatiga de afuera, y el volumen óptimo baja (p.61). Por eso casi todo queda entre 10 y 17, y la prioridad (brazos, hombros, isquios) sube primero.</p></div>
    <div class="rule"><h3>Dorsal en 8</h3><p>Es el costo de tu decisión de un solo día de espalda. Si la espalda no avanza, es lo primero a revisar.</p></div>`;
}
function masReglas() {
  const p64 = P64.map(([r, p]) => `<tr><td class="n">${p} %</td><td class="n">${r === 3.5 ? "3–4" : r === 5.5 ? "5–6" : r === 7.5 ? "7–8" : r === 9.5 ? "9–10" : r === 11.5 ? "11–12" : r}</td></tr>`).join("");
  return `
    <h2>Al cerrar cada bloque</h2>
    <div class="check">
      <p class="small mut">Checklist de recuperación <span class="pg">p.123, p.218</span></p>
      <label><input type="checkbox" data-ck> ¿Te cuesta ir al gimnasio?</label>
      <label><input type="checkbox" data-ck> ¿Duermes peor que lo normal?</label>
      <label><input type="checkbox" data-ck> ¿Bajan las cargas o las reps?</label>
      <label><input type="checkbox" data-ck> ¿Más estrés que lo normal?</label>
      <label><input type="checkbox" data-ck> ¿Más dolores o molestias que lo normal?</label>
      <div class="out" id="ck-out"></div>
      <p class="small mut">Si pasan tres mesociclos sin descarga, se hace una igual (p.124, p.218). Si vuelves a quedar agotado al poco tiempo de descargar, baja ~20 % las series (p.125).</p>
    </div>
    <h2>1RM estimado</h2>
    <div class="calc">
      <label class="fl">Carga<input class="inp mono" id="c-kg" type="text" inputmode="decimal" value="100"></label>
      <label class="fl">Reps<input class="inp mono" id="c-reps" type="text" inputmode="numeric" value="1"></label>
      <label class="fl">RPE<select class="inp mono" id="c-rpe">${[10, 9.5, 9, 8.5, 8, 7.5, 7, 6].map(r => `<option ${r === 8 ? "selected" : ""}>${r}</option>`).join("")}</select></label>
    </div>
    <div class="out" id="c-out"></div>
    <p class="small mut">Reps hechas + reps que te quedaban = reps máximas; la tabla de p.64 da el % del máximo. Sobre ~5 reps la estimación pierde precisión (p.115, p.120).</p>
    <h2>Tabla % del máximo → reps <span class="pg">p.64</span></h2>
    <div class="tw" style="max-width:260px"><table><thead><tr><th class="n">% 1RM</th><th class="n">Reps</th></tr></thead><tbody>${p64}</tbody></table></div>
    <p class="small mut">Promedio de levantadores entrenados. Al 70 % hay gente que hace 9 y otra 26 (p.63): por eso cada carga va con un RPE (p.66).</p>
    <h2>Peso corporal <span class="pg">Nutrición p.61, p.67</span></h2>
    <label class="fl" style="max-width:180px">Tu peso (kg)<input class="inp mono" id="peso" type="text" inputmode="decimal" value="${esc(st.peso)}" placeholder="kg"></label>
    <div class="out" id="peso-out"></div>
    <p class="small mut">Intermedio: subir 0,5–1 % del peso por mes, con unas 100–200 kcal/día sobre mantención. Pésate al menos 3 veces por semana y compara promedios cada 2–3 semanas.</p>
    <h2>Reglas del plan</h2>
    <div class="rule"><h3>Transiciones</h3><p>Volumen → descarga → intensidad. Intensidad → semana intro → volumen (p.105). La intro es ¾ de las series con 1 punto menos de RPE (p.104–105).</p></div>
    <div class="rule"><h3>Cargas</h3><p>Los básicos van en % del máximo más un rango de RPE. Si la primera serie no cae en el rango, ajustas las siguientes (p.66, p.217, p.246). Redondeo a 2,5 kg. Cada % se revisó contra la tabla de p.64.</p></div>
    <div class="rule"><h3>Accesorios: doble progresión</h3><p>Carga fija y sumas reps dentro del rango. Cuando todas las series llegan al tope, subes el menor incremento (p.111–113). La app lo calcula sola cuando registras.</p></div>
    <div class="rule"><h3>Si pierdes sesiones</h3><p>Retomas donde quedaste y el plan termina unos días después. No se juntan sesiones (p.37). Si un día estás agotado, haz la sesión más liviana de la semana (p.36). Una semana de viaje o enfermedad se toma como descarga.</p></div>
    <div class="rule"><h3>Tenis de mesa</h3><p>Pesas y tenis compiten por recuperación: uno tiene prioridad y el otro se modera (p.39). No juegues fuerte justo antes de entrenar; después de las pesas, 6 h después o en otro día es mejor (p.40).</p></div>
    <div class="rule"><h3>Potencia y sprints</h3><p>Potencia es mover cargas livianas lo más rápido posible, lo que más transfiere a un deporte con raqueta (p.127). El día de potencia es de poco volumen, para recuperar (p.139).</p></div>
    <div class="rule"><h3>Año 2</h3><p>Misma estructura. Si un músculo o levantamiento no avanza en dos ciclos, +1–2 series ahí (p.125). Si el progreso pasa a verse solo mes a mes o más lento, aplicas los criterios de avanzado (p.114): ciclos más largos y menos tests (p.117).</p></div>
    <h2>Lo que no sale del libro</h2>
    <div class="rule"><ul>
      <li>Los sprints (al inicio del día 4): el libro no los trata.</li>
      <li>El orden de los énfasis (hipertrofia, fuerza, cierre). El libro permite alternar (p.256–257); el orden se eligió por tus metas.</li>
      <li>La cuarta semana de intensificación de C2 alarga la tabla de p.270–272 hasta donde p.135 dice que termina el bloque.</li>
      <li>Las cargas de referencia de accesorios suponen que trabajabas a RPE ~8.</li>
    </ul></div>`;
}
function masDatos() {
  const hora = lastSync ? new Date(lastSync).toLocaleString("es", {dateStyle: "short", timeStyle: "short"}) : "nunca";
  const estado = {local: "Solo en este teléfono", ok: "Al día con tu cuenta", saving: "Guardando…", offline: "Sin señal: lo nuevo está en el teléfono y se sube al volver", error: "Hubo un problema"}[syncState];
  const msg = $("#sync") ? $("#sync").title : "";
  if (conectado()) return `
    <div class="panel" style="margin-top:16px">
      <div class="grid2"><span class="k">ESTADO</span><span class="v strong">${esc(estado)}</span>
      ${syncState === "error" && msg ? `<span class="k">DETALLE</span><span class="v">${esc(msg)}</span>` : ""}
      <span class="k">CUENTA</span><span class="v">${esc(cfg.owner)}/${esc(cfg.repo)}</span>
      <span class="k">ÚLTIMO</span><span class="v">${esc(hora)}</span>
      <span class="k">PENDIENTE</span><span class="v">${pendientes() ? pendientes() + " cambio(s) por subir" : "nada"}</span></div>
    </div>
    <div class="btn-row" style="margin-top:14px"><button class="btn pri" data-syncnow>Sincronizar ahora</button><button class="btn" data-export>Descargar respaldo</button></div>
    <div class="btn-row" style="margin-top:8px"><button class="btn quiet" data-disconnect>Desconectar este teléfono</button></div>
    <p class="small mut" style="margin-top:14px">Cada registro se guarda primero en el teléfono y luego en tu repositorio privado. Claude lee ese repositorio cuando le pides revisar tu registro.</p>`;
  return `
    <div class="panel" style="margin-top:16px">
      <p><b>Ahora tu registro se guarda solo en este teléfono.</b> Conéctalo a tu cuenta para no perderlo y para que Claude pueda revisarlo.</p>
      <ol class="small" style="padding-left:18px;color:var(--tx2);line-height:1.6;margin:0">
        <li>Abre <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">github.com/settings/personal-access-tokens/new</a>.</li>
        <li>Nombre: <b>exponential-app</b>. Vencimiento: 1 año.</li>
        <li>En «Repository access», elige <b>Only select repositories</b> y marca <b>${esc(cfg.repo)}</b>.</li>
        <li>En «Permissions › Repository permissions», pon <b>Contents</b> en <b>Read and write</b>.</li>
        <li>Pulsa «Generate token», cópialo y pégalo aquí abajo.</li>
      </ol>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px;margin-top:16px">
      <label class="fl">Usuario de GitHub<input class="inp" id="g-owner" value="${esc(cfg.owner)}" autocapitalize="off" autocorrect="off" spellcheck="false"></label>
      <label class="fl">Repositorio de datos<input class="inp" id="g-repo" value="${esc(cfg.repo)}" autocapitalize="off" autocorrect="off" spellcheck="false"></label>
      <label class="fl">Clave de acceso<input class="inp" id="g-token" type="password" autocomplete="off" placeholder="github_pat_…"></label>
      <div class="btn-row"><button class="btn pri" data-connect>Conectar</button></div>
      <p class="small mut" id="g-msg"></p>
    </div>`;
}
function renderMas() {
  const body = {bloques: masBloques, volumen: masVolumen, reglas: masReglas, datos: masDatos}[ui.mas]();
  $("#v-mas").innerHTML = body;
  if (ui.mas === "reglas") { actualizarChecklist(); actualizarCalc(); actualizarPeso(); }
}
function actualizarChecklist() {
  const out = $("#ck-out"); if (!out) return;
  const v = [...document.querySelectorAll("[data-ck]")].map(x => x.checked), n = v.filter(Boolean).length;
  out.textContent = n === 1 && v[4] ? "Solo dolores: semana normal con reps altas, 12–20 (p.124)" : n >= 2 ? "Descarga esta semana (p.123)" : "Empieza el siguiente mesociclo (p.123)";
}
function actualizarCalc() {
  const out = $("#c-out"); if (!out) return;
  const k = num($("#c-kg").value), r = num($("#c-reps").value), rpe = num($("#c-rpe").value);
  if (!(k > 0 && r > 0)) { out.textContent = "Escribe carga y reps."; return; }
  const max = r + (10 - rpe), est = k / (pctDeReps(max) / 100);
  out.textContent = `1RM estimado ≈ ${kg(r05(est))}` + (max > 6 ? " · poco preciso (más de ~5 reps)" : "");
}
function actualizarPeso() {
  const out = $("#peso-out"); if (!out) return;
  const p = num(st.peso);
  out.textContent = p > 0 ? `+${f(p * .005)} a +${f(p * .01)} kg por mes (≈ +${f(p * .005 / 4)} a +${f(p * .01 / 4)} kg por semana)` : "Escribe tu peso para ver el ritmo.";
}

/* ── hoja de registro ── */
function antesDe(w, key, it) {
  for (let x = w - 1; x >= 1; x--) {
    const p = LOG[x] && LOG[x][key];
    if (registrado(p) && !p.omitido) return `S${x} · ${hechoDe(p, it).id !== it.ex ? hechoDe(p, it).n + ": " : ""}${resumen(p.sets)}`;
  }
  const pr = PROG[it.ex];
  return pr ? `S${pr.w} · ${kg(pr.kg)} (${pr.motivo})` : "Sin registro anterior";
}
function abrirRegistro(w, key) {
  const s = W[w - 1], it = itemDeClave(w, key); if (!it) return;
  const prev = LOG[w] && LOG[w][key];
  const n = it.k === "single" || it.k === "amrap" ? 1 : +it.sets || 1;
  const rows = [];
  for (let i = 0; i < Math.max(n, prev && prev.sets ? prev.sets.length : 0); i++) {
    const v = (prev && prev.sets && prev.sets[i]) || {};
    rows.push({kg: v.kg ?? "", reps: v.reps ?? "", rpe: v.rpe ?? ""});
  }
  const hecho = hechoDe(prev, it);
  const ops = opcionesHecho(it);
  const esOtro = !ops.some(o => o[0] === hecho.id);
  sheet = {tipo: "reg", w, key, it, rows, hid: esOtro ? "otro" : hecho.id, otro: esOtro ? hecho.n : "", com: (prev && prev.com) || ""};
  [w - 1, w - 2].filter(x => x >= 1).forEach(x => cargarSemana(x));
  renderSheet();
}
function abrirExtra(did) {
  sheet = {tipo: "extra", w: ui.week, did, nombre: "", rows: [1, 2, 3, 4].map(() => ({kg: "", reps: "", rpe: ""}))};
  renderSheet();
}
function cerrarSheet() { sheet = null; $("#sheet-root").innerHTML = ""; document.body.style.overflow = ""; render(); }
function placeholders() {
  const s = W[sheet.w - 1], it = sheet.it;
  const hid = sheet.hid === "otro" ? "otro:" + slug(sheet.otro || "") : sheet.hid;
  return {
    kg: cargaSugerida(s, it, hid) || "",
    reps: it.k === "single" ? 1 : it.k === "amrap" ? "" : rango(it.reps)[0],
    rpe: it.rpe_esp || (it.rpe ? rango(it.rpe)[1] : ""),
  };
}
function setsHtml(ph) {
  return sheet.rows.map((r, i) => `<div class="set"><span class="n">${i + 1}</span>
    <input class="inp" type="text" inputmode="decimal" data-i="${i}" data-f="kg" value="${esc(r.kg)}" placeholder="${esc(ph.kg)}" aria-label="Kilos, serie ${i + 1}">
    <input class="inp" type="text" inputmode="numeric" data-i="${i}" data-f="reps" value="${esc(r.reps)}" placeholder="${esc(ph.reps)}" aria-label="Reps, serie ${i + 1}">
    <input class="inp" type="text" inputmode="decimal" data-i="${i}" data-f="rpe" value="${esc(r.rpe)}" placeholder="${esc(ph.rpe)}" aria-label="RPE, serie ${i + 1}"></div>`).join("");
}
function sumTxt() {
  const v = leerSets();
  return v.length ? `${v.length} ${v.length === 1 ? "serie" : "series"} · ${v.reduce((a, x) => a + x.reps, 0)} reps` : "Sin series anotadas";
}
function renderSheet() {
  document.body.style.overflow = "hidden";
  let html;
  if (sheet.tipo === "reg") {
    const s = W[sheet.w - 1], it = sheet.it, did = sheet.key.split(":")[0];
    const di = s.dias.findIndex(d => d.id === did), ph = placeholders();
    const ops = opcionesHecho(it);
    html = `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-t"><div class="sheet-in">
      <div class="sheet-top"><button class="back" data-sheet-close aria-label="Volver">${ICON.back}</button>
        <div class="top-txt"><span class="eyebrow">S${s.w} · D${di + 1} · ${esc(s.dias[di].n)}</span><h1 id="sh-t">${esc(nombrePlan(it))}</h1></div></div>
      <div class="sheet-body">
        <div class="grid2"><span class="k">PLAN</span><span class="v">${esc(planTxt(s, it))}</span><span class="k">ANTES</span><span class="v">${esc(antesDe(s.w, sheet.key, it))}</span></div>
        <label class="fl">Hiciste<select class="inp" data-hecho>${ops.map(([id, nm]) => `<option value="${esc(id)}" ${id === sheet.hid ? "selected" : ""}>${esc(nm)}</option>`).join("")}<option value="otro" ${sheet.hid === "otro" ? "selected" : ""}>Otro…</option></select></label>
        <label class="fl" ${sheet.hid === "otro" ? "" : "hidden"} id="otro-wrap">¿Cuál?<input class="inp" data-otro value="${esc(sheet.otro)}" placeholder="Queda con este nombre"></label>
        <div style="display:flex;flex-direction:column;gap:10px">
          <div class="sets-h"><span></span><span>KILOS</span><span>REPS</span><span>RPE</span></div>
          <div id="sets" style="display:flex;flex-direction:column;gap:8px">${setsHtml(ph)}</div>
          <p class="small mut" style="margin:0">Lo gris es lo sugerido: si escribes algo en una serie, lo vacío de esa serie toma lo sugerido. El RPE nunca se inventa.</p>
          <div class="btn-row"><button class="btn ghost" data-add-set>Añadir serie</button><button class="btn quiet" data-del-set>Quitar la última</button></div>
        </div>
        <div class="btn-row"><button class="btn" data-igual>Igual al plan</button><button class="btn quiet" data-omit>No lo hice</button></div>
        <label class="fl">Comentario<textarea class="inp" rows="2" data-com placeholder="Cómo te sentiste, técnica, dolor… (opcional)">${esc(sheet.com)}</textarea></label>
      </div>
      <div class="sheet-foot"><div class="sum"><span class="mono" id="sh-sum">${sumTxt()}</span><span class="small mut">Se guarda en el teléfono y en tu cuenta</span></div><button class="btn pri" data-save>Guardar</button></div>
    </div></div>`;
  } else {
    const s = W[sheet.w - 1], di = s.dias.findIndex(d => d.id === sheet.did);
    html = `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-t"><div class="sheet-in">
      <div class="sheet-top"><button class="back" data-sheet-close aria-label="Volver">${ICON.back}</button>
        <div class="top-txt"><span class="eyebrow">S${s.w} · D${di + 1} · ejercicio extra</span><h1 id="sh-t">Añadir extra</h1></div></div>
      <div class="sheet-body">
        <label class="fl">Nombre<input class="inp" data-xn value="${esc(sheet.nombre)}" placeholder="Ej. curl de muñeca"></label>
        <div style="display:flex;flex-direction:column;gap:10px">
          <div class="sets-h"><span></span><span>KILOS</span><span>REPS</span><span>RPE</span></div>
          <div id="sets" style="display:flex;flex-direction:column;gap:8px">${setsHtml({kg: "", reps: "", rpe: ""})}</div>
        </div>
      </div>
      <div class="sheet-foot"><div class="sum"><span class="mono" id="sh-sum">${sumTxt()}</span></div><button class="btn pri" data-save-extra>Guardar</button></div>
    </div></div>`;
  }
  $("#sheet-root").innerHTML = html;
}
function leerSets() {
  const ph = sheet.tipo === "reg" ? placeholders() : {kg: "", reps: "", rpe: ""};
  return sheet.rows.map(r => {
    if (String(r.kg).trim() === "" && String(r.reps).trim() === "" && String(r.rpe).trim() === "") return null;
    const k = num(r.kg) ?? num(ph.kg) ?? 0, reps = num(r.reps) ?? num(ph.reps) ?? 0, rpe = num(r.rpe);
    return {kg: k, reps, rpe: rpe == null ? null : rpe};
  }).filter(Boolean);
}
function hechoSheet() {
  const it = sheet.it;
  if (sheet.hid === "otro") { const t = (sheet.otro || "").trim(); return t ? {id: "otro:" + slug(t), n: t} : {id: "otro:sin_nombre", n: "Otro ejercicio"}; }
  const o = opcionesHecho(it).find(o => o[0] === sheet.hid) || [it.ex];
  return {id: o[0], n: o[0] === it.ex ? nombrePlan(it) : o[1]};
}
function guardarSheet(modo) {
  const it = sheet.it, w = sheet.w, key = sheet.key;
  const base = {v: 2, t: Date.now(), plan: {id: it.ex, n: nombrePlan(it)}};
  const com = (sheet.com || "").trim();
  let entry;
  if (modo === "omit") entry = Object.assign(base, {hecho: hechoSheet(), sets: [], omitido: true});
  else if (modo === "igual") {
    const n = it.k === "single" || it.k === "amrap" ? 1 : +it.sets || 1;
    const k = +cargaSugerida(W[w - 1], it, it.ex) || 0, reps = it.k === "amrap" ? 0 : it.k === "single" ? 1 : rango(it.reps)[0];
    entry = Object.assign(base, {hecho: {id: it.ex, n: nombrePlan(it)}, sets: Array.from({length: n}, () => ({kg: k, reps, rpe: null})), igual: true});
  } else {
    const sets = leerSets();
    if (!sets.length) { toast("Anota al menos una serie, o usa «Igual al plan» o «No lo hice»."); return; }
    entry = Object.assign(base, {hecho: hechoSheet(), sets});
  }
  if (com) entry.com = com;
  guardarEntrada(w, key, entry, it);
  const h = entry.hecho, pr = PROG[h.id];
  cerrarSheet();
  toast(entry.omitido ? "Anotado: no lo hiciste." : it.k === "acc" && pr && pr.w === w ? `Guardado. Próxima vez: ${kg(pr.next)}.` : "Guardado.");
}
function guardarExtraSheet() {
  const n = (sheet.nombre || "").trim(), sets = leerSets();
  if (!n || !sets.length) { toast("Pon un nombre y al menos una serie."); return; }
  const w = sheet.w, k = "x~" + sheet.did;
  LOG[w] = LOG[w] || {};
  LOG[w][k] = (LOG[w][k] || []).concat([{v: 2, n, id: "extra:" + slug(n), sets, t: Date.now()}]);
  dirty.weeks[w] = true;
  pedirGuardado(300);
  cerrarSheet();
  toast("Extra guardado.");
}

/* ── vistas ── */
function autoDia() {
  const s = W[ui.week - 1], log = LOG[s.w] || {};
  const i = s.dias.findIndex(d => itemsEj(d).some(it => !registrado(log[claveDe(d.id, it)])));
  ui.day = i >= 0 ? i : 0;
}
function render() {
  if (!DATA) return;
  ui.day = Math.min(ui.day, W[ui.week - 1].dias.length - 1);
  header();
  ["hoy", "semana", "ano", "mas"].forEach(t => { $("#v-" + t).hidden = t !== ui.tab; });
  document.querySelectorAll(".nav button").forEach(b => {
    if (b.dataset.tab === ui.tab) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
  });
  if (ui.tab === "hoy") renderHoy();
  else if (ui.tab === "semana") renderSemana();
  else if (ui.tab === "ano") renderAno();
  else renderMas();
}
function irSemana(w) {
  ui.week = Math.max(1, Math.min(52, w));
  ui.dayTouched = true;
  if (ui.week === st.actual) autoDia(); else ui.day = 0;
  saveStore();
  cargarSemana(ui.week);
  render();
  window.scrollTo(0, 0);
}
let toastT = null;
function toast(msg) {
  const r = $("#toast-root");
  r.innerHTML = `<div class="toast">${esc(msg)}</div>`;
  clearTimeout(toastT); toastT = setTimeout(() => { r.innerHTML = ""; }, 2600);
}
function exportar() {
  const blob = new Blob([JSON.stringify({exportado: new Date().toISOString(), estado: st, prog: PROG, semanas: LOG}, null, 1)], {type: "application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `exponential-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/* ── eventos ── */
document.addEventListener("click", async e => {
  const t = e.target.closest("button, [data-goweek]");
  if (!t) return;
  const ds = t.dataset;
  if (ds.tab) { ui.tab = ds.tab; render(); window.scrollTo(0, 0); return; }
  if (t.id === "sync") { ui.tab = "mas"; ui.mas = "datos"; render(); window.scrollTo(0, 0); return; }
  if (ds.step) return irSemana(ui.week + Number(ds.step));
  if ("today" in ds) return irSemana(st.actual);
  if (ds.goweek) { ui.tab = "hoy"; return irSemana(Number(ds.goweek)); }
  if (ds.day) { ui.day = Number(ds.day); ui.dayTouched = true; render(); return; }
  if (ds.open) return abrirRegistro(ui.week, ds.open);
  if (ds.extraOpen) return abrirExtra(ds.extraOpen);
  if (ds.mas) { ui.mas = ds.mas; saveStore(); render(); return; }
  if (ds.delx) {
    const w = ui.week, k = "x~" + ds.delx, i = Number(ds.i);
    if (!LOG[w] || !LOG[w][k]) return;
    const x = LOG[w][k].splice(i, 1)[0];
    if (x) LOG[w]._del = [...(LOG[w]._del || []), x.t];
    dirty.weeks[w] = true; pedirGuardado(300); render(); return;
  }
  if (ds.setrm) {
    const lift = ds.setrm, v = Number(ds.v), w = Number(ds.w);
    if (lift === "jalon") st.jalon = v; else { const i = tramo(w); st.rm[i] = st.rm[i] || {}; st.rm[i][lift] = v; }
    dirty.estado = true; pedirGuardado(300); render(); toast(`Máximo actualizado: ${kg(v)}.`); return;
  }
  if (ds.actual) { st.actual = Number(ds.actual); dirty.estado = true; pedirGuardado(300); render(); toast(`La semana ${st.actual} es ahora la actual.`); return; }
  if ("sheetClose" in ds) return cerrarSheet();
  if ("addSet" in ds) { const l = sheet.rows[sheet.rows.length - 1] || {kg: "", reps: "", rpe: ""}; sheet.rows.push({kg: l.kg, reps: l.reps, rpe: ""}); refrescarSets(); return; }
  if ("delSet" in ds) { if (sheet.rows.length > 1) { sheet.rows.pop(); refrescarSets(); } return; }
  if ("igual" in ds) return guardarSheet("igual");
  if ("omit" in ds) return guardarSheet("omit");
  if ("save" in ds) return guardarSheet("normal");
  if ("saveExtra" in ds) return guardarExtraSheet();
  if ("syncnow" in ds) { Object.keys(loaded).forEach(k => delete loaded[k]); await enCola(pull); return; }
  if ("export" in ds) return exportar();
  if ("disconnect" in ds) { cfg.token = ""; saveCfg(); setSync("local", "Guardado solo en este teléfono"); render(); return; }
  if ("connect" in ds) {
    const msg = $("#g-msg"), owner = $("#g-owner").value.trim(), repo = $("#g-repo").value.trim(), token = $("#g-token").value.trim();
    if (!owner || !repo || !token) { msg.textContent = "Completa los tres campos."; return; }
    msg.textContent = "Conectando…";
    try { await conectar(owner, repo, token); toast("Conectado a tu cuenta."); render(); }
    catch (err) { msg.textContent = err.message; }
    return;
  }
});
function refrescarSets() {
  const ph = sheet.tipo === "reg" ? placeholders() : {kg: "", reps: "", rpe: ""};
  $("#sets").innerHTML = setsHtml(ph);
  $("#sh-sum").textContent = sumTxt();
}
const _deb = {};
document.addEventListener("input", e => {
  const t = e.target;
  if (sheet && t.dataset.f) { sheet.rows[Number(t.dataset.i)][t.dataset.f] = t.value; $("#sh-sum").textContent = sumTxt(); return; }
  if (sheet && "otro" in t.dataset) { sheet.otro = t.value; return; }
  if (sheet && "com" in t.dataset) { sheet.com = t.value; return; }
  if (sheet && "xn" in t.dataset) { sheet.nombre = t.value; return; }
  if (t.dataset.dn) {
    const w = ui.week, did = t.dataset.dn;
    LOG[w] = LOG[w] || {};
    LOG[w]["n~" + did] = {txt: t.value.trim(), t: Date.now()};
    dirty.weeks[w] = true;
    clearTimeout(_deb.dn); _deb.dn = setTimeout(() => pedirGuardado(0), 800);
    return;
  }
  if (t.id === "c-kg" || t.id === "c-reps") actualizarCalc();
  else if (t.id === "peso") { st.peso = t.value; dirty.estado = true; actualizarPeso(); clearTimeout(_deb.p); _deb.p = setTimeout(() => pedirGuardado(0), 900); }
});
document.addEventListener("change", e => {
  const t = e.target;
  if (sheet && "hecho" in t.dataset) {
    sheet.hid = t.value;
    $("#otro-wrap").hidden = t.value !== "otro";
    if (t.value === "otro") $("[data-otro]").focus();
    refrescarSets(); return;
  }
  if (t.dataset.rm) {
    const i = Number(t.dataset.rm); st.rm[i] = st.rm[i] || {};
    st.rm[i][t.dataset.lift] = t.value.trim().replace(",", ".");
    dirty.estado = true; pedirGuardado(300); renderAno(); return;
  }
  if (t.dataset.jalon) { st.jalon = t.value.trim().replace(",", "."); dirty.estado = true; pedirGuardado(300); return; }
  if ("ck" in t.dataset) actualizarChecklist();
  else if (t.id === "c-rpe") actualizarCalc();
});
document.addEventListener("keydown", e => { if (e.key === "Escape" && sheet) cerrarSheet(); });
window.addEventListener("online", () => enCola(flush));
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && conectado() && !sheet) enCola(pull); });

/* ── inicio ── */
(async function inicio() {
  readStore();
  try {
    const r = await fetch("data/plan.json", {cache: "no-cache"});
    DATA = await r.json();
  } catch (e) {
    $("#h-title").textContent = "No pude cargar el plan";
    $("#h-sub").textContent = "Abre la app con señal una vez para guardarla en el teléfono.";
    return;
  }
  W = DATA.semanas; G = DATA.grupos; P64 = DATA.p64;
  ui.week = Math.max(1, Math.min(52, ui.week || st.actual));
  if (ui.week === st.actual) autoDia();
  render();
  setSync(conectado() ? (navigator.onLine ? "saving" : "offline") : "local", conectado() ? "" : "Guardado solo en este teléfono");
  if (conectado()) enCola(pull);
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
})();
