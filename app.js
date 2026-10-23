"use strict";
/* Exponential · app de entrenamiento.
   El plan (52 semanas) viene de data/plan.json. Los registros se guardan en este
   teléfono al instante y se suben a tu repositorio privado de GitHub cuando hay señal.
   Formato de los registros: igual que en el artefacto anterior (wNN = {e: {"d3:remo": {...}}}). */

/* ── versión: súbela en cada publicación (y la etiqueta vX.Y en git). Después de x.9 sigue (x+1).0:
   «1.10» se lee 1,1 y parece anterior a la 1.9. ── */
const VERSIONES = [
  {n: "2.8", nombre: "Usar un programa", fecha: "23 oct 2026", txt: "En Más › Programas, «Usar desde la próxima semana» (o desde esta) convierte el programa en tu plan: Hoy, Semana y Año lo siguen y se repite hasta la S52. Lo anterior no cambia y puedes dejarlo cuando quieras. Las fichas muestran cada día en su recuadro y los nombres ya no se repiten. Los textos que se leen son más grandes y oscuros, y cada «p.64» abre esa página del libro: el PDF se abre una vez y queda en el teléfono."},
  {n: "2.7", nombre: "Avance de todo y metas tuyas", fecha: "17 oct 2026", txt: "Avance muestra cualquier ejercicio que hayas anotado (los básicos con su máximo estimado; los demás, tu mejor serie de cada semana). Las metas de banca y de medidas se cambian en Año, y Medidas quedó en una sola lista."},
  {n: "2.6", nombre: "Catálogo en zip", fecha: "17 oct 2026", txt: "El catálogo se manda por WhatsApp como exponential-catalogo.zip y la app lo abre tal cual, sin descomprimirlo."},
  {n: "2.5", nombre: "Catálogo por archivo", fecha: "17 oct 2026", txt: "El catálogo se abre solo desde su archivo, por ejemplo el que te mandan por WhatsApp; la app ya no lo busca en el repositorio."},
  {n: "2.4", nombre: "Catálogo desde el repositorio", fecha: "17 oct 2026", txt: "Si el catálogo está en tu repositorio privado, Más › Programas lo trae solo la primera vez y lo deja en el teléfono; si no, se abre desde su archivo."},
  {n: "2.3", nombre: "Varias personas", fecha: "16 oct 2026", txt: "Otra persona puede entrar con su propio repositorio y una clave: pone su punto de partida (una serie de cada básico) y tiene su plan de 52 semanas, su registro y su configuración. Para invitar a alguien: Más › Datos. Nuevo en Más › Programas: el catálogo de programas (Pirámide, Jeff Nippard, The Muscle Ladder y otros), que se abre una vez desde su archivo y queda en el teléfono."},
  {n: "2.2", nombre: "Ocho mejoras", fecha: "15 oct 2026", txt: "Pantalla encendida al entrenar, calentamiento de p.224, discos por lado, re-test de la S14 en Semana, registro por lado (búlgara y copenhagen), medidas en Año, historial por ejercicio y volumen hecho contra el plan con la tabla de p.214. Las RPE de varias series se separan con «/» (8 / 8,5), para no confundirlas con decimales."},
  {n: "2.1", nombre: "RPE 5 y atrás", fecha: "15 oct 2026", txt: "El RPE va de 5 a 10 (el plan pide 5–7 en intros y descargas), en botones más grandes; el botón «atrás» del teléfono cierra el registro en vez de salir de la app."},
  {n: "2.0", nombre: "Guardado reforzado", fecha: "15 oct 2026", txt: "Lo que vas anotando sin confirmar (la serie en curso y el registro completo) se guarda al instante en el teléfono: si Android cierra la app, al volver sigue ahí. Notas y peso se guardan sin esperar, y al salir de la app se sube lo pendiente."},
  {n: "1.9", nombre: "Revisión", fecha: "15 oct 2026", txt: "Volver a la app desde otra ya no cambia el ejercicio abierto ni borra lo que llevabas escrito; el fin del descanso no cierra el teclado en el registro."},
  {n: "1.8", nombre: "Línea y temas", fecha: "15 oct 2026", txt: "Diseño nuevo: Hoy como línea con la serie en curso y una barra de descanso que guarda la serie; registro completo en foco; Semana como planilla; la cinta del año arriba; 5 temas con modo automático."},
  {n: "1.7", nombre: "Máximo fiable", fecha: "15 oct 2026", txt: "El máximo se estima solo con series de poco margen hasta el fallo: una descarga a RPE 6 ya no propone bajarlo, y un re-test a RPE 8–9 sí cuenta."},
  {n: "1.6", nombre: "Comentarios", fecha: "14 oct 2026", txt: "Comentarios de Claude dentro de la app; variantes del gimnasio completas; vuelve «Añadir serie»."},
  {n: "1.5", nombre: "Descanso y avance", fecha: "14 oct 2026", txt: "Temporizador de descanso con vibración y gráfico de tu máximo estimado por semana."},
  {n: "1.4", nombre: "Versiones", fecha: "14 oct 2026", txt: "Nombre de versión visible en Más y este historial."},
  {n: "1.3", nombre: "Compacta", fecha: "14 oct 2026", txt: "Más ejercicios por pantalla; la app se actualiza al abrirla con señal."},
  {n: "1.2", nombre: "Clave fácil", fecha: "14 oct 2026", txt: "Enlace a GitHub con la clave ya rellena; registros sin reps visibles."},
  {n: "1.1", nombre: "Revisión", fecha: "14 oct 2026", txt: "Correcciones de sincronización, progresión y RPE del plan."},
  {n: "1.0", nombre: "Inicio", fecha: "14 oct 2026", txt: "App instalable: 52 semanas, registro y sincronización con tu cuenta."},
];
const VERSION = VERSIONES[0];

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
  ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg>',
  ajustes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>',
  hist: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19h16M6 15l4-5 4 3 4-6"/></svg>',
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
  cerrado: {c: "si la muñeca o el hombro molestan", op: [["cerrado_smith", "Press cerrado en Smith"], ["otro:tricep_v_bar", "Tríceps en polea con barra V"]]},
  laterales: {c: "la máquina es tu preferida", op: [["lateral_maq", "Elevación lateral en máquina"], ["lateral_polea", "Elevación lateral en polea baja"]]},
  polea: {c: "", op: [["triceps_sobre_cabeza", "Extensión de tríceps sobre la cabeza en polea"]]},
  frances: {c: "si el codo molesta", op: [["triceps_sobre_cabeza", "Extensión de tríceps sobre la cabeza en polea"], ["frances_mancuernas", "Press francés con mancuernas"]]},
  prensa: {c: "", op: [["hack", "Hack squat"]]},
  femoral: {c: "si la máquina está ocupada; es más exigente, baja las series", op: [["nordico_ghd", "Curl nórdico asistido en GHD"]]},
  extension: {c: "si la máquina está ocupada", op: [["extension_polea", "Extensión de cuádriceps en polea"]]},
  gemelo_pie: {c: "", op: [["gemelo_smith", "Gemelos de pie en Smith"], ["gemelo_hack", "Gemelos en hack"]]},
  gemelo_sent: {c: "", op: [["gemelo_prensa", "Gemelos en prensa 45°"]]},
  remo: {c: "cuando la espalda baja o los isquios estén cargados", op: [["remo_pecho", "Remo con apoyo en el pecho"], ["remo_polea", "Remo en polea sentado"]]},
  jalon: {c: "", op: [["jalon_v", "Jalón agarre en V"], ["jalon_ancho", "Jalón agarre ancho"], ["dominada_banda", "Dominadas con banda"]]},
  curl_z: {c: "", op: [["curl_maq", "Curl de bíceps en máquina"]]},
  martillo: {c: "", op: [["martillo_polea", "Curl martillo en polea con cuerda"], ["curl_maq", "Curl de bíceps en máquina"]]},
  abduccion: {c: "", op: [["abductor_maq", "Abducción en máquina"], ["abduccion_banda", "Abducción con banda"]]},
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
/* ── personas: tú sigues con exponential-datos, tu plan y tus metas. Otra persona entra con su propio
   repositorio (en tu cuenta) y una clave solo para él: tiene su registro, su perfil y el plan base
   (data/plan-base.json, sin lo tuyo). ── */
const TU_REPO = {owner: "Epictetotrades", repo: "exponential-datos"};
/* Metas: se cambian en Año y se guardan con el estado (estado.json). Las tuyas parten en banca 100 kg × 20 y +2 cm de brazo y hombros, manteniendo el pecho. */
const METAS_TUYAS = {banca: {kg: 100, reps: 20}, medidas: {brazo: 2, hombros: 2, pecho: 0}};
let perfil = null, perfilRevisado = false;  // el de otra persona: {nombre, partida, creado}
let datosLocales = false, recargando = false;
let st = {actual: 13, rm: [{}, {}, {}, {}, {}], jalon: "", peso: "", medidas: []};
let LOG = {}, PROG = {};
let CLAUDE = {};  // comentarios de Claude por semana: claude/wNN.json → {"d2:femoral": {txt}, "dia~d6": {txt}, "semana": {txt}}
/* Cada cambio pendiente guarda una marca única: si llega otro cambio mientras se sube el anterior,
   la marca cambia y el pendiente no se borra al terminar la subida. */
let dirty = {estado: false, prog: false, perfil: false, weeks: {}};
let progBorrados = [];
let seq = Date.now();
const marca = () => ++seq;
let cfg = {owner: TU_REPO.owner, repo: TU_REPO.repo, token: ""};
let lastSync = null;
const ui = {tab: "hoy", week: 13, day: 0, mas: "bloques", dayTouched: false, av: "banca", avPt: null, abierto: undefined, dockCtl: false, calor: {}, rt: {},
  partida: {}, inv: {}, cat: {obj: "todos", dias: "todos", prog: null, sem: 0, y: 0}};
const otraPersona = () => !!cfg.token && !(cfg.owner === TU_REPO.owner && cfg.repo === TU_REPO.repo);
const esTuyo = () => !otraPersona();  // tu plan, tus metas y tus textos
const storeKey = () => otraPersona() ? `exp-repo-${cfg.owner}/${cfg.repo}` : STORE;  // lo de cada persona, aparte en el teléfono
/* Cambiar de persona en el mismo teléfono recarga la app; mientras recarga no se guarda nada,
   para que lo de una persona no quede bajo la clave de otra. */
function recargar() { recargando = true; location.reload(); }

/* ── tema: se guarda en este teléfono. «auto» sigue el modo claro u oscuro del sistema ── */
const TEMAS = [
  {id: "hueso", n: "Hueso y burdeos", tipo: "claro", bg: "#efebe3", tx: "#1d1b18", acc: "#6e2a2a", line: "#d3ccbe"},
  {id: "grafito", n: "Grafito y latón", tipo: "oscuro", bg: "#111214", tx: "#eceae5", acc: "#b9a27a", line: "#2c2e33"},
  {id: "papel", n: "Papel y tinta", tipo: "claro", bg: "#f4f1ea", tx: "#1b2130", acc: "#2f4a6d", line: "#d6d0c3"},
  {id: "onix", n: "Ónix y plata", tipo: "oscuro", bg: "#0a0a0b", tx: "#ededee", acc: "#c7ccd4", line: "#2a2a2e"},
  {id: "niebla", n: "Niebla y azul marino", tipo: "claro", bg: "#e7e8ea", tx: "#16191d", acc: "#1f3d5a", line: "#c6cad0"},
];
const TEMA_KEY = "exp-tema";
let tema = {modo: "hueso", claro: "hueso", oscuro: "grafito"};
try { tema = Object.assign(tema, JSON.parse(localStorage.getItem(TEMA_KEY) || "null") || {}); } catch (e) {}
const oscuroSistema = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-color-scheme: dark)") : null;
const temaActivo = () => tema.modo === "auto" ? (oscuroSistema && oscuroSistema.matches ? tema.oscuro : tema.claro) : tema.modo;
function aplicarTema() {
  const t = TEMAS.find(x => x.id === temaActivo()) || TEMAS[0];
  if (document.documentElement) document.documentElement.dataset.tema = t.id;
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = t.bg;
}
function guardarTema() { try { localStorage.setItem(TEMA_KEY, JSON.stringify(tema)); } catch (e) {} aplicarTema(); }
if (oscuroSistema && oscuroSistema.addEventListener) oscuroSistema.addEventListener("change", () => { if (tema.modo === "auto") aplicarTema(); });
const loaded = {};
let sheet = null;

function leerCfg() {
  try { const c = JSON.parse(localStorage.getItem(CFG) || "null"); if (c) cfg = Object.assign(cfg, c); } catch (e) {}
}
function readStore() {
  leerCfg();
  try {
    const s = JSON.parse(localStorage.getItem(storeKey()) || "null");
    datosLocales = !!s;
    if (s) {
      st = Object.assign(st, s.st || {}); LOG = s.LOG || {}; PROG = s.PROG || {}; CLAUDE = s.CLAUDE || {};
      dirty = Object.assign({estado: false, prog: false, perfil: false, weeks: {}}, s.dirty || {});
      progBorrados = s.progBorrados || [];
      lastSync = s.lastSync || null;
      if (s.perfil) { perfil = s.perfil; perfilRevisado = true; }
      if (s.ui) { ui.week = s.ui.week || st.actual; ui.mas = s.ui.mas || "bloques"; }
    } else if (otraPersona()) { st.actual = 1; ui.week = 1; }  // alguien nuevo empieza en la semana 1
  } catch (e) {}
  if (!Array.isArray(st.rm) || st.rm.length < 5) st.rm = [{}, {}, {}, {}, {}];
}
function saveStore() {
  if (recargando) return false;
  try {
    localStorage.setItem(storeKey(), JSON.stringify({st, LOG, PROG, CLAUDE, dirty, progBorrados, lastSync, perfil, ui: {week: ui.week, mas: ui.mas}}));
    return true;
  } catch (e) { return false; }
}
function saveCfg() { try { localStorage.setItem(CFG, JSON.stringify(cfg)); } catch (e) {} }

/* ── sincronización con GitHub: cada persona con su repositorio ── */
const conectado = () => !!(cfg.token && cfg.owner && cfg.repo);
let syncState = "local";
function setSync(s, msg) {
  syncState = s;
  const b = $("#sync"); if (!b) return;
  b.dataset.s = s;
  $("#sync-txt").textContent = {local: "Local", ok: "Al día", saving: "Guardando", offline: "Sin señal", error: "Revisar"}[s] || s;
  b.title = msg || "";
  if (puerta() === "cargando" && (s === "error" || s === "offline")) { render(); return; }  // que se vea por qué no entra
  if (ui.tab === "mas" && ui.mas === "datos" && !sheet && !editando()) renderMas();
}
/* No se vuelve a dibujar la pantalla mientras escribes: perderías el foco o lo que llevas escrito. */
function editando() {
  const a = document.activeElement;
  return !!a && ["INPUT", "TEXTAREA", "SELECT"].includes(a.tagName);
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
  const pista = r.status === 401 ? " La clave no es válida o venció: crea otra en Más › Datos."
    : r.status === 403 ? " La clave no tiene permiso: en GitHub, «Contents» debe estar en «Read and write»." : "";
  const e = new Error(`GitHub respondió ${r.status}${m ? ": " + m : ""}.${pista}`);
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

/* Invitación a otra persona: el enlace lleva tu usuario y su repositorio (#u=…&r=…), nunca la clave. */
const appUrl = () => typeof location === "undefined" ? "https://epictetotrades.github.io/exponential/" : location.origin + location.pathname;
const enlaceInvitacion = repo => `${appUrl()}#u=${encodeURIComponent(TU_REPO.owner)}&r=${encodeURIComponent(repo)}`;
const enlaceRepoNuevo = repo => "https://github.com/new?" + new URLSearchParams({name: repo, visibility: "private", description: "Registro de Exponential"}).toString();
function leerInvitacion() {
  if (typeof location === "undefined") return;
  const q = new URLSearchParams((location.hash || "").slice(1));
  if (!q.get("r")) return;
  ui.inv = {owner: q.get("u") || TU_REPO.owner, repo: q.get("r")};
  try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
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
const pendientes = () => (dirty.estado ? 1 : 0) + (dirty.prog ? 1 : 0) + (dirty.perfil ? 1 : 0) + (dirty.programa ? 1 : 0) + Object.keys(dirty.weeks).length;
function errorDeRed(e) { return e instanceof TypeError || !navigator.onLine; }

async function flush() {
  if (!conectado()) return;
  if (!pendientes()) { setSync("ok", "Todo guardado en tu cuenta"); return; }
  if (!navigator.onLine) { setSync("offline", "Sin señal: guardado en el teléfono; se sube al volver"); return; }
  setSync("saving", "Guardando…");
  try {
    if (dirty.perfil && otraPersona()) {
      const v = dirty.perfil;
      const r = await getFile("perfil.json");
      await putFile("perfil.json", perfil, r.sha);
      if (dirty.perfil === v) dirty.perfil = false;
    }
    if (dirty.programa) {
      const v = dirty.programa;
      const r = await getFile("programa.json");
      await putFile("programa.json", st.programa || {ninguno: true}, r.sha);
      if (dirty.programa === v) dirty.programa = false;
    }
    if (dirty.estado) {
      const v = dirty.estado;
      const r = await getFile("estado.json");
      await putFile("estado.json", Object.assign({rm: st.rm, jalon: st.jalon, actual: st.actual, peso: st.peso || "", medidas: st.medidas || []}, st.metas ? {metas: st.metas} : {}), r.sha);
      if (dirty.estado === v) dirty.estado = false;
    }
    if (dirty.prog) {
      const v = dirty.prog, borrados = progBorrados.slice();
      const r = await getFile("prog.json");
      PROG = Object.assign({}, (r.data && r.data.ex) || {}, PROG);
      borrados.forEach(id => delete PROG[id]);
      await putFile("prog.json", {ex: PROG, v: 2}, r.sha);
      progBorrados = progBorrados.filter(id => !borrados.includes(id));
      if (dirty.prog === v) dirty.prog = false;
    }
    for (const w of Object.keys(dirty.weeks)) {
      const v = dirty.weeks[w];
      for (let intento = 0; ; intento++) {
        const r = await getFile(weekPath(w));
        LOG[w] = mezclar(LOG[w], r.data ? migrar(+w, r.data.e || {}) : {});
        try { await putFile(weekPath(w), {e: LOG[w], v: 2}, r.sha); break; }
        catch (e) { if (!e.conflict || intento >= 2) throw e; }
      }
      if (dirty.weeks[w] === v) delete dirty.weeks[w];
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
    const [r, c] = await Promise.all([getFile(weekPath(w)), getFile(`claude/w${w}.json`)]);
    const antesC = JSON.stringify(CLAUDE[w] || {});
    CLAUDE[w] = (c.data && c.data.e) || {};
    const cambioC = antesC !== JSON.stringify(CLAUDE[w]);
    if (r.data) LOG[w] = mezclar(LOG[w], migrar(w, r.data.e || {}));
    if (r.data || cambioC) {
      saveStore();
      if (!sheet && !editando() && ui.week === w && (ui.tab === "hoy" || ui.tab === "semana")) render();
    }
  } catch (e) { loaded[w] = false; }
}
async function pull() {
  if (!conectado()) { setSync("local", "Guardado solo en este teléfono"); return; }
  if (!navigator.onLine) { setSync("offline", "Sin señal"); return; }
  setSync("saving", "Leyendo tu cuenta…");
  try {
    if (otraPersona()) {
      const pf = await getFile("perfil.json");
      if (pf.data && !dirty.perfil) perfil = pf.data;
      perfilRevisado = true;
    }
    const pg = await getFile("programa.json");
    if (pg.data && !dirty.programa) {
      const nuevo = pg.data.ninguno ? null : pg.data;
      if (JSON.stringify(nuevo) !== JSON.stringify(st.programa || null)) { st.programa = nuevo; aplicarPlan(); }
    }
    const e = await getFile("estado.json");
    if (e.data && !dirty.estado) {
      const v = e.data;
      if (Array.isArray(v.rm)) st.rm = v.rm;
      if (v.jalon != null) st.jalon = v.jalon;
      if (v.actual) st.actual = v.actual;
      if (v.peso != null) st.peso = v.peso;
      if (Array.isArray(v.medidas)) st.medidas = v.medidas;
      if (v.metas && typeof v.metas === "object") st.metas = v.metas;
    }
    const p = await getFile("prog.json");
    if (p.data) {
      PROG = dirty.prog ? Object.assign({}, p.data.ex || {}, PROG) : (p.data.ex || {});
      progBorrados.forEach(id => delete PROG[id]);
    }
    const semanas = [...new Set([st.actual, ui.week, st.actual - 1].filter(w => w >= 1 && w <= 52))];
    await Promise.all(semanas.map(w => cargarSemana(w, true)));
    saveStore();
    if (!ui.dayTouched) { ui.week = st.actual; autoDia(); }
    if (!sheet && !editando()) render();
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
  const antes = cfg, quienAntes = storeKey();
  cfg = Object.assign({}, antes, {owner, repo, token});
  try { await getFile("estado.json"); }  // comprueba que la clave puede leer el contenido, no solo ver el repo
  catch (e) { cfg = antes; throw e; }
  if (storeKey() !== quienAntes) { saveCfg(); recargar(); return; }  // otra persona: su plan y lo suyo, desde cero
  saveCfg();
  Object.keys(loaded).forEach(k => delete loaded[k]);
  await pull();
  if (syncState === "error") throw new Error($("#sync").title || "No pude sincronizar.");
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
function rango(r) { const m = String(r).replace(/,/g, ".").split(/[–-]/).map(Number).filter(x => !isNaN(x)); return [m[0], m[m.length - 1]]; }
function e1rm(x) { const k = +x.kg, r = +x.reps, rp = +x.rpe; if (!k || !r || !rp) return 0; return k * 100 / pctDeReps(r + (10 - rp)); }
/* Una serie sirve para estimar el máximo si quedan ~6 reps o menos hasta el fallo: sobre ~5 reps la
   estimación pierde precisión (p.115, p.120). Así una descarga a RPE 6 no baja tu máximo, y un single
   de re-test a RPE 8–9 (p.118) sí cuenta. Un AMRAP llega al fallo. */
const MAX_FIABLE = 6;
function estimables(it, sets) {
  if (it.k === "amrap") return sets.map(x => Object.assign({}, x, {rpe: 10}));
  return sets.filter(x => x.rpe != null && +x.reps + (10 - x.rpe) <= MAX_FIABLE);
}
function tramo(w) { return TRAMOS.findIndex(t => w >= t.desde && w <= t.hasta); }
function rmDe(w, lift) {
  if (lift === "jalon") return Number(st.jalon) || DATA.rm_inicial.jalon;
  for (let i = tramo(w); i >= 0; i--) { const v = Number(st.rm[i] && st.rm[i][lift]); if (v > 0) return v; }
  return DATA.rm_inicial[lift];
}
function descanso(it) {
  if (it.descanso) return it.descanso;  // el que trae el programa del catálogo
  if (it.k === "single") return "3–5 min";
  if (it.k === "main") return (Number(it.reps) || 5) <= 6 ? "3–5 min" : "2–3 min";
  if (it.k === "pot") return /sprint/i.test(it.n) ? "2–3 min" : "2 min";
  if (it.k === "acc") { if (it.aps) return "1 min en par"; return COMPUESTOS.has(it.ex) ? "2–3 min" : "1–2 min"; }
  return "";
}

/* ── registros ── */
const slug = t => String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
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
const opcionesHecho = it => [[it.ex, nombrePlan(it) + " (plan)"]].concat(ALT[it.ex] ? ALT[it.ex].op : [], it.alt ? it.alt.map(n => [slug(n), n]) : []);
const hechoDe = (prev, it) => prev && prev.hecho ? prev.hecho : {id: it.ex, n: nombrePlan(it)};
const registrado = prev => !!(prev && (prev.omitido || (prev.sets && prev.sets.length)));
function cargaSugerida(s, it, hid) {
  if (hid && hid !== it.ex) { const p = PROG[hid]; return p ? (p.next || p.kg || "") : ""; }
  let planKg = "";
  if (it.k === "main") planKg = r25(rmDe(s.w, it.lift) * it.pct / 100);
  else if (it.k === "amrap") planKg = cargaAmrap(s);
  else if (it.k === "single") planKg = r25(rmDe(s.w, it.lift) * 0.9);
  else if (it.kg) planKg = it.kg;
  const pr = it.k === "acc" && PROG[it.ex];
  if (pr && pr.w < s.w && pr.reps === String(it.reps) && pr.next) planKg = pr.next;
  return planKg;
}
function aplicarProgresion(w, it, entry, key) {
  const s = W[w - 1];
  const intro = !s.viejo && s.tipo === "acc" && s.k === 0;  // la intro va liviana a propósito (p.104–105)
  if (it.k !== "acc" || NOPROG.includes(s.tipo) || intro || !entry.sets.length) return;
  const [lo, hi] = rango(it.reps), rpeMax = it.rpe ? rango(it.rpe)[1] : 10;
  const carga = Math.max(...entry.sets.map(x => x.kg));
  if (!carga) return;
  const inc = /mancuerna|laterales|posteriores|pájaros/i.test(entry.hecho.n) ? 2 : 2.5;
  const repsTope = entry.sets.every(x => x.reps >= hi);
  const tope = repsTope && entry.sets.every(x => x.rpe == null || x.rpe <= rpeMax);
  const bajo = entry.sets.some(x => x.reps < lo);
  const sobre = entry.sets.every(x => x.reps >= hi + 2);  // muy por encima del rango: la carga quedó liviana
  let next, motivo;
  if (sobre) {
    // Carga que deja el tope del rango al RPE máximo, según la tabla de p.64. Sobre ~5 reps la
    // estimación pierde precisión (p.115, p.120), así que el salto se limita a +10 %.
    const est = entry.sets.filter(x => x.kg > 0 && x.rpe != null).map(x => x.kg * 100 / pctDeReps(x.reps + 10 - x.rpe));
    const objetivo = est.length ? Math.min(...est) * pctDeReps(hi + 10 - rpeMax) / 100 : carga + 2 * inc;
    next = Math.round(Math.max(carga + inc, Math.min(objetivo, carga * 1.1)) / inc) * inc;
    motivo = `pasaste el rango (${entry.sets.map(x => x.reps).join(", ")} reps para ${it.reps}): sube para volver al rango (tabla p.64)`;
  } else {
    next = tope ? carga + inc : bajo ? Math.max(0, carga - inc) : carga;
    motivo = tope ? `llegaste al tope de ${hi} reps en todas las series`
      : bajo ? `quedaste bajo ${lo} reps en alguna serie`
      : repsTope ? `llegaste a ${hi} reps, pero con RPE sobre ${f(rpeMax)}: repite la carga`
      : `aún no llegas a ${hi} reps en todas`;
  }
  PROG[entry.hecho.id] = {w, reps: String(it.reps), kg: carga, next, motivo, n: entry.hecho.n, key};
  progBorrados = progBorrados.filter(id => id !== entry.hecho.id);
  dirty.prog = marca();
}
function resumen(sets) {
  if (!sets || !sets.length) return "";
  const uno = x => (x.kg ? f(x.kg) + " × " : "") + (x.reps ?? "?") + (x.kg ? "" : " reps") + (x.lado ? (x.lado === "izq" ? " I" : " D") : "");
  const iguales = !sets.some(x => x.lado) && sets.every(x => x.kg === sets[0].kg && x.reps === sets[0].reps);
  const rpes = sets.map(x => x.rpe).filter(x => x != null);
  const base = iguales ? `${uno(sets[0])} · ${sets.length} ${sets.length === 1 ? "serie" : "series"}` : sets.map(uno).join(" · ");
  return base + (rpes.length ? ` · RPE ${rpes.map(f).join(" / ")}` : "");  // con «, » no se distingue 8, 8,5 de 8,8
}
/* S1–S10 se rediseñaron con la Pirámide cuando ya habían pasado: quedan como plantilla, no como pendientes. */
const esPlantilla = w => esTuyo() && w <= 10 && w < st.actual;
function estadoItem(s, it, prev) {
  if (registrado(prev)) {
    if (prev.omitido) return ["omi", "No lo hice"];
    const h = hechoDe(prev, it);
    if (h.id !== it.ex) return ["cam", "Cambio"];
    return nHechas(prev, it) < nSeries(it) ? ["par", "Parcial"] : ["ok", "Hecho"];
  }
  if (esPlantilla(s.w)) return ["pend", "Plantilla"];
  if (s.w < st.actual) return ["fal", "Falta"];
  return ["pend", s.w === st.actual ? "Por hacer" : "Pendiente"];
}
function guardarEntrada(w, key, entry, it) {
  LOG[w] = LOG[w] || {};
  const prev = LOG[w][key];
  const idPrev = prev && prev.hecho && prev.hecho.id;
  if (idPrev && idPrev !== (entry.hecho && entry.hecho.id) && PROG[idPrev] && PROG[idPrev].key === key && PROG[idPrev].w === w) {
    delete PROG[idPrev]; progBorrados.push(idPrev); dirty.prog = marca();
  }
  LOG[w][key] = entry;
  if (it) aplicarProgresion(w, it, entry, key);
  dirty.weeks[w] = marca();
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
const cicloD = c => c.id === "C1" && !esTuyo() ? "S1–S10 Pirámide · S11–S18 dos olas de intensidad" : c.d;
/* AMRAP de banca en los tests: tu meta son 100 kg. A otra persona, el 70 % de su máximo: el último tramo
   de la tabla de p.64 (11–12 reps), para que el resultado caiga dentro de la tabla. */
const cargaAmrap = s => { const mb = metaBanca_(); return mb ? mb.kg : r25(rmDe(s.w, "banca") * 0.7); };
function planTxt(s, it) {
  if (it.k === "main") return `${it.sets} × ${it.reps} · ${kg(r25(rmDe(s.w, it.lift) * it.pct / 100))}${it.rpe ? " · RPE " + it.rpe : ""}`;
  if (it.k === "single") { const rm = rmDe(s.w, it.lift); return `${kg(r25(rm * .8))} → ${kg(r25(rm * .9))} → single a RPE ${it.rpe}`; }
  if (it.k === "amrap") return `1 serie al máximo con ${kg(cargaAmrap(s))}`;
  if (it.k === "pot") return it.pres + (it.pct ? " · " + kg(r25(rmDe(s.w, it.lift) * it.pct / 100)) : "");
  const pr = PROG[it.ex], usaReg = pr && pr.w < s.w && pr.reps === String(it.reps) && pr.next;
  const carga = it.pc ? " · peso corporal" : usaReg ? ` · ≈ ${kg(pr.next)}` : it.kg ? ` · ≈ ${kg(it.kg)}` : "";
  return `${it.sets} × ${it.reps}${carga}${it.rpe ? " · RPE " + it.rpe : ""}`;
}
function detalleTxt(s, it) {
  const sub = [];
  if (it.k === "main") {
    const rm = rmDe(s.w, it.lift), carga = r25(rm * it.pct / 100);
    sub.push(NOPROG.includes(s.tipo)
      ? `${f(it.pct)} % de ${f(rm)}. Semana de ${s.tipo === "desc" ? "descarga" : s.tipo === "test" ? "test" : "taper"}: usa esta carga aunque se sienta fácil; no la subas para llegar al RPE (p.105, p.136, p.246).`
      : `${f(it.pct)} % de ${f(rm)}. Si la primera serie no cae en ese RPE, ajusta la carga (p.246).`);
    if (it.ola_cond) sub.push(`Segunda ola: si la primera te quedó bajo el RPE, usa ${kg(carga + it.ola_cond)} (p.243).`);
  } else if (it.k === "single") {
    sub.push(`Sube por el 80 % y el 90 % de ${f(rmDe(s.w, it.lift))}; el último, a RPE 8–9, sin llegar al fallo (p.118). Anota carga y RPE y la app estima tu máximo.`);
  } else if (it.k === "amrap") {
    const b = rmDe(s.w, "banca"), a = cargaAmrap(s);
    sub.push(`${esTuyo() ? "Tu meta." : "Test de repeticiones."} Con asistente o barras de seguridad: aquí el fallo tiene un propósito (p.67). Con un 1RM de ${f(b)}, la tabla de p.64 da ≈ ${repsTxt(repsDePct(a / b * 100))} reps con ${kg(a)}.`);
  } else if (it.k === "acc") {
    const pr = PROG[it.ex], usaReg = pr && pr.w < s.w && pr.reps === String(it.reps) && pr.next;
    if (usaReg) sub.push(`Según tu registro de S${pr.w} (${kg(pr.kg)}): ${pr.motivo}.`);
    else if (pr && pr.w < s.w) sub.push(`Tu última vez: ${kg(pr.kg)} en S${pr.w}, con otro rango de reps; ajusta por RPE.`);
    else if (it.desde) sub.push(it.desde.charAt(0).toUpperCase() + it.desde.slice(1) + (it.desde.startsWith("desde") ? " (convertida con la tabla de p.64)." : "."));
    else if (!it.pc) sub.push("Elige la carga que te deje en ese RPE.");
    if (it.aps) sub.push(`En par con ${it.aps}, ~1 min entre series (p.179).`);
    if (it.lado) sub.push(`Por lado: anota cada lado por separado, empezando por el ${esTuyo() ? "izquierdo" : "más débil"}.`);
  }
  if (it.txt && it.k !== "nota" && it.k !== "pot") sub.push(it.txt);
  if (it.alt) sub.push(`Si hoy no va: ${it.alt.join(" o ")}. Elígela en «Hiciste» y carga por RPE.`);
  const a = ALT[it.ex];
  const ac = a && (esTuyo() || !/tu preferida/.test(a.c)) ? a.c : "";  // «la máquina es tu preferida» es tuyo
  if (a) sub.push(`Si hoy no va: ${a.op.map(o => o[1]).join(" o ")}${ac ? " — " + ac : ""}. Elígela en «Hiciste» y carga por RPE.`);
  return sub;
}

/* ── render: cabecera (la cinta del año, igual en todas las pestañas) ── */
function cintaHtml() {
  return `<div class="cinta-b">${CICLOS.map(c => `<span class="cinta-g" style="flex:${c.w[1] - c.w[0] + 1}">${Array.from({length: c.w[1] - c.w[0] + 1}, (_, i) => {
    const w = c.w[0] + i;
    return `<i class="${w < st.actual ? "p" : w === st.actual ? "a" : ""}${w === ui.week && w !== st.actual ? " v" : ""}"></i>`;
  }).join("")}</span>`).join("")}</div>
  <div class="cinta-c">${CICLOS.map(c => `<span style="flex:${c.w[1] - c.w[0] + 1}">${c.id}</span>`).join("")}</div>`;
}
function header() {
  $("#h-eyebrow").textContent = `Año 1 · semana ${st.actual} de 52`;
  const c = $("#cinta"); if (!c) return;  // página vieja en caché: sin cinta, el resto funciona
  c.innerHTML = cintaHtml();
  c.setAttribute("aria-label", `El año en 52 semanas: vas en la ${st.actual}${ui.week !== st.actual ? ` y estás viendo la ${ui.week}` : ""}.`);
}

/* ── render: Hoy (el día como línea; el ejercicio en curso se registra ahí mismo) ── */
// por lado (búlgara, copenhagen): las series del plan son por pierna, así que se anotan el doble
const nSeries = it => it.k === "single" || it.k === "amrap" ? 1 : (+it.sets || 1) * (it.lado ? 2 : 1);
/* Series anotadas. Hasta la 2.1, lo «por lado» se anotaba una vez por las dos piernas: esas series cuentan doble. */
const nHechas = (p, it) => p && p.sets && !p.omitido ? p.sets.length * (it.lado && !p.sets.some(x => x.lado) ? 2 : 1) : 0;
const esBasico = it => ["main", "single", "amrap"].includes(it.k);
const incKg = (it, n) => esBasico(it) ? 2.5 : /mancuerna|laterales|posteriores|pájaros/i.test(n || it.n) ? 2 : 2.5;
const RPES = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];  // el plan va de RPE 5 (intro y descargas) a 10
const corto = n => /Potencia/.test(n) ? "Potencia" : n.split(" · ")[0];

/* Discos por lado, con barra olímpica de 20 kg. */
const BARRA = 20, DISCOS = [25, 20, 15, 10, 5, 2.5, 1.25];
const CON_BARRA = new Set(["banca", "sentadilla", "pausa", "peso_muerto", "cerrado", "remo", "rumano"]);
function discos(kgv) {
  const k = num(kgv); if (!(k >= BARRA)) return "";
  let lado = (k - BARRA) / 2;
  if (lado < 0.01) return "solo la barra";
  const out = [];
  for (const d of DISCOS) while (lado >= d - 1e-9) { out.push(d); lado -= d; }
  return out.map(d => String(d).replace(".", ",")).join(" + ")  // f() redondea a 1 decimal: 1,25 saldría 1,3 + (lado > 0.01 ? ` (faltan ${f(lado)})` : "");
}
/* Calentamiento antes de la primera serie de trabajo, en % del peso de trabajo (p.224). */
function calentamiento(it, kgTrabajo, conBarra) {
  const k = num(kgTrabajo); if (!(k > 0)) return [];
  const pocas = it.k === "single" || rango(it.reps)[1] <= 5;
  const pasos = pocas ? [[0, "5–10"], [.5, 5], [.6, 4], [.7, 3], [.8, 2], [.9, 1]] : [[.5, 8], [.7, 4], [.9, 2]];
  return pasos.filter(([p]) => p || conBarra).map(([p, r]) => p ? `${f(r25(k * p))} × ${r}` : `Barra × ${r}`);
}
/* Series por músculo con la tabla de p.214: primario 1, secundario 0,5 (tu regla). La potencia no cuenta (p.139). */
const SQ_LIBRE = {cuadriceps: 1, gluteo: 1, lumbar: 0.5}, SQ_MAQ = {cuadriceps: 1, gluteo: 1};
const BISAGRA = {gluteo: 1, isquios: 1, lumbar: 1, trapecio: 0.5}, JALON = {dorsal: 1, biceps: 1, hombro_post: 0.5};
const REMO = {dorsal: 1, trapecio: 1, hombro_post: 0.5, biceps: 0.5, hombro_lat: 0.5}, BANCA = {pecho: 1, hombro_ant: 1, triceps: 0.5};
const INCL = {pecho: 1, hombro_ant: 1, triceps: 0.5, hombro_lat: 0.5}, CERR = {pecho: 1, hombro_ant: 1, triceps: 1};
const MIL = {hombro_ant: 1, triceps: 1, hombro_lat: 0.5}, APER = {pecho: 1, hombro_ant: 0.5};
const SOLO = g => ({[g]: 1});
const MUSC = {
  sentadilla: SQ_LIBRE, pausa: SQ_LIBRE, bulgara: SQ_LIBRE, zancadas: SQ_LIBRE, sent_safety: SQ_LIBRE,
  prensa: SQ_MAQ, hack: SQ_MAQ, hack_pausa: SQ_MAQ, sent_smith: SQ_MAQ, bulgara_smith: SQ_MAQ, prensa_unilateral: SQ_MAQ,
  rumano: BISAGRA, peso_muerto: BISAGRA, pm_hex: BISAGRA, hiper45: BISAGRA, ghd_cadera: BISAGRA, hipthrust_maq: {gluteo: 1, isquios: 0.5},
  jalon: JALON, jalon_v: JALON, jalon_ancho: JALON, dominada_banda: JALON,
  remo: REMO, remo_pecho: REMO, remo_polea: REMO,
  banca: BANCA, press_pecho_maq: BANCA, banca_smith: BANCA, inclinado: INCL, inclinado_smith: INCL,
  cerrado: CERR, cerrado_smith: CERR, militar: MIL, militar_smith: MIL, pecdeck: APER, aperturas_polea: APER,
  laterales: SOLO("hombro_lat"), lateral_maq: SOLO("hombro_lat"), lateral_polea: SOLO("hombro_lat"),
  posteriores: SOLO("hombro_post"), facepull: SOLO("hombro_post"), pajaros_inclinado: SOLO("hombro_post"), pecdeck_inv: SOLO("hombro_post"),
  curl_z: SOLO("biceps"), martillo: SOLO("biceps"), predicador: SOLO("biceps"), curl_maq: SOLO("biceps"), martillo_polea: SOLO("biceps"), scott_mancuerna: SOLO("biceps"),
  polea: SOLO("triceps"), frances: SOLO("triceps"), triceps_sobre_cabeza: SOLO("triceps"), frances_mancuernas: SOLO("triceps"), "otro:tricep_v_bar": SOLO("triceps"),
  femoral: SOLO("isquios"), nordico_ghd: SOLO("isquios"), extension: SOLO("cuadriceps"), extension_polea: SOLO("cuadriceps"),
  gemelo_pie: SOLO("gemelo"), gemelo_sent: SOLO("gemelo"), gemelo_smith: SOLO("gemelo"), gemelo_hack: SOLO("gemelo"), gemelo_prensa: SOLO("gemelo"),
  abduccion: SOLO("gluteo"), abductor_maq: SOLO("gluteo"), abduccion_banda: SOLO("gluteo"),
  copenhagen: {}, aductor_maq: {}, pallof: {}, pallof_banda: {},
};
function volumenSemana(s, hecho) {
  const v = {}, log = LOG[s.w] || {};
  s.dias.forEach(d => itemsEj(d).forEach(it => {
    const p = log[claveDe(d.id, it)];
    let n = nSeries(it), id = it.ex;
    if (hecho) {
      if (!registrado(p) || p.omitido) return;
      n = nHechas(p, it);
      const h = hechoDe(p, it).id; if (MUSC[h]) id = h;
    }
    if (it.lado) n /= 2;  // por lado: cada pierna cuenta sus series
    Object.entries(MUSC[id] || MUSC[it.ex] || {}).forEach(([g, w]) => { v[g] = (v[g] || 0) + n * w; });
  }));
  return v;
}
function itemsEj(d) { return d.items.filter(it => ["main", "acc", "single", "amrap"].includes(it.k)); }
function serieTxt(x) {
  const k = num(x.kg), r = x.reps === "" || x.reps == null ? "?" : x.reps;
  return (k ? f(k) + " × " + r : r + " reps") + (x.rpe != null && x.rpe !== "" ? " · RPE " + f(+x.rpe) : "") + (x.lado ? (x.lado === "izq" ? " · izq." : " · der.") : "");
}
function dayNav(s) {
  return `<nav class="dias" aria-label="Días">${s.dias.map((d, i) => {
    const ej = itemsEj(d), log = LOG[s.w] || {};
    const hechos = ej.filter(it => registrado(log[claveDe(d.id, it)])).length;
    const pct = ej.length ? Math.round(hechos / ej.length * 100) : 0;
    return `<button class="dia" data-day="${i}" aria-pressed="${i === ui.day}" aria-label="Día ${i + 1}: ${esc(d.n)}, ${hechos} de ${ej.length} ejercicios"><b>D${i + 1}</b><span>${esc(corto(d.n))}</span><i><u style="width:${pct}%"></u></i></button>`;
  }).join("")}</nav>`;
}
/* La serie en curso: qué ejercicio está abierto en Hoy y los números que llevas. */
let edit = null;  // {w, key, idx, kg, reps, rpe}
function nuevoEdit(w, key, idx) {
  const s = W[w - 1], it = itemDeClave(w, key); if (!it) return null;
  const prev = (LOG[w] || {})[key];
  const sets = prev && prev.sets && !prev.omitido ? prev.sets : [];
  const i = idx == null ? sets.length : Math.min(idx, sets.length);
  const ref = sets[i] || sets[sets.length - 1];
  const ultimo = sets.length ? sets[sets.length - 1].lado : null;  // por lado: alterna, empezando por la izquierda (tu plan)
  return {w, key, idx: i,
    kg: ref ? ref.kg : (cargaSugerida(s, it, hechoDe(prev, it).id) || ""),
    reps: ref ? ref.reps : it.k === "single" ? 1 : it.k === "amrap" ? "" : rango(it.reps)[0],
    rpe: sets[i] && sets[i].rpe != null ? sets[i].rpe : null,
    lado: it.lado ? (sets[i] ? sets[i].lado || "izq" : ultimo === "izq" ? "der" : "izq") : null};
}
function pendienteDelDia(s, d) {
  const log = LOG[s.w] || {};
  const it = itemsEj(d).find(it => { const p = log[claveDe(d.id, it)]; return !registrado(p) || (!p.omitido && nHechas(p, it) < nSeries(it)); });
  return it ? claveDe(d.id, it) : null;
}
const numTxt = v => typeof v === "number" ? f(v) : String(v ?? "");
function stepper(fld, val) {
  const lbl = fld === "kg" ? "Kilos" : "Reps";
  return `<div class="stp"><span class="k">${fld === "kg" ? "KG" : "REPS"}</span><div class="stp-in">
    <button data-stp="${fld}" data-d="-1" aria-label="Bajar ${lbl.toLowerCase()}">−</button>
    <input class="num" data-ed="${fld}" type="text" inputmode="${fld === "kg" ? "decimal" : "numeric"}" enterkeyhint="${fld === "kg" ? "next" : "done"}" value="${esc(numTxt(val))}" placeholder="${fld === "kg" ? "kg" : "reps"}" aria-label="${lbl} de la serie">
    <button data-stp="${fld}" data-d="1" aria-label="Subir ${lbl.toLowerCase()}">+</button></div></div>`;
}
function rpeHtml(v) {
  const x = v === "" || v == null ? null : +v;
  return `<div class="rpe"><span class="k">RPE</span><div class="rpe-g" role="group" aria-label="RPE de la serie">${RPES.map(r => `<button data-rpe="${r}" aria-pressed="${x === r}">${f(r)}</button>`).join("")}</div></div>`;
}
function feedbackHtml(s, d, it, prev) {
  let fb = "";
  if (registrado(prev) && !prev.omitido) {
    const h = hechoDe(prev, it);
    if (h.id === it.ex && esBasico(it) && it.ex !== "pausa") {
      const lift = it.lift || "banca", est = Math.max(0, ...estimables(it, prev.sets).map(e1rm));
      if (est) {
        const actual = rmDe(s.w, lift), v = r05(est);
        fb = `<div class="prox"><span class="k">MÁXIMO</span><span>Tu registro estima un máximo de ≈ ${kg(v)} (usas ${kg(actual)}).${Math.abs(v - actual) / actual >= 0.02 ? ` <button class="link-btn" data-setrm="${lift}" data-v="${v}" data-w="${s.w}">Usar ${kg(v)} como máximo</button>` : ""}</span></div>`;
      } else if (prev.sets.some(x => x.rpe != null)) fb = `<p class="hint">Con tanto margen hasta el fallo, el máximo no se puede estimar bien (p.115, p.120). Para estimarlo sirve una serie de 1–3 reps a RPE 8–9 (p.118).</p>`;
      else fb = `<p class="hint">Anota el RPE de alguna serie para estimar tu máximo.</p>`;
    }
    if (it.k === "acc" && PROG[h.id] && PROG[h.id].w === s.w) fb = `<div class="prox"><span class="k">PRÓXIMA</span><span>Próxima vez en ${esc(h.n)}: <b class="mono">${kg(PROG[h.id].next)}</b> · ${esc(PROG[h.id].motivo)}.</span></div>`;
  }
  const nc = (CLAUDE[s.w] || {})[claveDe(d.id, it)];
  if (nc && nc.txt) fb += `<div class="claude"><span class="k">CLAUDE</span><p>${esc(nc.txt)}</p></div>`;
  return fb;
}
function itemRow(s, d, it) {
  if (it.k === "nota") return `<div class="paso nota"><div class="riel"><i class="nodo"></i><s></s></div><div class="cuerpo"><b>${esc(it.n)}</b><span>${esc(it.txt)}</span></div></div>`;
  if (it.k === "pot") return `<div class="paso pot"><div class="riel"><i class="nodo"></i><s></s></div><div class="cuerpo"><span class="tag">Potencia · descanso ${descanso(it)}</span><b class="nombre">${esc(it.n)}</b><span class="v">${esc(planTxt(s, it))}</span>${it.txt ? `<span class="hint">${esc(it.txt)}</span>` : ""}</div></div>`;
  const key = claveDe(d.id, it), prev = (LOG[s.w] || {})[key];
  const [cls, txt] = estadoItem(s, it, prev);
  const h = registrado(prev) ? hechoDe(prev, it) : null;
  const hecho = !h ? "" : prev.omitido ? "No lo hiciste" : (h.id !== it.ex ? h.n + ": " : "") + resumen(prev.sets);
  const det = detalleTxt(s, it);
  const extra = feedbackHtml(s, d, it, prev) + (det.length ? `<details class="more"><summary>Detalles</summary><div>${det.map(esc).join("<br>")}</div></details>` : "");
  const abierto = ui.abierto === key && edit && edit.key === key && edit.w === s.w;
  if (!abierto) return `<div class="paso ${cls}"><div class="riel"><i class="nodo"></i><s></s></div><div class="cuerpo">
    <button class="ex" data-abrir="${esc(key)}" aria-expanded="false">
      <span class="ex-h"><b class="nombre">${esc(conMeta(it.n))}</b><span class="chip ${cls}">${txt}</span></span>
      <span class="kv"><span class="k">PLAN</span><span class="v">${esc(planTxt(s, it))}</span>${hecho ? `<span class="k">HECHO</span><span class="v fuerte">${esc(hecho)}</span>` : ""}</span>
      ${prev && prev.com ? `<span class="cita">“${esc(prev.com)}”</span>` : ""}
    </button>${extra}</div></div>`;
  const sets = prev && prev.sets && !prev.omitido ? prev.sets : [];
  const tags = [esBasico(it) ? "Básico" : it.prio ? "Prioridad" : "", it.lado ? "por lado" : "", "descanso " + descanso(it)].filter(Boolean).join(" · ");
  const hh = hechoDe(prev, it), barra = CON_BARRA.has(hh.id);
  // calentamiento (p.224): solo en los básicos y antes de la primera serie de trabajo
  const pasos = it.k === "main" && !sets.length ? calentamiento(it, cargaSugerida(s, it, hh.id), barra) : [];
  const listos = ui.calor[key] || [];
  const calor = pasos.length ? `<div class="calor"><span class="k acc">Calentamiento · ${listos.length} de ${pasos.length} <span class="pg">p.224</span></span>
      <div class="scs">${pasos.map((t, i) => `<button class="sc ${listos.includes(i) ? "hecha" : "nueva"}" data-calor="${esc(key)}" data-i="${i}" aria-pressed="${listos.includes(i)}">${listos.includes(i) ? ICON.ok : ""}${esc(t)}</button>`).join("")}</div>
      <span class="hint">Sube por el 50 al 90 % de tu carga de trabajo. Toca cada uno al hacerlo; no se guarda como serie.</span></div>` : "";
  const lados = it.lado ? `<div class="seg lado" style="--n:2;margin-top:0" role="group" aria-label="Pierna">${[["izq", "Izquierda"], ["der", "Derecha"]].map(([v, n]) => `<button data-lado="${v}" aria-pressed="${edit.lado === v}">${n}</button>`).join("")}</div>
      ${sets.some(x => x.lado) ? `<span class="hint">Esta semana ·${["izq", "der"].map(l => `${l === "izq" ? "izquierda" : "derecha"}: ${sets.filter(x => x.lado === l).map(x => x.reps).join(", ") || "—"}`).join(" · ")} reps</span>` : ""}` : "";
  const disc = barra && discos(edit.kg) ? `<div class="discos">Por lado: <b class="mono" id="discos-v">${esc(discos(edit.kg))}</b> · barra de 20 kg</div>` : "";
  const chips = sets.map((x, i) => `<button class="sc hecha${i === edit.idx ? " sel" : ""}" data-editset="${i}" aria-pressed="${i === edit.idx}" aria-label="Editar la serie ${i + 1}">${ICON.ok}${i + 1} · ${esc(serieTxt(x))}</button>`).join("")
    + `<button class="sc nueva${edit.idx === sets.length ? " sel" : ""}" data-editset="${sets.length}" aria-pressed="${edit.idx === sets.length}">${sets.length + 1} · ${edit.idx === sets.length ? "en curso" : "nueva"}</button>`;
  return `<div class="paso abierto ${cls}"><div class="riel"><i class="nodo"></i><s></s></div><div class="cuerpo">
    <div class="tarjeta">
      <button class="ex" data-abrir="${esc(key)}" aria-expanded="true">
        <span class="ex-h"><b class="nombre">${esc(conMeta(it.n))}</b><span class="tag">${esc(tags)}</span></span>
        <span class="v">${esc(planTxt(s, it))}</span>
      </button>
      ${calor}
      <div class="scs">${chips}</div>
      ${lados}
      <div class="editor">${stepper("kg", edit.kg)}${stepper("reps", edit.reps)}</div>
      ${disc}
      ${rpeHtml(edit.rpe)}
      <button class="link-row" data-open="${esc(key)}">${ICON.ajustes}<span>Variante, todas las series y comentario</span>${ICON.next}</button>
      <button class="link-row" data-hist="${esc(hh.id)}" data-n="${esc(hh.n)}">${ICON.hist}<span>Historial de este ejercicio</span>${ICON.next}</button>
    </div>${extra}</div></div>`;
}
function renderHoy() {
  const s = W[ui.week - 1], d = s.dias[ui.day], log = LOG[s.w] || {};
  if (ui.abierto === undefined) ui.abierto = s.w === st.actual ? pendienteDelDia(s, d) : null;
  if (ui.abierto && !(edit && edit.key === ui.abierto && edit.w === s.w)) edit = nuevoEdit(s.w, ui.abierto);
  if (!ui.abierto) edit = null;
  const ej = itemsEj(d);
  const series = ej.reduce((a, it) => a + nHechas(log[claveDe(d.id, it)], it), 0);
  const plan = ej.reduce((a, it) => a + nSeries(it), 0);
  const extras = log["x~" + d.id] || [], nd = log["n~" + d.id], ncDia = (CLAUDE[s.w] || {})["dia~" + d.id];
  const ctx = s.w === st.actual ? "" : `<div class="ctx"><span>${esPlantilla(s.w) ? "Plantilla" : s.w < st.actual ? "Ya pasó" : "Por venir"} · S${s.w} · ${esc(etiqueta(s))}</span><button class="link-btn" data-today>Ir a la S${st.actual}</button></div>`;
  const sub = !ej.length ? `D${ui.day + 1} · sin ejercicios con series` : `D${ui.day + 1} · ${ej.length} ejercicios · ${series} de ${plan} series`;
  $("#v-hoy").innerHTML = `${ctx}${dayNav(s)}
    <div class="titulo"><h1>${esc(d.n)}</h1><p class="sub">${esc(sub)}</p></div>
    ${edit && typeof navigator !== "undefined" && navigator.wakeLock ? `<div class="ctx pantalla"><span>Pantalla encendida mientras entrenas</span><button class="switch" role="switch" data-pantalla aria-checked="${pantallaOn()}" aria-label="Pantalla encendida mientras entrenas"><i></i></button></div>` : ""}
    ${ncDia && ncDia.txt ? `<div class="claude"><span class="k">CLAUDE · ESTE DÍA</span><p>${esc(ncDia.txt)}</p></div>` : ""}
    <div class="linea">${d.items.map(it => itemRow(s, d, it)).join("") || '<p class="mut">Día libre o de movilidad.</p>'}</div>
    ${extras.length ? `<h2>Extras</h2><div class="lista">${extras.map((x, i) => `<div class="row"><div class="ex-h"><b class="nombre">${esc(x.n)}</b><button class="btn quiet chico" data-delx="${d.id}" data-i="${i}">Borrar</button></div>
      <div class="kv"><span class="k">HECHO</span><span class="v fuerte">${esc(resumen(x.sets))}</span></div></div>`).join("")}</div>` : ""}
    <div class="acciones"><button class="btn ghost" data-extra-open="${d.id}">Añadir ejercicio extra</button></div>
    <label class="fl notas">Notas del día<textarea class="inp" rows="3" data-dn="${d.id}" placeholder="Sueño, cansancio, ${esTuyo() ? "tenis" : "deporte"} ese día, cambios de orden… (se guarda solo)">${esc(nd && nd.txt ? nd.txt : "")}</textarea></label>`;
}
/* Mientras escribes no se redibuja: solo se actualizan los números, el RPE y la barra. */
function pintarEditor() {
  if (!edit) return;
  const r = $("#v-hoy");
  ["kg", "reps"].forEach(fld => { const i = r.querySelector(`[data-ed="${fld}"]`); if (i && document.activeElement !== i) i.value = numTxt(edit[fld]); });
  r.querySelectorAll(".tarjeta [data-rpe]").forEach(b => b.setAttribute("aria-pressed", String(edit.rpe != null && +b.dataset.rpe === +edit.rpe)));
  const dv = r.querySelector("#discos-v"); if (dv) dv.textContent = discos(edit.kg) || "—";
  pintarBarra();
  guardarBorrador();
}
function guardarSerie() {
  if (!edit) return;
  const {w, key} = edit, s = W[w - 1], it = itemDeClave(w, key); if (!it) return;
  const reps = num(edit.reps), kgv = num(edit.kg);
  if (!(reps > 0)) { toast("Anota las reps de la serie."); return; }
  const prev = (LOG[w] || {})[key];
  const sets = prev && prev.sets && !prev.omitido ? prev.sets.slice() : [];
  const i = Math.min(edit.idx, sets.length);
  sets[i] = {kg: kgv ?? 0, reps, rpe: edit.rpe == null ? null : +edit.rpe};
  if (it.lado) sets[i].lado = edit.lado || "izq";
  const entry = {v: 2, t: Date.now(), plan: {id: it.ex, n: nombrePlan(it)}, hecho: hechoDe(prev, it), sets};
  if (prev && prev.com) entry.com = prev.com;
  guardarEntrada(w, key, entry, it);
  if (w === st.actual) iniciarDescanso(segundosDescanso(descanso(it)), nombrePlan(it));
  const h = entry.hecho, pr = PROG[h.id], completo = sets.length >= nSeries(it) && i === sets.length - 1;
  if (completo) {
    const d = s.dias.find(x => x.id === key.split(":")[0]), sig = d ? pendienteDelDia(s, d) : null;
    ui.abierto = sig; edit = sig ? nuevoEdit(w, sig) : null;
  } else edit = nuevoEdit(w, key, sets.length);
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  ui.dockCtl = false;
  render();
  toast(`Serie ${i + 1} guardada.` + (completo && it.k === "acc" && pr && pr.w === w ? ` Próxima vez: ${kg(pr.next)}.` : ""));
}

/* ── render: Semana (la semana entera como planilla) ── */
/* Volumen por músculo: el plan (borde) y lo que anotaste (relleno); en rojo, donde faltan 2 series o más. */
function barras(plan, hecho, marcar) {  // marcar: solo en semanas cerradas; a mitad de semana faltaría todo
  const ancho = x => Math.min(100, x / 24 * 100).toFixed(1);
  return `<div class="vol">${G.map(g => {
    const p = plan[g.id] || 0, h = hecho ? hecho[g.id] || 0 : null, falta = marcar && h != null && p - h >= 2;
    return `<div class="vr${falta ? " falta" : ""}"><span>${esc(g.n)}</span><div class="track"><i class="band"></i>${h != null
      ? `<i class="plan" style="width:${ancho(p)}%"></i><i class="fill${falta ? " en" : ""}" style="width:${ancho(h)}%"></i>`
      : `<i class="fill${p >= 10 && p <= 20 ? " en" : ""}" style="width:${ancho(p)}%"></i>`}</div><span class="vn">${h != null ? `${f(h)}<small>/${f(p)}</small>` : f(p)}</span></div>`;
  }).join("")}</div>`;
}
/* Re-test del máximo al cierre de la semana (tu planificador: «Re-test 1RM» en la S14). */
function retestHtml(s) {
  if (!/Re-test 1RM/.test(s.nota || "")) return "";
  const log = LOG[s.w] || {};
  return `<h2>Re-test del máximo</h2>
    <p class="small mut">Al cierre de la semana: sube por el 80 % × 2 y el 90 % × 1, como en el calentamiento <span class="pg">p.224</span>, y termina con un single a RPE 8–9, sin llegar al fallo <span class="pg">p.118</span>. El máximo nuevo recalcula las cargas de S15–S18.</p>
    <div class="rt-l">${[["banca", "Press de banca"], ["sentadilla", "Sentadilla"]].map(([lift, n]) => {
      const rm = rmDe(s.w, lift), x = log["rt~" + lift], b = ui.rt[lift] || {};
      const est = x ? r05(e1rm({kg: x.kg, reps: 1, rpe: x.rpe})) : 0, rpe = b.rpe ?? (x ? x.rpe : null);
      const paso = p => { const k = r25(rm * p); return `<div class="rt-p"><span class="k">${Math.round(p * 100)} %</span><span><b class="mono">${kg(k)} × ${p < 0.85 ? "2" : "1"}</b><span class="hint">por lado ${discos(k)}</span></span></div>`; };
      return `<div class="rt"><div class="rt-h"><b>${n}</b><span class="mono mut">máximo actual ${f(rm)} kg</span></div>${paso(0.8)}${paso(0.9)}
        <div class="rt-s"><span class="k acc">Single · RPE 8–9</span>
          <div class="rt-in"><label class="fl">Kg<input class="inp mono" data-rtkg="${lift}" inputmode="decimal" value="${esc(b.kg ?? (x ? f(x.kg) : ""))}" placeholder="kg"></label>
            <div class="rpe-g rt-rpe" role="group" aria-label="RPE del single">${[8, 8.5, 9].map(r => `<button data-rtrpe="${lift}" data-v="${r}" aria-pressed="${rpe === r}">${f(r)}</button>`).join("")}</div></div>
          <button class="btn" data-rtsave="${lift}" data-w="${s.w}">Guardar el single</button>
          ${x ? `<div class="prox"><span class="k">MÁXIMO</span><span>${f(x.kg)} × 1 a RPE ${f(x.rpe)} → ≈ <b class="mono">${kg(est)}</b> (tabla p.64).${Math.abs(est - rm) / rm >= 0.02 ? ` <button class="link-btn" data-setrm="${lift}" data-v="${est}" data-w="${s.w}">Usar ${kg(est)} como máximo</button>` : ""}</span></div>` : ""}
        </div></div>`;
    }).join("")}</div>`;
}
function renderSemana() {
  const s = W[ui.week - 1], log = LOG[s.w] || {}, c = ciclo(s), plantilla = esPlantilla(s.w);
  const estado = s.w === st.actual ? "semana actual" : plantilla ? "plantilla" : s.w < st.actual ? "ya pasó" : "por venir";
  const lifts = [], notas = [], faltan = [];
  let tot = 0, hechos = 0, series = 0, plan = 0, diasCon = 0;
  const filas = s.dias.map((d, i) => {
    let alguno = false, sd = 0, pd = 0;
    const q = itemsEj(d).map(it => {
      const prev = log[claveDe(d.id, it)], [cls] = estadoItem(s, it, prev);
      tot++; pd += nSeries(it);
      if (registrado(prev)) { hechos++; alguno = true; sd += nHechas(prev, it); if (prev.com) notas.push([`D${i + 1} · ${nombrePlan(it)}`, prev.com]); }
      else if (s.w <= st.actual && !plantilla) faltan.push(`D${i + 1} ${nombrePlan(it)}`);
      if (it.k === "main") lifts.push(`<div class="lift"><span class="k">D${i + 1} · ${esc(nombrePlan(it))}</span><span class="kg">${kg(r25(rmDe(s.w, it.lift) * it.pct / 100))}</span><span class="d">${it.sets} × ${it.reps} · RPE ${esc(it.rpe)}</span>${registrado(prev) && !prev.omitido ? `<span class="h">hecho ${esc(resumen(prev.sets))}</span>` : ""}</div>`);
      return `<i class="q ${cls}"></i>`;
    }).join("");
    series += sd; plan += pd;
    const nd = log["n~" + d.id]; if (nd && nd.txt) notas.push([`D${i + 1} · notas del día`, nd.txt]);
    if (alguno) diasCon++;
    const pot = d.items.some(it => it.k === "pot");
    return `<button class="sem-fila" data-goday="${i}"><b>D${i + 1}</b><span class="sem-n"><span>${esc(d.n)}</span><span class="cuadros">${q}</span></span><span class="small mut">${pot ? "+ potencia" : ""}</span><span class="mono">${sd}/${pd}</span></button>`;
  }).join("");
  const nc = (CLAUDE[s.w] || {}).semana;
  $("#v-semana").innerHTML = `
    <div class="titulo-row"><div class="titulo"><h1>Semana ${s.w}</h1><p class="sub">${esc(c.n)} · ${esc(etiqueta(s))} · ${estado}</p></div>
      <button class="circ" data-step="-1" aria-label="Semana anterior" ${s.w === 1 ? "disabled" : ""}>${ICON.back}</button>
      <button class="circ" data-step="1" aria-label="Semana siguiente" ${s.w === 52 ? "disabled" : ""}>${ICON.next}</button></div>
    ${s.w !== st.actual ? `<div class="ctx"><span>Vas en la S${st.actual}</span><button class="link-btn" data-today>Ir a la S${st.actual}</button></div>` : ""}
    <div class="nota-plan"><span class="k">Plan · esta semana</span><p>${esc(conMeta(s.nota))}</p>${s.nota_libro ? `<p class="small mut">${esc(s.nota_libro)}</p>` : ""}</div>
    ${nc && nc.txt ? `<div class="claude"><span class="k">CLAUDE · ESTA SEMANA</span><p>${esc(nc.txt)}</p></div>` : ""}
    ${plantilla ? `<p class="small mut" style="margin-top:12px">Esta semana se rediseñó con la Pirámide cuando ya había pasado, así que queda como plantilla: sirve de modelo para repetir el bloque, no tiene registros pendientes.</p>` : ""}
    ${!plantilla && s.w <= st.actual ? `<div class="stats"><div><span class="k">EJERCICIOS</span><span class="n">${hechos} <small>/ ${tot}</small></span></div><div><span class="k">SERIES</span><span class="n">${series} <small>/ ${plan}</small></span></div><div><span class="k">DÍAS</span><span class="n">${diasCon} <small>/ ${s.dias.length}</small></span></div></div>` : ""}
    ${retestHtml(s)}
    <h2>La semana</h2>
    <p class="small mut">Cada cuadro es un ejercicio; a la derecha, series anotadas sobre las del plan. Toca un día para abrirlo.</p>
    <div class="sem">${filas}</div>
    <div class="leyenda-q"><span><i class="q ok"></i>Hecho</span><span><i class="q par"></i>Parcial</span><span><i class="q cam"></i>Cambio</span><span><i class="q omi"></i>No lo hice</span><span><i class="q fal"></i>Falta</span></div>
    ${lifts.length ? `<h2>Básicos</h2><div class="lifts">${lifts.join("")}</div>` : ""}
    ${notas.length ? `<h2>Tus notas</h2><div class="notas-l">${notas.map(([t, x]) => `<div class="nota-i"><span class="k">${esc(t)}</span><p>“${esc(x)}”</p></div>`).join("")}</div>` : ""}
    ${faltan.length ? `<h2>Sin registrar · ${faltan.length}</h2><div class="chips">${faltan.map(x => `<span class="pill fal">${esc(x)}</span>`).join("")}</div>` : ""}
    ${s.programa ? `<p class="small mut" style="margin-top:24px">El volumen por músculo se calcula solo en el plan Exponential.</p>` : `<h2>Volumen ${s.w === st.actual ? "de esta semana" : "de la semana"}</h2>
    <p class="small mut">Series por músculo con la tabla de <span class="pg">p.214</span>: primario 1, secundario 0,5 (${esTuyo() ? "tu regla" : "regla de Pelland 2026"}). ${!plantilla && s.w <= st.actual ? `El borde es el plan; el relleno, lo que anotaste.${s.w < st.actual ? " En color, donde faltaron 2 series o más." : ""} ` : ""}La franja es el rango 10–20 <span class="pg">p.62</span>. El día de potencia no cuenta <span class="pg">p.139</span>.</p>
    ${barras(volumenSemana(s, false), !plantilla && s.w <= st.actual ? volumenSemana(s, true) : null, s.w < st.actual)}`}
    ${s.w !== st.actual ? `<div class="acciones"><button class="btn" data-actual="${s.w}">Marcar la semana ${s.w} como actual</button></div>` : ""}`;
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
const metas = () => st.metas || (esTuyo() ? METAS_TUYAS : {banca: null, medidas: {}});
const metaBanca_ = () => { const b = metas().banca; return b && num(b.kg) > 0 && num(b.reps) > 0 ? {kg: num(b.kg), reps: num(b.reps)} : null; };
/* Los textos del plan que dicen «AMRAP con 100 kg» muestran la meta que tengas puesta. */
const conMeta = t => { const mb = metaBanca_(); return typeof t === "string" && esTuyo() && mb && mb.kg !== 100 ? t.replace(/AMRAP con 100 kg/g, `AMRAP con ${f(mb.kg)} kg`) : t; };
function cambiarMeta(campo, valor) {
  const m = JSON.parse(JSON.stringify(metas())); m.medidas = m.medidas || {};
  if (campo === "kg" || campo === "reps") { m.banca = Object.assign({kg: "", reps: ""}, m.banca || {}, {[campo]: num(valor) ?? ""}); }
  else if (String(valor).trim() === "") delete m.medidas[campo]; else m.medidas[campo] = num(valor) ?? 0;
  st.metas = m; dirty.estado = marca(); saveStore(); pedirGuardado(900);
}
function metaBanca() {
  const mb = metaBanca_();
  const editor = `<div class="meta-ed"><label class="fl">Kilos<input class="inp mono" data-meta="kg" inputmode="decimal" value="${mb ? f(mb.kg) : ""}" placeholder="kg"></label>
    <label class="fl">Reps<input class="inp mono" data-meta="reps" inputmode="numeric" value="${mb ? mb.reps : ""}" placeholder="reps"></label></div>`;
  if (!mb) return `${editor}<p class="small mut" style="margin-top:8px">Pon kilos y reps: verás cuántas reps harías hoy con ese peso.</p>`;
  const b = rmDe(st.actual, "banca"), faltan = Math.max(0, 52 - st.actual);
  const reps = x => repsTxt(repsDePct(mb.kg / x * 100));
  const libro = b + 0.5 * faltan, tuRitmo = b + 0.3 * faltan;
  const hechos = [1, 2, 3, 4].map(i => st.rm[i] && Number(st.rm[i].amrap) ? `S${[18, 31, 44, 52][i - 1]}: ${st.rm[i].amrap} reps` : null).filter(Boolean);
  return `${editor}
  <div class="kpis" style="margin-top:12px">
    <div class="kpi"><span class="k">HOY</span><div class="n">≈ ${reps(b)} reps</div><div class="d">con ${f(mb.kg)} kg y tu máximo de ${kg(b)} (p.64)</div></div>
    ${esTuyo() ? `<div class="kpi"><span class="k">S52 A TU RITMO</span><div class="n">≈ ${reps(tuRitmo)} reps</div><div class="d">+3 kg de máximo cada 10 semanas</div></div>` : ""}
    <div class="kpi"><span class="k">S52 RITMO DEL LIBRO</span><div class="n">≈ ${reps(libro)} reps</div><div class="d">+2,5 kg cada ~5 semanas (p.111)</div></div>
  </div>
  <p class="small mut" style="margin-top:10px">${mb.reps > 12 ? `${mb.reps} reps quedan fuera de la tabla del libro, que llega a 11–12 reps al 70 % <span class="pg">p.64</span>. ` : ""}Se mide en cada test con un AMRAP a ${f(mb.kg)} kg.${hechos.length ? " Registrado: " + hechos.join(" · ") + "." : ""}</p>`;
}
/* Medidas: una sola lista. Cada medida con su último valor, el cambio, su meta y la casilla para hoy. Se guardan con el estado. */
const MEDIDAS = [["brazo", "Brazo"], ["hombros", "Hombros"], ["pecho", "Pecho"], ["cintura", "Cintura"], ["muslo", "Muslo"]];
const fechaTxt = iso => { try { return new Date(iso + "T12:00:00").toLocaleDateString("es", {day: "numeric", month: "short", year: "numeric"}); } catch (e) { return iso; } };
function medidasHtml() {
  const M = st.medidas || [], mm = metas().medidas || {};
  const filas = MEDIDAS.map(([id, n]) => {
    const con = M.filter(m => num(m[id]) != null), v = con.length ? num(con[con.length - 1][id]) : null;
    const d = con.length > 1 ? v - num(con[0][id]) : null, meta = mm[id], tiene = meta != null && meta !== "";
    const metaTxt = !tiene ? "" : num(meta) > 0 ? `meta +${f(num(meta))} cm${d != null ? ` · ${Math.max(0, Math.min(100, Math.round(d / num(meta) * 100)))} %` : ""}` : "meta: mantener";
    const linea = [v != null ? `${f(v)} cm` : "sin medir", d != null ? `${d >= 0 ? "+" : ""}${f(d)} desde el ${fechaTxt(con[0].f)}` : ""].filter(Boolean).join(" · ");
    return `<div class="med-f"><div class="med-n"><b>${n}</b><span>${esc(linea)}</span>${metaTxt ? `<span class="med-meta">${esc(metaTxt)}</span>` : ""}</div>
      <label class="fl">Hoy<input class="inp mono" data-med="${id}" inputmode="decimal" placeholder="cm"></label>
      <label class="fl">Meta<input class="inp mono" data-metamed="${id}" inputmode="decimal" value="${tiene ? f(num(meta)) : ""}" placeholder="+cm"></label></div>`;
  }).join("");
  return `<div class="med-l">${filas}</div>
    <div class="acciones"><button class="btn pri" data-medida>Guardar medición de hoy</button></div>
    <p class="small mut" style="margin-top:8px">En «Meta» van los cm que quieres ganar; 0 es mantener. El peso se anota en Más › Reglas.</p>
    ${M.length ? `<details class="more" style="margin-top:8px"><summary>Mediciones anteriores (${M.length})</summary><div class="tw"><table><thead><tr><th>Fecha</th>${MEDIDAS.map(([, n]) => `<th class="n">${n}</th>`).join("")}</tr></thead><tbody>${M.slice().reverse().map(m => `<tr><td class="mono">${esc(fechaTxt(m.f))}</td>${MEDIDAS.map(([id]) => `<td class="n">${num(m[id]) != null ? f(num(m[id])) : "—"}</td>`).join("")}</tr>`).join("")}</tbody></table></div></details>` : ""}`;
}
function tablaMaximos() {
  const rows = TRAMOS.map((t, i) => `<tr><td><b class="mono">${t.d}</b><br><span class="small mut">${t.s}</span></td>${LIFTS.map(([id]) => {
    const v = st.rm[i] && st.rm[i][id] ? st.rm[i][id] : "";
    const ph = i === 0 ? DATA.rm_inicial[id] ?? "" : rmDe(TRAMOS[i - 1].desde, id) || "";
    return `<td class="n"><input class="inp" type="text" inputmode="decimal" value="${esc(v)}" placeholder="${ph}" data-rm="${i}" data-lift="${id}" aria-label="${id} ${t.d}"></td>`;
  }).join("")}<td class="n">${i === 0 ? "—" : `<input class="inp" type="text" inputmode="numeric" value="${esc(st.rm[i] && st.rm[i].amrap ? st.rm[i].amrap : "")}" placeholder="reps" data-rm="${i}" data-lift="amrap" aria-label="AMRAP de banca ${t.d}">`}</td></tr>`).join("");
  return `<div class="tw rm"><table><thead><tr><th>Semanas</th><th class="n">Banca</th><th class="n">Sent.</th><th class="n">P. muerto</th><th class="n">AMRAP</th></tr></thead><tbody>${rows}</tbody></table></div>
  <label class="fl" style="margin-top:12px">Jalón (S11–S18) <input class="inp mono" type="text" inputmode="decimal" value="${esc(st.jalon)}" placeholder="${DATA.rm_inicial.jalon ?? ""}" data-jalon="1" style="max-width:140px"></label>`;
}
function renderAno() {
  cargarHistorial();
  const s = W[st.actual - 1];
  const prox = TESTS.filter(t => t >= st.actual && !(W[t - 1] || {}).programa).slice(0, 2);
  const b = rmDe(st.actual, "banca");
  const ciclos = CICLOS.map(c => {
    const ws = W.filter(x => x.w >= c.w[0] && x.w <= c.w[1]);
    return `<div class="cyc"><div class="cyc-h"><h3>${esc(c.n)}</h3><span class="small mut">S${c.w[0]}–S${c.w[1]} · ${esc(cicloD(c))}</span></div>
      <div class="cells">${ws.map(x => `<button class="cell${x.w < st.actual ? " done" : ""}${x.w === st.actual ? " now" : ""}${TESTS.includes(x.w) && !x.programa ? " t" : ""}" style="background:${colorSemana(x)}" data-goweek="${x.w}" aria-label="Semana ${x.w}: ${esc(etiqueta(x))}">${x.w}</button>`).join("")}</div>
      <p class="small mut" style="margin-top:8px">${resumenBloques(ws)}</p></div>`;
  }).join("");
  $("#v-ano").innerHTML = `
    <div class="titulo"><h1>Tu año</h1><p class="sub">Vas en la semana ${st.actual}. Toca una semana para abrirla.</p></div>
    ${st.programa ? `<div class="ctx"><span>Desde la S${st.programa.desde}: ${esc(st.programa.nombre)}</span></div>` : ""}
    <div class="stats"><div><span class="k">ESTÁS EN</span><span class="n">S${st.actual}</span></div><div><span class="k">PRÓX. TEST</span><span class="n">${prox.length ? "S" + prox[0] : "año 2"}</span></div><div><span class="k">BANCA</span><span class="n">${f(b)}</span></div></div>
    <h2>Tu avance</h2>
    ${avanceHtml()}
    <h2>El año</h2>
    <p class="small mut">${esc(etiqueta(s))}. El punto marca las semanas de test y la semana actual va con borde.</p>
    ${ciclos}
    <div class="legend">
      <span><i class="sw" style="background:var(--f-intro)"></i>Intro</span><span><i class="sw" style="background:var(--f-acc)"></i>Volumen</span>
      <span><i class="sw" style="background:var(--f-pico)"></i>Pico de volumen</span><span><i class="sw" style="background:var(--f-desc)"></i>Descarga</span>
      <span><i class="sw" style="background:var(--f-int)"></i>Intensidad</span><span><i class="sw" style="background:var(--f-taper)"></i>Taper</span>
      <span><i class="sw" style="background:var(--f-test)"></i>Test</span>
    </div>
    <h2>${esTuyo() ? "Tu meta de banca" : "Meta de banca"}</h2>${metaBanca()}
    <h2>Medidas</h2>${medidasHtml()}
    <h2>Tus máximos</h2>
    <p class="small mut">Las cargas de cada tramo salen de estos números. Después de cada test, anota el resultado y las semanas siguientes se recalculan solas. Una casilla vacía usa la de arriba.</p>
    ${tablaMaximos()}
    <h2>¿Cuántas veces se repite el ciclo?</h2>
    <div class="rule"><p><b>Cuatro veces.</b> Acumulación, intensificación y test dejan entre 8 y 16 semanas de un test al siguiente en el programa avanzado del libro <span class="pg">p.248</span>. ${esTuyo() ? "Por cómo progresas, el libro te pone en intermedio" : "Para un intermedio"} <span class="pg">p.109, p.114</span>, así que caben cuatro: S1–S18, S19–S31, S32–S44 y S45–S52.</p>
    <p><b>No es repetir lo mismo.</b> Cada vuelta parte con los máximos del test anterior, así que las cargas suben <span class="pg">p.110–111, p.243</span>. El énfasis alterna entre hipertrofia y fuerza <span class="pg">p.256–257</span>, y los compuestos de apoyo pueden cambiar entre mesociclos <span class="pg">p.218</span>.</p>
    <p class="small mut">S1–S10 siguen el ciclo de 8 semanas del libro con una semana intro y el taper aparte <span class="pg">p.104–105, p.132, p.136</span>. ${esTuyo() ? `S11–S18 es tu fuerza renovada y no se toca, porque vienes progresando <span class="pg">p.122</span>.` : `S11–S18 son dos olas de intensidad con re-test en la S14 y test en la S18 <span class="pg">p.248</span>.`}</p></div>`;
}

/* ── avance: cualquier ejercicio con series anotadas ── */
const LIFT_N = {banca: "Banca", sentadilla: "Sentadilla", peso_muerto: "Peso muerto"};
let historialPedido = false;
function cargarHistorial() {
  if (historialPedido || !conectado()) return;
  historialPedido = true;
  const faltan = [];
  for (let w = 1; w <= st.actual; w++) if (!loaded[w]) faltan.push(w);
  Promise.all(faltan.map(w => cargarSemana(w))).then(() => {
    if (sheet && sheet.tipo === "hist") renderSheet();
    else if (ui.tab === "ano" && !sheet && !editando()) render();
  });
}
/* Lo anotado en una semana, por el ejercicio que de verdad hiciste (la alternativa cuenta como ese ejercicio),
   más los extras y el single del re-test. */
function entradasLog(w) {
  const log = LOG[w], out = []; if (!log) return out;
  for (const [k, p] of Object.entries(log)) {
    if (k.startsWith("x~")) { (Array.isArray(p) ? p : []).forEach(x => { if (x && x.n && x.sets && x.sets.length) out.push({id: "x:" + slug(x.n), n: x.n, sets: x.sets, it: null}); }); continue; }
    if (k.startsWith("rt~")) { const l = k.slice(3); if (p && num(p.kg) > 0) out.push({id: l, n: LIFT_N[l] || l, sets: [{kg: num(p.kg), reps: 1, rpe: p.rpe}], it: null}); continue; }
    if (k.includes("~") || !registrado(p) || p.omitido || !p.sets || !p.sets.length) continue;
    const it = itemDeClave(w, k), h = it ? hechoDe(p, it) : (p.hecho || p.plan || {id: k.split(":")[1], n: k.split(":")[1]});
    out.push({id: h.id, n: h.n, sets: p.sets, it});
  }
  return out;
}
/* Por semana: el máximo estimado con las series que lo permiten (RPE y no más de ~5 reps de margen, p.115/p.120)
   y la mejor serie (más kilos; a igual peso, más reps). */
function serieAvance(id) {
  const pts = [], sinRpe = [], margen = [], mejores = [];
  for (let w = 1; w <= st.actual; w++) {
    const es = entradasLog(w).filter(x => x.id === id); if (!es.length) continue;
    let mejor = null, top = null, conRpe = false;
    es.forEach(x => {
      if (x.sets.some(s => s.rpe != null)) conRpe = true;
      estimables(x.it || {k: "acc"}, x.sets).forEach(s => { const v = e1rm(s); if (v && (!mejor || v > mejor.v)) mejor = {w, v, kg: s.kg, reps: s.reps, rpe: s.rpe}; });
      x.sets.forEach(s => { const k = num(s.kg) || 0, r = num(s.reps) || 0; if (!top || k > top.kg || (k === top.kg && r > top.reps)) top = {w, v: k, kg: k, reps: r, rpe: s.rpe}; });
    });
    if (top) mejores.push(top);
    if (mejor) pts.push(mejor); else if (conRpe) margen.push(w); else sinRpe.push(w);
  }
  return {pts, sinRpe, margen, mejores};
}
/* Todos los ejercicios con series anotadas: los básicos primero, después los que más series tienen. */
function ejerciciosAvance() {
  const m = {};
  for (let w = 1; w <= st.actual; w++) entradasLog(w).forEach(x => {
    const e = m[x.id] || (m[x.id] = {id: x.id, n: x.n, series: 0, semanas: new Set()});
    e.series += x.sets.length; e.semanas.add(w); if (LIFT_N[x.id]) e.n = LIFT_N[x.id];
  });
  const orden = Object.keys(LIFT_N);
  return Object.values(m).sort((a, b) => (orden.indexOf(a.id) + 1 || 99) - (orden.indexOf(b.id) + 1 || 99) || b.series - a.series || a.n.localeCompare(b.n));
}
function tipAvance(p, estimado = true) {
  return estimado ? `S${p.w}: ≈ ${kg(r05(p.v))} estimado, con tu mejor serie ${f(p.kg)} × ${p.reps} a RPE ${f(p.rpe)} (tabla p.64).`
    : `S${p.w}: tu mejor serie, ${f(p.kg)} kg × ${p.reps}${p.rpe != null ? " a RPE " + f(p.rpe) : ""}.`;
}
function avanceHtml() {
  const lista = ejerciciosAvance();
  if (!lista.length) return `<p class="small mut">Todavía no hay series anotadas.</p>`;
  if (!lista.some(x => x.id === ui.av)) ui.av = lista[0].id;
  const id = ui.av, ej = lista.find(x => x.id === id), {pts: est, sinRpe, margen, mejores} = serieAvance(id);
  // Básicos: máximo estimado. Accesorios: también, si todas sus semanas lo permiten; si no, la mejor serie de cada semana, para que se vean todas.
  const estimado = est.length > 0 && (!!LIFT_N[id] || est.length === mejores.length), pts = estimado ? est : mejores;
  const ref = estimado && LIFT_N[id] ? rmDe(st.actual, id) : null;
  const sel = `<select class="inp av-sel" data-av-sel aria-label="Ejercicio">${lista.map(x => `<option value="${esc(x.id)}" ${x.id === id ? "selected" : ""}>${esc(x.n)} · ${x.series} ${x.series === 1 ? "serie" : "series"}</option>`).join("")}</select>`;
  const que = estimado ? "Máximo estimado por semana, con las series que tienen RPE (tabla de p.64)." : "Kilos de tu mejor serie de cada semana.";
  const ultimo = est[est.length - 1], mb = metaBanca_();
  const meta = id === "banca" && mb ? `<p class="small" style="margin:8px 0 0;color:var(--tx2)">Con ${f(mb.kg)} kg hoy ≈ <b class="mono">${repsTxt(repsDePct(mb.kg / (ultimo ? ultimo.v : rmDe(st.actual, "banca")) * 100))} reps</b> (p.64). Tu meta: <b class="mono">${mb.reps}</b>.</p>` : "";
  // geometría
  const VW = 360, VH = 190, L = 40, R = 14, T = 16, B = 26;
  const x0 = Math.max(1, Math.min(pts[0].w, st.actual - 4)), x1 = Math.max(st.actual, x0 + 1);
  const vals = pts.map(p => p.v).concat(ref != null ? [ref] : []);
  const y0 = Math.max(0, Math.floor((Math.min(...vals) - 4) / 5) * 5), y1 = Math.ceil((Math.max(...vals) + 4) / 5) * 5;
  const X = w => L + (w - x0) / (x1 - x0) * (VW - L - R), Y = v => T + (y1 - v) / (y1 - y0) * (VH - T - B);
  const paso = (y1 - y0) > 30 ? 10 : 5, grid = [];
  for (let v = y0; v <= y1; v += paso) grid.push(`<line x1="${L}" x2="${VW - R}" y1="${Y(v)}" y2="${Y(v)}" style="stroke:var(--line)" stroke-width="1"/><text x="${L - 6}" y="${Y(v) + 3.5}" text-anchor="end" font-family="IBM Plex Mono, monospace" font-size="10" style="fill:var(--mut)">${v}</text>`);
  const cada = (x1 - x0) > 10 ? 2 : 1, xs = [];
  for (let w = x0; w <= x1; w += cada) xs.push(`<text x="${X(w)}" y="${VH - 8}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="10" style="fill:var(--mut)">S${w}</text>`);
  const linea = pts.length > 1 ? `<path d="${pts.map((p, i) => (i ? "L" : "M") + X(p.w).toFixed(1) + " " + Y(p.v).toFixed(1)).join(" ")}" fill="none" style="stroke:var(--acc)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>` : "";
  const puntos = pts.map((p, i) => `<circle class="hit" data-pt="${i}" cx="${X(p.w)}" cy="${Y(p.v)}" r="16" fill="transparent" tabindex="0" role="button" aria-label="${esc(tipAvance(p, estimado))}"/><circle class="pt" cx="${X(p.w)}" cy="${Y(p.v)}" r="4.5" style="fill:var(--acc);stroke:var(--bg)" stroke-width="2" pointer-events="none"/>`).join("");
  const elegido = pts[ui.avPt != null && pts[ui.avPt] ? ui.avPt : pts.length - 1];
  const refSvg = ref != null ? `<line x1="${L}" x2="${VW - R}" y1="${Y(ref)}" y2="${Y(ref)}" style="stroke:var(--faint)" stroke-width="1.5" stroke-dasharray="4 4"/>
        <text x="${VW - R}" y="${Y(ref) - 5}" text-anchor="end" font-family="IBM Plex Sans, sans-serif" font-size="10.5" style="fill:var(--mut)">máximo del plan ${f(ref)}</text>` : "";
  return `${sel}
    <p class="small mut" style="margin:8px 0 0">${que}</p>
    <figure class="chart" style="margin:8px 0 0">
      <svg viewBox="0 0 ${VW} ${VH}" role="img" aria-label="${esc(ej.n)}: ${estimado ? "máximo estimado" : "mejor serie"} por semana">
        ${grid.join("")}${xs.join("")}${refSvg}${linea}${puntos}
      </svg>
      <figcaption class="av-tip" id="av-tip">${esc(tipAvance(elegido, estimado))}</figcaption>
    </figure>
    ${meta}
    <details class="more" style="margin-top:8px"><summary>Ver los datos</summary><div><table><thead><tr><th>Semana</th><th class="n">${estimado ? "Máximo estimado" : "Mejor serie"}</th><th class="n">${estimado ? "Mejor serie" : "RPE"}</th></tr></thead><tbody>
      ${pts.map(p => estimado ? `<tr><td class="mono">S${p.w}</td><td class="n">${kg(r05(p.v))}</td><td class="n">${f(p.kg)} × ${p.reps} @ ${f(p.rpe)}</td></tr>`
        : `<tr><td class="mono">S${p.w}</td><td class="n">${f(p.kg)} kg × ${p.reps}</td><td class="n">${p.rpe != null ? f(p.rpe) : "—"}</td></tr>`).join("")}
      ${estimado ? sinRpe.map(w => `<tr><td class="mono">S${w}</td><td class="n mut">sin RPE</td><td class="n mut">—</td></tr>`).join("") : ""}
      ${estimado ? margen.map(w => `<tr><td class="mono">S${w}</td><td class="n mut">mucho margen</td><td class="n mut">—</td></tr>`).join("") : ""}
    </tbody></table></div></details>`;
}

/* ── barra inferior: descanso y serie en curso ──
   La misma barra en todas las pestañas: el anillo cuenta el descanso y el botón guarda la serie que
   tienes abierta en Hoy. Sin serie abierta, solo aparece mientras corre un descanso. */
const TKEY = "exp-descanso";
const ANILLO = 138.2;  // 2πr, r = 22
let descansoT = null, reloj = null, audioCtx = null;
try { descansoT = JSON.parse(localStorage.getItem(TKEY) || "null"); } catch (e) {}
const segundosDescanso = txt => {  // el mínimo del rango; «30 s» va en segundos y «sin pausa» es 0
  const t = String(txt), m = t.match(/(\d+(?:[.,]\d+)?)/); if (!m) return /sin pausa/.test(t) ? 0 : 120;
  const v = parseFloat(m[1].replace(",", ".")); return /\d\s*(s|sec|seg)\b/.test(t) && !/min/.test(t) ? v : v * 60;
};
function guardarDescanso() { try { descansoT ? localStorage.setItem(TKEY, JSON.stringify(descansoT)) : localStorage.removeItem(TKEY); } catch (e) {} }
function iniciarDescanso(seg, nombre) {
  if (!(seg > 0)) return;
  try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
  descansoT = {fin: Date.now() + seg * 1000, total: seg, nombre};
  guardarDescanso();
  renderDock();
  tickDescanso();
}
function pararDescanso() {
  descansoT = null; guardarDescanso();
  clearInterval(reloj); reloj = null;
  if (sheet && !ui.dockCtl) {
    // con la hoja abierta solo se vacía el anillo: redibujarla cerraría el teclado si estás escribiendo
    const t = $("#dock-t"), p = $("#dock-p");
    if (t) t.textContent = sheet.it ? descanso(sheet.it).replace(" min", "′").replace(/ en par$/, "") : "";
    if (p) p.setAttribute("stroke-dasharray", `0 ${ANILLO}`);
    return;
  }
  ui.dockCtl = false;
  if (sheet) renderSheet(); else renderDock();
}
function avisoDescanso() {
  try { if (navigator.vibrate) navigator.vibrate([400, 200, 400]); } catch (e) {}
  try {
    if (!audioCtx) return;
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.frequency.value = 880; g.gain.value = 0.15; o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + 0.35);
  } catch (e) {}
}
const quedan = () => descansoT ? Math.ceil((descansoT.fin - Date.now()) / 1000) : 0;
const mmss = r => `${Math.floor(r / 60)}:${String(r % 60).padStart(2, "0")}`;
function tickDescanso() {
  if (!descansoT) return;
  const r = quedan();
  if (r <= 0) { const n = descansoT.nombre; pararDescanso(); avisoDescanso(); toast(`Descanso terminado${n ? " · " + n : ""}. A la siguiente serie.`); return; }
  if (!$("#dock-t") && !sheet) renderDock();
  const t = $("#dock-t"), p = $("#dock-p");
  if (t) t.textContent = mmss(r);
  if (p) p.setAttribute("stroke-dasharray", `${(Math.min(1, Math.max(0, 1 - r / (descansoT.total || r))) * ANILLO).toFixed(1)} ${ANILLO}`);
  if (!reloj) reloj = setInterval(tickDescanso, 250);
}
function anilloHtml(plan) {
  const r = quedan(), hecho = descansoT ? Math.min(1, Math.max(0, 1 - r / (descansoT.total || r || 1))) : 0;
  const txt = descansoT ? mmss(Math.max(0, r)) : plan ? plan.replace(" min", "′").replace(/ en par$/, "") : "";
  return `<button class="anillo" data-anillo aria-label="Descanso${descansoT ? ": quedan " + mmss(Math.max(0, r)) : ""}. Controles del descanso">
    <svg viewBox="0 0 52 52" aria-hidden="true"><circle class="tr" cx="26" cy="26" r="22"/><circle class="pr" id="dock-p" cx="26" cy="26" r="22" stroke-dasharray="${(hecho * ANILLO).toFixed(1)} ${ANILLO}" transform="rotate(-90 26 26)"/></svg>
    <span id="dock-t">${txt}</span></button>`;
}
function controlesDescanso(it) {
  if (!ui.dockCtl) return "";
  return `<div class="dock-ctl" role="group" aria-label="Descanso">${descansoT
    ? `<button data-tmas="-30">−30 s</button><button data-tmas="30">+30 s</button><button data-tstop>Parar</button>`
    : `<button data-descanso>Iniciar descanso${it ? " · " + esc(descanso(it)) : ""}</button>`}</div>`;
}
const itemEdit = () => edit ? itemDeClave(edit.w, edit.key) : null;
function valorEdit() { return edit ? serieTxt({kg: edit.kg, reps: edit.reps, rpe: edit.rpe}) : ""; }
function renderDock() {
  const root = $("#dock-root"), it = itemEdit(); if (!root) return;
  const ver = !sheet && (it || descansoT);
  document.body.classList.toggle("con-dock", !!ver);
  if (!ver) { root.innerHTML = ""; return; }
  root.innerHTML = `<div class="dock">${controlesDescanso(it)}<div class="dock-in">
    ${anilloHtml(it ? descanso(it) : "")}
    <div class="dock-txt"><span class="k" id="dock-l">${it ? `Serie ${edit.idx + 1} · ${esc(nombrePlan(it))}` : `Descanso${descansoT.nombre ? " · " + esc(descansoT.nombre) : ""}`}</span><span class="v" id="dock-v">${it ? esc(valorEdit()) : "a la siguiente serie"}</span></div>
    ${it ? `<button class="dock-ok" data-guardarset aria-label="Guardar la serie ${edit.idx + 1}">${ICON.ok}</button>`
      : `<button class="dock-ok" data-tstop aria-label="Parar el descanso">${ICON.x}</button>`}
  </div></div>`;
}
function pintarBarra() { const v = $("#dock-v"); if (v && edit) v.textContent = valorEdit(); }

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
/* A otra persona: sin tu M3 ni tu meta de 100 kg (el AMRAP va al 70 % de su máximo, ver cargaAmrap). */
const bloqueX = b => esTuyo() ? conMeta(b.x) : b.w === "S11–S18"
  ? "Dos olas de intensificación (S11–S13 y S15–S17), descarga con re-test en S14 y test en S18. El libro pone uno o dos bloques de intensidad tras la acumulación, con test al final (p.248)."
  : b.x.replace(/AMRAP con 100 kg/g, "AMRAP con el 70 % de tu máximo");
const bloqueT = b => !esTuyo() && b.w === "S11–S18" ? "Fuerza · dos olas" : b.t;
function masBloques() {
  return CICLOS.map(c => `<h2>${esc(c.n)} <span class="small mut mono">S${c.w[0]}–S${c.w[1]}</span></h2>${BLOQUES.filter(b => b.c === c.id).map(b => `
    <div class="rule"><h3><i class="sw" style="background:${b.col}"></i>${esc(bloqueT(b))} <span class="small mut mono">${b.w}</span></h3><p>${esc(bloqueX(b))}</p></div>`).join("")}`).join("");
}
function masVolumen() {
  const VP = W.map(s => volumenSemana(s, false));  // el mismo cálculo que Semana (p.214)
  const head = `<tr><th>Músculo</th>${W.map(s => `<th class="${s.w === 11 || s.w === 19 ? "sep" : ""}">S${s.w}</th>`).join("")}</tr>`;
  const body = G.map(g => `<tr><td>${esc(g.n)}</td>${W.map((s, i) => {
    const v = VP[i][g.id] || 0;
    const c = v < 10 ? "h-bajo" : v > 20 ? "h-sobre" : "h-en";
    return `<td class="${c}${s.w === 11 || s.w === 19 ? " sep" : ""}">${f(v)}</td>`;
  }).join("")}</tr>`).join("");
  const tuyo = esTuyo();
  return `<p class="small mut" style="margin-top:16px">Las rayas separan S1–S10 (Pirámide), S11–S18 (${tuyo ? "tu M3" : "dos olas de intensidad"}) y el plan nuevo desde S19. Tono claro: bajo 10. Medio: 10–20. Fuerte: sobre 20. Desliza la tabla hacia los lados.</p>
    <div class="tw"><table class="heat"><thead>${head}</thead><tbody>${body}</tbody></table></div>
    <div class="rule"><h3>Cómo se cuenta</h3><p>Cada serie directa vale 1 y cada indirecta 0,5: ${tuyo ? "es tu regla (Pelland 2026)" : "la regla de Pelland 2026"}. Qué es directo y qué indirecto sale de la tabla de músculos de p.214. <b>Conflicto de fuentes:</b> el libro cuenta primario y secundario igual (p.213), así que con su conteo estos números serían más altos. El día de potencia no cuenta (p.139, p.49).</p></div>
    <div class="rule"><h3>Rango y por qué no va más alto</h3><p>10–20 series por músculo y semana (p.62); para intermedio, 13–15 de partida (p.208). ${tuyo ? "Con tenis tres veces por semana hay fatiga de afuera, y el volumen óptimo baja (p.61). Por eso casi todo queda entre 10 y 17, y la prioridad (brazos, hombros, isquios) sube primero." : "Si haces otro deporte, hay fatiga de afuera y el volumen óptimo baja (p.61). El plan deja casi todo entre 10 y 17, con brazos, hombros e isquios como prioridad."}</p></div>
    <div class="rule"><h3>Dorsal en 8</h3><p>${tuyo ? "Es el costo de tu decisión de un solo día de espalda." : "El plan junta la espalda en un solo día."} Si la espalda no avanza, es lo primero a revisar.</p></div>`;
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
    ${esTuyo() ? `<div class="rule"><h3>Tenis de mesa</h3><p>Pesas y tenis compiten por recuperación: uno tiene prioridad y el otro se modera (p.39). No juegues fuerte justo antes de entrenar; después de las pesas, 6 h después o en otro día es mejor (p.40).</p></div>`
      : `<div class="rule"><h3>Otro deporte</h3><p>Pesas y deporte compiten por recuperación: uno tiene prioridad y el otro se modera (p.39). No hagas el deporte fuerte justo antes de entrenar; después de las pesas, 6 h después o en otro día es mejor (p.40).</p></div>`}
    <div class="rule"><h3>Potencia y sprints</h3><p>Potencia es mover cargas livianas lo más rápido posible, lo que más transfiere a ${esTuyo() ? "un deporte con raqueta" : "un deporte"} (p.127). El día de potencia es de poco volumen, para recuperar (p.139).</p></div>
    <div class="rule"><h3>Año 2</h3><p>Misma estructura. Si un músculo o levantamiento no avanza en dos ciclos, +1–2 series ahí (p.125). Si el progreso pasa a verse solo mes a mes o más lento, aplicas los criterios de avanzado (p.114): ciclos más largos y menos tests (p.117).</p></div>
    <h2>Lo que no sale del libro</h2>
    <div class="rule"><ul>
      <li>Los sprints (al inicio del día 4): el libro no los trata.</li>
      <li>El orden de los énfasis (hipertrofia, fuerza, cierre). El libro permite alternar (p.256–257); el orden se eligió por ${esTuyo() ? "tus metas" : "las metas de quien armó el plan"}.</li>
      <li>La cuarta semana de intensificación de C2 alarga la tabla de p.270–272 hasta donde p.135 dice que termina el bloque.</li>
      ${esTuyo() ? "<li>Las cargas de referencia de accesorios suponen que trabajabas a RPE ~8.</li>" : ""}
    </ul></div>`;
}
/* GitHub no deja crear claves por API (solo el dueño, desde la web), pero sí rellenar el formulario por enlace. */
function enlaceClave(nombre = "exponential-app", para = "tus registros") {
  const q = new URLSearchParams({name: nombre, description: "App Exponential: lee y guarda " + para,
    target_name: cfg.owner, expires_in: "366", contents: "write"});
  return "https://github.com/settings/personal-access-tokens/new?" + q.toString();
}
/* Invitar a otra persona: su repositorio privado en tu cuenta y una clave solo para él. Ella no necesita cuenta de GitHub. */
function invitarHtml() {
  const r = ui.inv.nuevo || "";
  return `<h2>Invitar a otra persona</h2>
    <div class="panel">
      <label class="fl">Nombre de su repositorio<input class="inp mono" data-invrepo value="${esc(r)}" placeholder="exponential-nombre" autocapitalize="off" autocorrect="off" spellcheck="false"></label>
      <div class="pasos-inv">
        <button class="btn" data-inv="repo">1 · Crear su repositorio</button>
        <button class="btn" data-inv="clave">2 · Crear su clave</button>
        <button class="btn pri" data-inv="enlace">3 · Copiar su enlace</button>
      </div>
      ${ui.inv.enlace ? `<p class="small mono" style="margin:10px 0 0;word-break:break-all;user-select:all">${esc(ui.inv.enlace)}</p>` : ""}
      <ol class="small" style="padding-left:18px;color:var(--tx2);line-height:1.6;margin:12px 0 0">
        <li>Se abre GitHub con el nombre puesto y «Private» elegido: toca <b>Create repository</b>.</li>
        <li>En la clave, en «Repository access» elige <b>Only select repositories</b> y su repositorio; abajo, <b>Generate token</b>, y cópiala.</li>
        <li>Mándale por correo su enlace y, aparte, la clave. Ella abre el enlace, pega la clave y toca Conectar.</li>
      </ol>
      <p class="small mut" style="margin-top:10px">Al entrar pone su nombre y una serie de cada básico, y la app arma su plan con el plan base, sin tus datos. Su clave abre solo su repositorio.</p>
    </div>`;
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
      ${perfil && perfil.nombre ? `<span class="k">NOMBRE</span><span class="v">${esc(perfil.nombre)}</span>` : ""}
      <span class="k">ÚLTIMO</span><span class="v">${esc(hora)}</span>
      <span class="k">PENDIENTE</span><span class="v">${pendientes() ? pendientes() + " cambio(s) por subir" : "nada"}</span></div>
    </div>
    <div class="btn-row" style="margin-top:14px"><button class="btn pri" data-syncnow>Sincronizar ahora</button><button class="btn" data-export>Descargar respaldo</button></div>
    <div class="btn-row" style="margin-top:8px"><button class="btn quiet" data-disconnect>Desconectar este teléfono</button></div>
    <p class="small mut" style="margin-top:14px">Cada registro se guarda primero en el teléfono y luego en ${esTuyo() ? "tu" : "su"} repositorio privado. Claude lo lee cuando se le pide revisar el registro, y deja comentarios en Hoy y en Semana.</p>
    ${esTuyo() ? invitarHtml() : ""}`;
  return `
    <div class="panel" style="margin-top:16px">
      <p><b>Ahora tu registro se guarda solo en este teléfono.</b> Conéctalo a tu cuenta para no perderlo y para que Claude pueda revisarlo.</p>
      <a class="btn pri" href="${esc(enlaceClave())}" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;text-decoration:none;margin:14px 0">Crear la clave en GitHub</a>
      <ol class="small" style="padding-left:18px;color:var(--tx2);line-height:1.6;margin:0">
        <li>Toca el botón de arriba. Se abre GitHub con todo relleno.</li>
        <li>En «Repository access» toca <b>Only select repositories</b> y elige <b>${esc(cfg.repo)}</b>.</li>
        <li>Abajo del todo, toca <b>Generate token</b> y copia el código.</li>
        <li>Vuelve aquí, pégalo en «Clave de acceso» y toca <b>Conectar</b>.</li>
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
function masTema() {
  const muestra = t => `<span class="muestra" style="background:${t.bg};border-color:${t.line}"><i style="background:${t.tx}"></i><u style="background:${t.acc}"></u></span>`;
  const fila = (id, n, tipo, sw) => `<button class="tema-f" role="radio" data-tema="${id}" aria-checked="${tema.modo === id}">${sw}<span class="tema-n"><b>${esc(n)}</b><span>${esc(tipo)}</span></span>${tema.modo === id ? ICON.ok : ""}</button>`;
  const claro = TEMAS.find(t => t.id === tema.claro) || TEMAS[0], oscuro = TEMAS.find(t => t.id === tema.oscuro) || TEMAS[1];
  const op = (tipo, sel) => TEMAS.filter(t => t.tipo === tipo).map(t => `<option value="${t.id}" ${t.id === sel ? "selected" : ""}>${esc(t.n)}</option>`).join("");
  return `<div class="tema-l" role="radiogroup" aria-label="Tema">
    ${TEMAS.map(t => fila(t.id, t.n, (t.tipo === "claro" ? "Claro" : "Oscuro") + (t.id === "hueso" ? " · por defecto" : ""), muestra(t))).join("")}
    ${fila("auto", "Automático", "Sigue el modo claro u oscuro del teléfono", `<span class="muestra auto" style="background:linear-gradient(90deg, ${claro.bg} 50%, ${oscuro.bg} 50%);border-color:var(--line)"><i style="background:${claro.tx}"></i><u style="background:${oscuro.acc}"></u></span>`)}
  </div>
  ${tema.modo === "auto" ? `<div class="calc2"><label class="fl">De día<select class="inp" data-tema-claro>${op("claro", tema.claro)}</select></label><label class="fl">De noche<select class="inp" data-tema-oscuro>${op("oscuro", tema.oscuro)}</select></label></div>` : ""}
  <p class="small mut" style="margin-top:12px">Se guarda en este teléfono. Tus registros no cambian.</p>`;
}
/* ── Programas: el catálogo para elegir programa. No viaja con la app pública (trae programas de libros):
   se abre una vez desde el archivo exponential-catalogo.json y queda guardado en el teléfono, en su propia
   caché, aparte de la de la app (esa se renueva en cada versión; esta no). ── */
let CATALOGO = null, catEstado = "";  // catEstado: "" · "cargando" · "falta" (no está en el teléfono) · "sin-cache" (el navegador no deja guardarlo)
const FICHAS = {};
const CAT_CACHE = "exp-catalogo", CAT_FORMATO = "exponential-catalogo";
const CAT_OBJ = [["todos", "Todos"], ["fuerza", "Fuerza"], ["hipertrofia", "Hipertrofia"], ["ambos", "Fuerza e hipertrofia"], ["musculo", "Un músculo"]];
const CAT_DIAS = [["todos", "Todos"], ["2-3", "2–3"], ["4", "4"], ["5", "5"], ["6", "6"]];
const catUrl = p => new URL("catalogo/" + p, location.href).href;
async function leerCat(p) {
  const r = await (await caches.open(CAT_CACHE)).match(catUrl(p));
  return r ? r.json() : null;
}
async function cargarCatalogo() {
  if (CATALOGO || catEstado) return;
  catEstado = "cargando";
  try { CATALOGO = await leerCat("indice.json"); catEstado = CATALOGO ? "" : "falta"; } catch (e) { catEstado = "sin-cache"; }
  if (ui.tab === "mas" && ui.mas === "programas") renderMas();
}
async function cargarFicha(id) {
  if (FICHAS[id]) return;
  let P = null; try { P = await leerCat(encodeURIComponent(id) + ".json"); } catch (e) {}
  if (P) FICHAS[id] = P;
  else { CATALOGO = null; catEstado = "falta"; ui.cat.prog = null; }  // el teléfono borró el catálogo: se vuelve a abrir el archivo
  if (ui.tab === "mas" && ui.mas === "programas") renderMas();
}
/* Guardar el catálogo: se revisa que sea el catálogo, se guarda cada programa y el índice al final
   (si algo falla a mitad de camino, no queda un índice que apunte a programas que no están).
   Devuelve true, o el motivo por el que no se pudo. */
async function guardarCatalogo(C) {
  const valido = C && C.formato === CAT_FORMATO && Array.isArray(C.grupos) && Array.isArray(C.programas) && C.programas.length
    && C.programas.every(p => p && typeof p.id === "string" && /^[a-z0-9-]+$/.test(p.id) && typeof p.nombre === "string" && typeof p.fuente === "string"
      && Array.isArray(p.plan) && p.plan.length && p.plan.every(s => s && Array.isArray(s.d) && s.d.every(d => d && Array.isArray(d.e))));
  if (!valido) return "Ese archivo no es el catálogo de Exponential.";
  if (typeof caches === "undefined") return "Este navegador no deja guardar el catálogo. Abre la app en Chrome.";
  const indice = {version: String(C.version || ""), grupos: C.grupos, programas: C.programas.map(({plan, progresion, aviso, ...meta}) => meta)};
  const json = x => new Response(JSON.stringify(x), {headers: {"Content-Type": "application/json"}});
  try {
    const c = await caches.open(CAT_CACHE);
    await Promise.all((await c.keys()).map(k => c.delete(k)));  // la versión nueva reemplaza entera a la anterior
    await Promise.all(C.programas.map(p => c.put(catUrl(encodeURIComponent(p.id) + ".json"), json(p))));
    await c.put(catUrl("indice.json"), json(indice));
  } catch (e) { return "No pude guardar el catálogo en el teléfono."; }
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}  // que Android no lo borre por falta de espacio
  CATALOGO = indice; catEstado = ""; ui.cat.prog = null;
  Object.keys(FICHAS).forEach(k => delete FICHAS[k]);
  return true;
}
/* El catálogo viaja por WhatsApp en un .zip. Se lee aquí mismo, sin librerías: se busca el .json en el
   directorio del zip y se descomprime con DecompressionStream (Chrome 103 o más nuevo). */
async function leerZip(buf) {
  const v = new DataView(buf), u8 = new Uint8Array(buf);
  let fin = -1;  // fin del directorio central (firma 0x06054b50), buscado desde el final
  for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 65557); i--) if (v.getUint32(i, true) === 0x06054b50) { fin = i; break; }
  if (fin < 0) return null;
  let p = v.getUint32(fin + 16, true);
  for (let k = 0, n = v.getUint16(fin + 10, true); k < n; k++) {
    if (v.getUint32(p, true) !== 0x02014b50) return null;
    const metodo = v.getUint16(p + 10, true), tam = v.getUint32(p + 20, true), lnom = v.getUint16(p + 28, true), off = v.getUint32(p + 42, true);
    const nombre = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + lnom));
    if (/\.json$/i.test(nombre) && !/(^|\/)__MACOSX\//.test(nombre)) {
      const ini = off + 30 + v.getUint16(off + 26, true) + v.getUint16(off + 28, true), datos = u8.subarray(ini, ini + tam);
      if (metodo === 0) return new TextDecoder().decode(datos);
      if (metodo === 8) return new Response(new Blob([datos]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).text();
      return null;
    }
    p += 46 + lnom + v.getUint16(p + 30, true) + v.getUint16(p + 32, true);
  }
  return null;
}
async function importarCatalogo(file) {
  let C = null;
  try {
    const buf = await file.arrayBuffer(), u8 = new Uint8Array(buf), zip = u8[0] === 0x50 && u8[1] === 0x4b;  // «PK»: es un zip
    if (zip && typeof DecompressionStream === "undefined") { toast("Actualiza Chrome para abrir el catálogo."); return; }
    C = JSON.parse(zip ? await leerZip(buf) : new TextDecoder().decode(u8));
  } catch (e) {}
  const r = await guardarCatalogo(C);
  if (r !== true) { toast(r); return; }
  renderMas(); window.scrollTo(0, 0);
  toast(`Catálogo guardado en el teléfono: ${C.programas.length} programas.`);
}
const botonArchivo = (txt, cls) => `<label class="${cls}">${txt}<input type="file" id="cat-file" hidden></label>`;
function archivoHtml() {
  if (catEstado === "sin-cache") return `<p class="small mut" style="margin-top:16px">Este navegador no deja guardar el catálogo. Abre la app en Chrome.</p>`;
  return `<div class="panel" style="margin-top:16px">
      <p style="margin:0"><b>El catálogo no viene dentro de la app.</b> Se abre una vez desde el archivo <span class="mono">exponential-catalogo.zip</span> y queda guardado en este teléfono.</p>
      ${botonArchivo("Abrir el archivo del catálogo", "btn pri btn-archivo")}
      <ol class="small" style="padding-left:18px;color:var(--tx2);line-height:1.6;margin:12px 0 0">
        <li>En WhatsApp, toca el archivo para descargarlo.</li>
        <li>Vuelve aquí y toca el botón: se abre el explorador de archivos. Búscalo en Recientes, Descargas o Documentos y tócalo. No hace falta descomprimirlo.</li>
      </ol>
    </div>`;
}
/* ── El libro: cada «p.64» abre esa página del PDF de La Pirámide (entrenamiento, v2.0) guardado en este teléfono.
   El PDF no va dentro de la app porque su repositorio es público: se abre una vez desde el archivo, como el catálogo.
   La página del PDF es la misma del libro (p.64 = la tabla de % del 1RM). ── */
const LIBRO_CACHE = "exp-libro", libroUrl = () => new URL("libro/piramide-entrenamiento.pdf", location.href).href;
let LIBRO = null, visor = null;  // LIBRO: el PDF abierto con pdf.js; visor: {pag, zoom, tarea}
const cargarScript = src => new Promise((ok, mal) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = mal; document.head.appendChild(s); });
async function abrirPdf(buf) {
  if (!window.pdfjsLib) await cargarScript("lib/pdf.min.js");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "lib/pdf.worker.min.js";
  return pdfjsLib.getDocument({data: new Uint8Array(buf)}).promise;
}
async function cargarLibro() {
  if (LIBRO) return true;
  if (typeof caches === "undefined") return false;
  const r = await (await caches.open(LIBRO_CACHE)).match(libroUrl());
  if (!r) return false;
  LIBRO = await abrirPdf(await r.arrayBuffer());
  return true;
}
async function importarLibro(file) {
  let doc = null;
  try {
    const buf = await file.arrayBuffer();
    if (new TextDecoder().decode(new Uint8Array(buf, 0, 5)) !== "%PDF-") { toast("Ese archivo no es un PDF."); return; }
    const copia = new Blob([buf], {type: "application/pdf"});  // pdf.js se queda con el buffer: se guarda esta copia
    doc = await abrirPdf(buf);
    const p64 = doc.numPages >= 64 ? (await (await doc.getPage(64)).getTextContent()).items.map(i => i.str).join(" ") : "";
    if (!/Percentage Of 1RM/i.test(p64)) { toast("Ese PDF no es La Pirámide de entrenamiento v2.0: sus páginas no coinciden."); return; }
    await (await caches.open(LIBRO_CACHE)).put(libroUrl(), new Response(copia, {headers: {"Content-Type": "application/pdf"}}));
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
  } catch (e) { toast("No pude abrir ni guardar el PDF."); return; }
  LIBRO = doc; toast("Libro guardado en este teléfono.");
  if (visor) pintarVisor();
}
function abrirVisor(n) {
  visor = {pag: n, zoom: 1};
  document.body.style.overflow = "hidden";
  try { if (!(history.state && history.state.libro)) history.pushState({libro: 1}, ""); } catch (e) {}
  pintarVisor();
}
function cerrarVisor(desdeAtras) {
  visor = null; document.body.style.overflow = sheet ? "hidden" : "";
  const r = $("#libro-root"); if (r) r.innerHTML = "";
  if (!desdeAtras && history.state && history.state.libro) { try { history.back(); } catch (e) {} }
}
const ayudaVisor = () => visor.zoom > 1 ? "Desliza para moverte. Toca para alejar." : "Toca la página para acercar.";
async function pintarVisor() {
  let r = $("#libro-root");
  if (!r) { r = document.createElement("div"); r.id = "libro-root"; document.body.appendChild(r); }
  const hay = await cargarLibro().catch(() => false);
  if (!visor) return;
  const n = visor.pag, total = hay ? LIBRO.numPages : 0;
  r.innerHTML = `<div class="visor" role="dialog" aria-label="Libro, página ${n}">
    <div class="visor-bar">
      <button class="circ" data-libro-ir="${n - 1}" aria-label="Página anterior" ${!hay || n <= 1 ? "disabled" : ""}>${ICON.back}</button>
      <span class="visor-t">La Pirámide · <b>p.${n}</b></span>
      <button class="circ" data-libro-ir="${n + 1}" aria-label="Página siguiente" ${!hay || n >= total ? "disabled" : ""}>${ICON.next}</button>
      <button class="link-btn" data-libro-cerrar>Cerrar</button></div>
    ${hay ? `<div class="visor-pag"><canvas></canvas></div><p class="visor-ayuda">${ayudaVisor()}</p>`
      : `<div class="visor-msg"><div class="panel"><p style="margin:0"><b>El libro no viene dentro de la app.</b> Ábrelo una vez desde el PDF <span class="mono">the-muscle-and-strength-training-pyramid-v20.pdf</span> y queda guardado en este teléfono.</p>
        <label class="btn pri btn-archivo">Abrir el PDF del libro<input type="file" id="libro-file" accept="application/pdf,.pdf" hidden></label></div></div>`}
  </div>`;
  if (hay) pintarPagina();
}
async function pintarPagina(fx, fy) {
  const caja = $("#libro-root .visor-pag"), cv = caja && caja.querySelector("canvas");
  if (!cv || !visor) return;
  const pagina = await LIBRO.getPage(visor.pag), base = pagina.getViewport({scale: 1});
  const ancho = caja.clientWidth * visor.zoom, dpr = Math.min(window.devicePixelRatio || 1, 3);
  const vp = pagina.getViewport({scale: ancho / base.width * dpr});
  if (visor.tarea) visor.tarea.cancel();
  cv.width = Math.floor(vp.width); cv.height = Math.floor(vp.height);
  cv.style.width = ancho + "px"; cv.style.height = vp.height / dpr + "px";
  visor.tarea = pagina.render({canvasContext: cv.getContext("2d"), viewport: vp});
  if (fx != null) { caja.scrollLeft = fx * ancho - caja.clientWidth / 2; caja.scrollTop = fy * vp.height / dpr - caja.clientHeight / 2; }
  try { await visor.tarea.promise; } catch (e) {}
}
function zoomVisor(e) {  // tocar la página: acerca 2,5 veces donde tocaste, o vuelve al ancho de la pantalla
  const cv = e.target.closest("canvas"), b = cv.getBoundingClientRect();
  visor.zoom = visor.zoom > 1 ? 1 : 2.5;
  const ay = $("#libro-root .visor-ayuda"); if (ay) ay.textContent = ayudaVisor();
  pintarPagina((e.clientX - b.left) / b.width, (e.clientY - b.top) / b.height);
}
/* Cada «p.64» se vuelve un enlace a esa página: los de las referencias (.pg) y los escritos dentro del texto,
   como «(p.104–105)». Los de Nutrición no: ese libro no está. */
const RE_PAG = /(?<![\wÀ-ÿ])p\.(\d+)(?:–\d+)?/g;
const botonPag = (m, a, cls) => `<button class="${cls}" data-libro="${a}" aria-label="Ver la página ${a} del libro">${m}</button>`;
function enlazarPaginas() {
  document.querySelectorAll(".pg:not([data-enl])").forEach(el => {
    el.dataset.enl = "1";
    if (/Nutrici/.test(el.textContent) || el.closest("button, summary, a")) return;
    el.innerHTML = esc(el.textContent).replace(RE_PAG, (m, a) => botonPag(m, a, "pg-a"));
  });
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {acceptNode: n =>
    /p\.\d/.test(n.data) && !/Nutrici/.test(n.data) && n.parentElement && !n.parentElement.closest("button, a, summary, label, script, style, textarea, select, svg, .pg, .visor")
      ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT});
  const nodos = []; while (w.nextNode()) nodos.push(w.currentNode);
  nodos.forEach(n => {
    const t = document.createElement("template");
    t.innerHTML = esc(n.data).replace(RE_PAG, (m, a) => botonPag(m, a, "pg-a pg-t"));
    n.replaceWith(t.content);
  });
}
if (typeof MutationObserver !== "undefined") {
  const obs = () => { enlazarPaginas(); new MutationObserver(enlazarPaginas).observe(document.body, {childList: true, subtree: true}); };
  if (document.body) obs(); else document.addEventListener("DOMContentLoaded", obs);
}
const semTxt = p => p.semanas ? `${p.semanas} sem` : "semana tipo";
const diasDe = t => (String(t).match(/\d+/g) || []).map(Number);
function pasaFiltro(p) {
  const {obj, dias} = ui.cat;
  if (obj !== "todos" && p.objetivo !== obj) return false;
  if (dias !== "todos" && !diasDe(p.dias).some(n => diasDe(dias.replace("-", " ")).includes(n))) return false;
  return true;
}
function catalogoHtml() {
  if (catEstado === "falta" || catEstado === "sin-cache") return archivoHtml();
  if (!CATALOGO) { cargarCatalogo(); return `<p class="small mut" style="margin-top:16px">Abriendo el catálogo…</p>`; }
  const filtro = (tipo, ops) => `<div class="filtros" role="group">${ops.map(([id, n]) => `<button data-cat${tipo}="${id}" aria-pressed="${ui.cat[tipo] === id}">${n}</button>`).join("")}</div>`;
  const pag = p => { const m = p.fuente.match(/pág\. ([\d–, ]+\d)/); return m ? "p." + m[1] : ""; };
  const fila = p => `<button class="prog-f" data-prog="${esc(p.id)}"><span class="prog-n">${esc(nombreProg(p))}${st.programa && st.programa.id === p.id ? ' <span class="chip ok">en uso</span>' : ""}</span>
    <span class="prog-d">${esc([p.dias + " días", semTxt(p), p.grupo === "ladder" ? p.meta.replace(/ · .*/, "") : p.meta, p.grupo === "ladder" ? "" : p.nivel].filter(Boolean).join(" · "))}</span></button>`;
  const s = W[st.actual - 1];
  const tuPlan = `<button class="prog-f" data-tab="ano"><span class="prog-n">Exponential${st.programa ? "" : ' <span class="chip ok">en uso</span>'}</span>
    <span class="prog-d">${st.programa ? `Hasta la S${st.programa.desde - 1} · ábrelo en Año` : `52 sem · ${(BASE || W)[0].dias.length} días · ábrelo en Año`}</span></button>`;
  const vis = CATALOGO.programas.filter(pasaFiltro);
  const grupos = CATALOGO.grupos.map(g => {
    const l = vis.filter(p => p.grupo === g.id);
    const n = g.id === "guardados" && esTuyo() ? "Tus programas guardados" : g.n;  // el archivo es el mismo para todos; en tu teléfono son los tuyos
    return l.length ? `<h2>${esc(n)} <span class="small mut mono">${l.length}</span></h2><p class="small mut">${esc(g.d)}</p><div class="progs">${l.map(fila).join("")}</div>` : "";
  }).join("");
  const todos = ui.cat.obj === "todos" && ui.cat.dias === "todos";
  return `<p class="small mut" style="margin-top:16px">${CATALOGO.programas.length + 1} programas. Toca uno para ver sus semanas, días y ejercicios.</p>
    <span class="k cat-k">Objetivo</span>${filtro("obj", CAT_OBJ)}
    <span class="k cat-k">Días por semana</span>${filtro("dias", CAT_DIAS)}
    ${todos ? `<h2>Tu plan <span class="small mut mono">1</span></h2><p class="small mut">${esTuyo() ? "Tu año con los ciclos de la Pirámide." : "52 semanas con los ciclos de la Pirámide."}</p><div class="progs">${tuPlan}</div>` : ""}
    ${grupos || `<p class="small mut" style="margin-top:16px">Ningún programa con esos filtros.</p>`}
    <p class="small mut fuente-c">Catálogo ${CATALOGO.version ? "del " + esc(fechaTxt(CATALOGO.version)) + ", " : ""}guardado en este teléfono. ${botonArchivo("Abrir una versión nueva", "link-btn")}</p>`;
}
function ejCat(x) {
  const meta = [x.c, x.i, x.d].filter(Boolean).map(esc).join(" · ");
  const mas = [x.t ? `Técnica: ${x.t}` : "", x.x || "", x.sub && x.sub.length ? `Sustitutos: ${x.sub.join(" · ")}` : ""].filter(Boolean);
  return `<div class="ej-c"><div class="ej-h"><b>${esc(x.n)}</b><span class="ej-sr">${esc(x.s)} × ${esc(x.r)}</span></div>
    ${meta ? `<span class="ej-m">${meta}</span>` : ""}
    ${mas.length ? `<details class="ej-mas"><summary>Notas</summary>${mas.map(t => `<p>${esc(t)}</p>`).join("")}</details>` : ""}</div>`;
}
function fichaHtml() {
  const id = ui.cat.prog, P = FICHAS[id], idx = CATALOGO && CATALOGO.programas.find(p => p.id === id);
  const g = CATALOGO && idx ? CATALOGO.grupos.find(x => x.id === idx.grupo) : null;
  const volver = `<div class="ctx"><span>Programas${g ? " · " + esc(g.n) : ""}</span><button class="link-btn" data-prog-volver>Volver al catálogo</button></div>`;
  if (!P) { cargarFicha(id); return `${volver}<p class="small mut" style="margin-top:16px">Abriendo el programa…</p>`; }
  const n = P.plan.length, w = Math.min(ui.cat.sem, n - 1), sem = P.plan[w];
  const series = sem.d.reduce((a, d) => a + d.e.reduce((b, x) => b + (+x.s || 0), 0), 0), conEj = sem.d.filter(d => d.e.length).length;
  const activo = st.programa && st.programa.id === id, sig = Math.min(52, st.actual + 1);
  const usar = activo
    ? `<div class="usar"><p class="usar-ok">Lo usas desde la S${st.programa.desde}.</p><button class="btn quiet" data-dejar>Dejar este programa</button></div>`
    : `<div class="usar"><button class="btn pri" data-usar="${esc(id)}" data-desde="${sig}">Usar desde la próxima semana (S${sig})</button>
       ${sig !== st.actual ? `<button class="btn" data-usar="${esc(id)}" data-desde="${st.actual}">Usar desde esta semana (S${st.actual})</button>` : ""}</div>`;
  return `${volver}
    <div class="titulo"><h1>${esc(nombreProg(P))}</h1><p class="sub ficha-sub">${[P.dias + " días", semTxt(P), P.autor, P.grupo === "ladder" ? "" : P.nivel].filter(Boolean).map(esc).join(" · ")}</p></div>
    ${usar}
    <details class="sobre"><summary>Cómo es y cómo progresar</summary><div>
      <p>${esc(P.resumen)}</p><p>${esc(P.progresion)}</p>${P.aviso ? `<p class="mut">${esc(P.aviso)}</p>` : ""}<p class="mut">Fuente: ${esc(P.fuente)}.</p></div></details>
    <div class="titulo-row prog-sem"><div class="titulo"><h2>${esc(sem.n)}${n > 1 ? ` <span class="small mut mono">${w + 1} de ${n}</span>` : ""}</h2><p class="sub">${esc([sem.b, `${conEj} ${conEj === 1 ? "día" : "días"} de entrenamiento · ${series} series`].filter(Boolean).join(" · "))}</p></div>
      ${n > 1 ? `<button class="circ" data-progsem="-1" aria-label="Semana anterior" ${w === 0 ? "disabled" : ""}>${ICON.back}</button>
      <button class="circ" data-progsem="1" aria-label="Semana siguiente" ${w === n - 1 ? "disabled" : ""}>${ICON.next}</button>` : ""}</div>
    ${sem.d.map(d => `<section class="dia-card"><h3>${esc(d.n)}</h3>${d.desc ? `<p class="dia-desc">${esc(d.desc)}</p>` : ""}
      ${d.e.length ? d.e.map(ejCat).join("") : d.desc ? "" : `<p class="dia-desc">Descanso.</p>`}</section>`).join("")}`;
}
/* ── Usar un programa del catálogo: desde la semana que elijas, tus semanas pasan a ser las del programa
   (se repite hasta la S52). Las semanas anteriores y lo anotado no cambian. Se guarda en el teléfono y en
   programa.json de tu repositorio. ── */
let BASE = null;  // las semanas del plan de la app (plan.json o plan-base.json), sin programa
const LIFT_DE = [[/^(sentadilla|back squat|squat|barbell back squat|pause squat)$/i, "sentadilla"],
  [/^(press banca|press de banca|bench|bench press|barbell bench press|bench (power|strength|hypertrophy)|pause barbell bench press)$/i, "banca"],
  [/^(peso muerto|deadlift|barbell deadlift|touch-and-go deadlift)$/i, "peso_muerto"]];
/* RPE para la app: «RPE 6–8» → 6–8, «RPE ~7–8 → ~9» → 7–9, «RIR 2» → 8, «RPE 8 (1.ª serie)» → 8. */
function rpeDe(i) {
  const t = String(i || "");
  const rir = t.match(/RIR\s*([\d/]+)/);
  const ns = rir ? rir[1].split("/").map(Number).filter(n => !isNaN(n)).map(n => 10 - n) : (t.match(/\d+(?:,\d+)?/g) || []).map(num).filter(x => x != null && x >= 4 && x <= 10);
  if (!ns.length) return "";
  const a = Math.min(...ns), b = Math.max(...ns);
  return a === b ? f(a) : `${f(a)}–${f(b)}`;
}
function pctDe(c) {
  const m = String(c || "").match(/(\d+(?:,\d+)?)(?:\s*–\s*(\d+(?:,\d+)?))?\s*%/); if (!m) return null;
  const a = num(m[1]), b = m[2] ? num(m[2]) : a;
  return {pct: Math.round((a + b) / 2 * 10) / 10, txt: m[2] ? `${f(a)}–${f(b)} %` : `${f(a)} %`, rango: !!m[2]};
}
const tipoPrograma = t => /descarga|deload/i.test(t) ? "desc" : /prueba|test|competencia|puesta a punto|taper/i.test(t) ? "test" : /intensif|pico|peak|fuerza/i.test(t) ? "int" : "acc";
function itemsDePrograma(d) {
  const usados = {};
  const items = d.e.map(e => {
    let id = slug(e.n) || "ejercicio"; usados[id] = (usados[id] || 0) + 1; if (usados[id] > 1) id += "_" + usados[id];
    const p = pctDe(e.c), basico = (LIFT_DE.find(([re]) => re.test(String(e.n).replace(/^superset \d+:\s*/i, "").trim())) || [])[1], lift = p ? basico : null;
    const notas = [p && !lift ? `Carga: ${p.txt} de tu máximo en este ejercicio.` : "", p && lift && p.rango ? `Carga: ${p.txt} de tu máximo; la app usa el punto medio.` : "",
      e.i && !/^RPE [\d,–]+$/.test(e.i) ? `Intensidad del programa: ${e.i}.` : "", e.t ? `Técnica: ${e.t}.` : "", e.x || ""].filter(Boolean).join(" ");
    const base = {n: e.n, sets: +e.s || 1, reps: String(e.r), rpe: rpeDe(e.i), slot: id, descanso: e.d || "", txt: notas, alt: e.sub && e.sub.length ? e.sub : null};
    // un básico sin % (p. ej. The Muscle Ladder va por RPE) se anota como ese básico, para que sume a su Avance
    return lift ? Object.assign(base, {k: "main", ex: lift, lift, pct: p.pct}) : Object.assign(base, {k: "acc", ex: basico || id});
  });
  if (!items.length && d.desc) items.push({k: "nota", n: d.n, txt: d.desc});
  return items;
}
function semanasDePrograma(base, P) {
  const plan = P.datos.plan, K = plan.length, desde = Math.max(1, Math.min(52, +P.desde || 1));
  return base.map(s => {
    if (s.w < desde) return s;
    const i = (s.w - desde) % K, sem = plan[i], vuelta = Math.floor((s.w - desde) / K) + 1;
    return {w: s.w, programa: true, tipo: tipoPrograma(`${sem.b || ""} ${sem.n}`), pos: "",
      etiqueta: K > 1 ? `S${i + 1} del programa${sem.b ? " · " + sem.b : ""}` : "Semana tipo del programa", bloque: P.nombre, macro: P.nombre,
      nota: `${P.nombre}${K > 1 ? ` · semana ${i + 1} de ${K}` : " · semana tipo"}${vuelta > 1 ? ` · vuelta ${vuelta}` : ""}.`,
      dias: sem.d.map((d, j) => ({id: "d" + (j + 1), n: d.n, items: itemsDePrograma(d)}))};
  });
}
function aplicarPlan() {
  if (!BASE) BASE = DATA.semanas;
  const P = st.programa;
  W = P && P.datos && Array.isArray(P.datos.plan) && P.datos.plan.length ? semanasDePrograma(BASE, P) : BASE;
  const s = W[ui.week - 1] || W[0]; ui.day = Math.max(0, Math.min(ui.day, s.dias.length - 1));
}
function usarPrograma(id, desde) {
  const P = FICHAS[id]; if (!P || !P.plan) { toast("Abre el programa de nuevo y vuelve a intentar."); return; }
  const nombre = nombreProg(P);
  const anotado = desde === st.actual && LOG[desde] && Object.keys(LOG[desde]).length;
  if (!confirm(`Desde la S${desde}, tu plan será «${nombre}». Las semanas anteriores y lo que anotaste no cambian.${anotado ? ` Lo que ya anotaste en la S${desde} queda en tu historial, pero no en los días del programa.` : ""}`)) return;
  st.programa = {id, nombre, desde, desdeFecha: hoyIso(), datos: P};
  dirty.programa = marca(); saveStore(); aplicarPlan(); pedirGuardado(0);
  Object.assign(ui, {tab: "hoy", week: st.actual >= desde ? st.actual : desde, abierto: undefined, dayTouched: false});
  ui.cat.prog = null; autoDia(); render(); window.scrollTo(0, 0);
  toast(`Desde la S${desde} sigues «${nombre}».`);
}
function dejarPrograma() {
  if (!st.programa || !confirm(`¿Dejar «${st.programa.nombre}» y volver al plan Exponential? Lo anotado no se borra.`)) return;
  st.programa = null; dirty.programa = marca(); saveStore(); aplicarPlan(); pedirGuardado(0);
  ui.cat.prog = null; render(); toast("Volviste al plan Exponential.");
}
/* Los 20 de The Muscle Ladder se llaman igual por tipo de división: el nombre lleva los días y el nivel. */
const nombreProg = p => p.grupo !== "ladder" ? p.nombre
  : `${p.nombre.replace(/^\d+ · /, "")} · ${p.dias} días · ${/poco tiempo/.test(p.meta) ? (p.nivel === "Avanzado" ? "avanzado, rápido" : "rápido") : String(p.nivel).toLowerCase()}`;
function masProgramas() { return ui.cat.prog ? "" : catalogoHtml(); }
/* La ficha deja una entrada en el historial: el botón «atrás» del teléfono vuelve al catálogo en vez de salir de la app. */
function cerrarFicha() { const y = ui.cat.y; ui.cat.prog = null; renderMas(); if (ui.tab === "mas") window.scrollTo(0, y); }
function renderMas() {
  if (ui.mas === "programas" && ui.cat.prog) { $("#v-mas").innerHTML = fichaHtml(); return; }
  const [t, sub] = {programas: ["Programas", "Elige un programa del catálogo."], bloques: ["Bloques del año", "Qué hace cada bloque y de qué página sale."], volumen: ["Volumen por músculo", "Series por músculo, semana a semana."],
    reglas: ["Reglas y herramientas", "Checklist, calculadoras y las reglas del plan."], datos: ["Tus datos", "Dónde se guarda tu registro."], tema: ["Tema", "Los colores de toda la app."]}[ui.mas] || ["Más", ""];
  let body = `<div class="titulo"><h1>${t}</h1><p class="sub">${sub}</p></div>
    <div class="seg seg-mas" style="--n:6" role="group" aria-label="Secciones de Más">${[["programas", "Programas"], ["bloques", "Bloques"], ["volumen", "Volumen"], ["reglas", "Reglas"], ["datos", "Datos"], ["tema", "Tema"]].map(([id, n]) => `<button data-mas="${id}" aria-pressed="${ui.mas === id}">${n}</button>`).join("")}</div>`
    + ({programas: masProgramas, bloques: masBloques, volumen: masVolumen, reglas: masReglas, datos: masDatos, tema: masTema}[ui.mas] || masBloques)();
  if (ui.mas === "datos") body += `<h2>Versión ${VERSION.n} · ${esc(VERSION.nombre)}</h2>
    <div class="list">${VERSIONES.map(v => `<div class="row"><span class="k">V${v.n} · ${esc(v.nombre.toUpperCase())} · ${esc(v.fecha.toUpperCase())}</span><p class="small" style="margin:3px 0 0;color:var(--tx2)">${esc(v.txt)}</p></div>`).join("")}</div>`;
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

/* ── hoja de registro: el ejercicio en foco ── */
function antesDe(w, key, it) {
  for (let x = w - 1; x >= 1; x--) {
    const p = LOG[x] && LOG[x][key];
    if (registrado(p) && !p.omitido) return `S${x} · ${hechoDe(p, it).id !== it.ex ? hechoDe(p, it).n + ": " : ""}${resumen(p.sets)}`;
  }
  const pr = PROG[it.ex];
  return pr ? `S${pr.w} · ${kg(pr.kg)} (${pr.motivo})` : "Sin registro anterior";
}
const filaVacia = r => String(r.kg ?? "").trim() === "" && String(r.reps ?? "").trim() === "" && String(r.rpe ?? "").trim() === "";
function abrirRegistro(w, key) {
  const it = itemDeClave(w, key); if (!it) return;
  const prev = LOG[w] && LOG[w][key];
  const rows = [], antiguo = !!(it.lado && prev && prev.sets && nHechas(prev, it) > prev.sets.length);  // anotado hasta la 2.1, por las dos piernas
  for (let i = 0; i < (antiguo ? prev.sets.length : Math.max(nSeries(it), prev && prev.sets ? prev.sets.length : 0)); i++) {
    const v = (prev && prev.sets && prev.sets[i]) || {};
    const fila = {kg: v.kg == null ? "" : numTxt(v.kg), reps: v.reps ?? "", rpe: v.rpe == null ? "" : numTxt(v.rpe)};
    if (it.lado && !antiguo) fila.lado = v.lado || (i % 2 ? "der" : "izq");  // por lado: izquierda primero, como pide tu plan
    rows.push(fila);
  }
  const hecho = hechoDe(prev, it), esOtro = !opcionesHecho(it).some(o => o[0] === hecho.id);
  const libre = rows.findIndex(filaVacia);
  sheet = {tipo: "reg", w, key, it, rows, sel: libre >= 0 ? libre : rows.length - 1, hid: esOtro ? "otro" : hecho.id, otro: esOtro ? hecho.n : "", com: (prev && prev.com) || ""};
  ui.dockCtl = false;
  [w - 1, w - 2].filter(x => x >= 1).forEach(x => cargarSemana(x));
  marcarHoja();
  renderSheet(true);
}
function abrirExtra(did) {
  sheet = {tipo: "extra", w: ui.week, did, nombre: "", rows: [1, 2, 3].map(() => ({kg: "", reps: "", rpe: ""}))};
  marcarHoja();
  renderSheet(true);
}
function cerrarSheet(desdeAtras) {
  sheet = null; ui.dockCtl = false; $("#sheet-root").innerHTML = ""; document.body.style.overflow = ""; render();
  // si la hoja dejó una entrada en el historial y no se cerró con «atrás», se quita
  if (!desdeAtras && typeof history !== "undefined" && history.state && history.state.hoja) { try { history.back(); } catch (e) {} }
}
/* La hoja deja una entrada en el historial: el botón «atrás» de Android la cierra en vez de salir de la app. */
function marcarHoja() {
  try { if (typeof history !== "undefined" && !(history.state && history.state.hoja)) history.pushState({hoja: 1}, ""); } catch (e) {}
}
function placeholders() {
  const s = W[sheet.w - 1], it = sheet.it;
  const hid = sheet.hid === "otro" ? "otro:" + slug(sheet.otro || "") : sheet.hid;
  return {
    kg: cargaSugerida(s, it, hid) || "",
    reps: it.k === "single" ? 1 : it.k === "amrap" ? "" : rango(it.reps)[0],
    rpe: it.rpe_esp || (it.rpe ? rango(it.rpe)[1] : ""),
  };
}
function setsHtml(ph) {  // series del ejercicio extra
  return sheet.rows.map((r, i) => `<div class="set"><span class="n">${i + 1}</span>
    <input class="inp" type="text" inputmode="decimal" data-i="${i}" data-f="kg" value="${esc(r.kg)}" placeholder="${esc(ph.kg)}" aria-label="Kilos, serie ${i + 1}">
    <input class="inp" type="text" inputmode="numeric" data-i="${i}" data-f="reps" value="${esc(r.reps)}" placeholder="${esc(ph.reps)}" aria-label="Reps, serie ${i + 1}">
    <input class="inp" type="text" inputmode="decimal" data-i="${i}" data-f="rpe" value="${esc(r.rpe)}" placeholder="${esc(ph.rpe)}" aria-label="RPE, serie ${i + 1}"></div>`).join("");
}
function sumTxt() {
  const v = leerSets();
  return v.length ? `${v.length} ${v.length === 1 ? "serie" : "series"} · ${v.reduce((a, x) => a + x.reps, 0)} reps` : "Sin series anotadas";
}
function tablaSeries(ph) {
  const it = sheet.it;
  return `<div class="tabla-s"><div class="h"><span>SERIE</span><span>KG</span><span>REPS</span><span>RPE</span><span></span></div>
  ${sheet.rows.map((r, i) => {
    const c = (v, p) => String(v) === "" ? `<span class="ph">${esc(p === "" || p == null ? "—" : p)}</span>` : `<span>${esc(v)}</span>`;
    const num1 = r.lado ? `${Math.floor(i / 2) + 1}${r.lado === "izq" ? " I" : " D"}` : String(i + 1);
    return `<button class="fila${i === sheet.sel ? " sel" : ""}" data-selrow="${i}" aria-pressed="${i === sheet.sel}" aria-label="Serie ${num1}"><span>${num1}</span>${c(r.kg, ph.kg)}${c(r.reps, ph.reps)}${c(r.rpe, it.rpe || "")}${filaVacia(r) ? "<span></span>" : ICON.ok}</button>`;
  }).join("")}</div>`;
}
function grande(fld, r, ph) {
  const inc = fld === "kg" ? incKg(sheet.it, hechoSheet().n) : 1;
  return `<div class="gr"><span class="k">${fld === "kg" ? "KG" : "REPS"}</span>
    <input class="num-g" data-f="${fld}" data-i="${sheet.sel}" type="text" inputmode="${fld === "kg" ? "decimal" : "numeric"}" value="${esc(r[fld])}" placeholder="${esc(ph[fld])}" aria-label="${fld === "kg" ? "Kilos" : "Reps"}, serie ${sheet.sel + 1}">
    <div class="stp2"><button data-stp="${fld}" data-d="-1" aria-label="Restar ${f(inc)}">−${f(inc)}</button><button data-stp="${fld}" data-d="1" aria-label="Sumar ${f(inc)}">+${f(inc)}</button></div></div>`;
}
function renderSheet(primera) {
  const cuerpo = $(".sheet-body"), scroll = cuerpo ? cuerpo.scrollTop : 0;
  document.body.style.overflow = "hidden";
  let html;
  if (sheet.tipo === "reg") {
    const s = W[sheet.w - 1], it = sheet.it, did = sheet.key.split(":")[0];
    const di = s.dias.findIndex(d => d.id === did), d = s.dias[di], ph = placeholders(), ops = opcionesHecho(it);
    const ej = itemsEj(d), pos = ej.findIndex(x => claveDe(did, x) === sheet.key), sig = ej[pos + 1];
    const prev = (LOG[sheet.w] || {})[sheet.key], [cls, txt] = estadoItem(s, it, prev);
    const r = sheet.rows[sheet.sel] || {kg: "", reps: "", rpe: ""};
    html = `<div class="sheet${primera ? " entra" : ""}" role="dialog" aria-modal="true" aria-labelledby="sh-h"><div class="sheet-in">
      <div class="sheet-top"><button class="back" data-sheet-close aria-label="Volver">${ICON.back}</button>
        <div class="top-txt"><span class="eyebrow">S${s.w} · D${di + 1} · ejercicio ${pos + 1} de ${ej.length}</span><h1 id="sh-h">${esc(nombrePlan(it))}</h1></div>
        <span class="chip ${cls}">${txt}</span></div>
      <div class="prog" aria-hidden="true">${ej.map((x, i) => `<i class="${i < pos ? "p" : i === pos ? "a" : ""}"></i>`).join("")}</div>
      <div class="sheet-body">
        <div class="kv"><span class="k">PLAN</span><span class="v">${esc(planTxt(s, it))}</span><span class="k">ANTES</span><span class="v">${esc(antesDe(s.w, sheet.key, it))}</span><span class="k">DESCANSO</span><span class="v">${esc(descanso(it))}</span></div>
        ${detalleTxt(s, it).map(x => `<p class="small mut">${esc(x)}</p>`).join("")}
        <label class="fl">Hiciste<select class="inp" data-hecho>${ops.map(([id, nm]) => `<option value="${esc(id)}" ${id === sheet.hid ? "selected" : ""}>${esc(nm)}</option>`).join("")}<option value="otro" ${sheet.hid === "otro" ? "selected" : ""}>Otro…</option></select></label>
        <label class="fl" ${sheet.hid === "otro" ? "" : "hidden"} id="otro-wrap">¿Cuál?<input class="inp" data-otro value="${esc(sheet.otro)}" placeholder="Queda con este nombre"></label>
        <section class="foco" aria-label="Serie ${sheet.sel + 1}">
          <span class="k acc">Serie ${r.lado ? `${Math.floor(sheet.sel / 2) + 1} · ${r.lado === "izq" ? "izquierda" : "derecha"}` : sheet.sel + 1} · ${filaVacia(r) ? "en curso" : "editando"}</span>
          <div class="grandes">${grande("kg", r, ph)}<span class="por">×</span>${grande("reps", r, ph)}</div>
          ${rpeHtml(r.rpe)}
        </section>
        <div id="tabla-series">${tablaSeries(ph)}</div>
        <div class="btn-row"><button class="btn ghost" data-add-set>Añadir serie</button><button class="btn quiet" data-del-set>Quitar la última</button></div>
        <p class="small mut">Lo tenue es lo sugerido por el plan: una serie con algo anotado toma lo sugerido en lo que dejes vacío. El RPE nunca se inventa.</p>
        <div class="btn-row"><button class="btn" data-igual>Igual al plan</button><button class="btn quiet" data-omit>No lo hice</button></div>
        <label class="fl">Comentario<textarea class="inp" rows="2" data-com placeholder="Cómo te sentiste, técnica, dolor… (opcional)">${esc(sheet.com)}</textarea></label>
        ${sig ? `<div class="sig"><span class="k">Siguiente</span><b>${esc(conMeta(sig.n))}</b><span class="v">${esc(planTxt(s, sig))}</span></div>` : ""}
      </div>
      <div class="sheet-foot">${controlesDescanso(it)}<div class="dock-in">${anilloHtml(descanso(it))}
        <div class="dock-txt"><span class="k">Guardar el ejercicio</span><span class="v" id="sh-sum">${sumTxt()}</span></div>
        <button class="dock-ok" data-save aria-label="Guardar el ejercicio">${ICON.ok}</button></div></div>
    </div></div>`;
  } else if (sheet.tipo === "hist") {
    html = histHtml(primera);
  } else {
    const s = W[sheet.w - 1], di = s.dias.findIndex(d => d.id === sheet.did);
    html = `<div class="sheet${primera ? " entra" : ""}" role="dialog" aria-modal="true" aria-labelledby="sh-h"><div class="sheet-in">
      <div class="sheet-top"><button class="back" data-sheet-close aria-label="Volver">${ICON.back}</button>
        <div class="top-txt"><span class="eyebrow">S${s.w} · D${di + 1} · fuera del plan</span><h1 id="sh-h">Ejercicio extra</h1></div></div>
      <div class="sheet-body">
        <label class="fl">Nombre<input class="inp" data-xn value="${esc(sheet.nombre)}" placeholder="Ej. curl de muñeca"></label>
        <div class="sets-x"><div class="sets-h"><span></span><span>KG</span><span>REPS</span><span>RPE</span></div>
          <div id="sets">${setsHtml({kg: "", reps: "", rpe: ""})}</div></div>
        <button class="btn ghost" data-add-set>Añadir serie</button>
        <p class="small mut">Los extras se guardan en el día, pero no mueven tu progresión ni el volumen del plan.</p>
      </div>
      <div class="sheet-foot pie"><span class="mono mut" id="sh-sum">${sumTxt()}</span><button class="btn pri" data-save-extra>Guardar</button></div>
    </div></div>`;
  }
  $("#sheet-root").innerHTML = html;
  const nuevo = $(".sheet-body"); if (nuevo && !primera) nuevo.scrollTop = scroll;
  renderDock();
  guardarBorrador();
  pantalla();
}
/* Cambios chicos en la hoja (pasos, RPE, escribir) sin redibujarla: no se pierde el foco ni la posición. */
function refrescarSheet(forzar) {
  if (!sheet || sheet.tipo !== "reg") return;
  const r = sheet.rows[sheet.sel], ph = placeholders();
  ["kg", "reps"].forEach(fld => { const i = document.querySelector(`.foco [data-f="${fld}"]`); if (i && (forzar || document.activeElement !== i)) i.value = r[fld]; });
  document.querySelectorAll(".foco [data-rpe]").forEach(b => b.setAttribute("aria-pressed", String(String(r.rpe) !== "" && +b.dataset.rpe === +r.rpe)));
  const t = $("#tabla-series"); if (t) t.innerHTML = tablaSeries(ph);
  const sm = $("#sh-sum"); if (sm) sm.textContent = sumTxt();
  guardarBorrador();
}
function refrescarSets() { $("#sets").innerHTML = setsHtml({kg: "", reps: "", rpe: ""}); $("#sh-sum").textContent = sumTxt(); }
function leerSets() {
  const ph = sheet.tipo === "reg" ? placeholders() : {kg: "", reps: "", rpe: ""};
  return sheet.rows.map(r => {
    if (filaVacia(r)) return null;
    const k = num(r.kg) ?? num(ph.kg) ?? 0, reps = num(r.reps) ?? num(ph.reps) ?? 0, rpe = num(r.rpe);
    const o = {kg: k, reps, rpe: rpe == null ? null : rpe};
    if (r.lado) o.lado = r.lado;
    return o;
  }).filter(Boolean);
}
function hechoSheet() {
  const it = sheet.it;
  if (sheet.hid === "otro") { const t = (sheet.otro || "").trim(); return t ? {id: "otro:" + slug(t), n: t} : {id: "otro:sin_nombre", n: "Otro ejercicio"}; }
  const o = opcionesHecho(it).find(o => o[0] === sheet.hid) || [it.ex];
  return {id: o[0], n: o[0] === it.ex ? nombrePlan(it) : o[1]};
}
const siguienteNum = (fld, base, d, it, n) => fld === "kg" ? Math.max(0, Math.round((base + d * incKg(it, n)) * 100) / 100) : Math.max(0, Math.round(base) + d);
function pasoNum(fld, d) {
  if (sheet && sheet.tipo === "reg") {
    const row = sheet.rows[sheet.sel], ph = placeholders();
    row[fld] = numTxt(siguienteNum(fld, num(row[fld]) ?? num(ph[fld]) ?? 0, d, sheet.it, hechoSheet().n));
    refrescarSheet(true); return;
  }
  const it = itemEdit(); if (!it) return;
  edit[fld] = siguienteNum(fld, num(edit[fld]) ?? 0, d, it, hechoDe((LOG[edit.w] || {})[edit.key], it).n);
  edit.tocado = true;
  const i = $(`#v-hoy [data-ed="${fld}"]`); if (i) i.value = numTxt(edit[fld]);
  pintarEditor();
}
function elegirRpe(v) {
  if (sheet && sheet.tipo === "reg") { const row = sheet.rows[sheet.sel]; row.rpe = num(row.rpe) === v ? "" : numTxt(v); refrescarSheet(true); return; }
  if (edit) { edit.rpe = edit.rpe != null && +edit.rpe === v ? null : v; edit.tocado = true; pintarEditor(); }
}
function guardarSheet(modo) {
  const it = sheet.it, w = sheet.w, key = sheet.key;
  const base = {v: 2, t: Date.now(), plan: {id: it.ex, n: nombrePlan(it)}};
  const com = (sheet.com || "").trim();
  let entry;
  if (modo === "omit") entry = Object.assign(base, {hecho: hechoSheet(), sets: [], omitido: true});
  else if (modo === "igual") {
    const k = +cargaSugerida(W[w - 1], it, it.ex) || 0, reps = it.k === "amrap" ? 0 : it.k === "single" ? 1 : rango(it.reps)[0];
    entry = Object.assign(base, {hecho: {id: it.ex, n: nombrePlan(it)}, sets: Array.from({length: nSeries(it)}, (_, i) => Object.assign({kg: k, reps, rpe: null}, it.lado ? {lado: i % 2 ? "der" : "izq"} : {})), igual: true});
  } else {
    const sets = leerSets();
    if (!sets.length) { toast("Anota al menos una serie, o usa «Igual al plan» o «No lo hice»."); return; }
    entry = Object.assign(base, {hecho: hechoSheet(), sets});
  }
  if (com) entry.com = com;
  guardarEntrada(w, key, entry, it);
  if (edit && edit.w === w && edit.key === key) {
    const s = W[w - 1], d = s.dias.find(x => x.id === key.split(":")[0]);
    if (entry.omitido || entry.sets.length >= nSeries(it)) ui.abierto = d ? pendienteDelDia(s, d) : null;
    edit = ui.abierto ? nuevoEdit(w, ui.abierto) : null;
  }
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
  dirty.weeks[w] = marca();
  pedirGuardado(300);
  cerrarSheet();
  toast("Extra guardado.");
}

/* ── historial por ejercicio: todas tus sesiones, también con variantes guardadas con ese nombre ── */
function sesionesDe(id) {
  const out = [];
  for (let w = 1; w <= 52; w++) {
    const log = LOG[w]; if (!log) continue;
    W[w - 1].dias.forEach((d, di) => itemsEj(d).forEach(it => {
      const p = log[claveDe(d.id, it)];
      if (!registrado(p) || p.omitido || !p.sets.length || hechoDe(p, it).id !== id) return;
      out.push({w, d: di + 1, sets: p.sets, max: Math.max(...p.sets.map(x => +x.kg || 0)), com: p.com || ""});
    }));
  }
  return out;
}
function abrirHistorial(id, nombre) {
  sheet = {tipo: "hist", id, nombre};
  ui.dockCtl = false;
  marcarHoja();
  cargarHistorial();
  renderSheet(true);
}
function graficoHist(ses, pr) {
  const pts = ses.slice(-8).map(x => ({l: `S${x.w} D${x.d}`, v: x.max}));
  const todos = pts.concat(pr && pr.next ? [{l: "próxima", v: pr.next, prox: true}] : []);
  const vals = todos.map(p => p.v), VW = 360, VH = 170, L = 40, R = 22, T = 12, B = 24;
  const y0 = Math.floor((Math.min(...vals) - 2) / 5) * 5, y1 = Math.max(y0 + 5, Math.ceil((Math.max(...vals) + 2) / 5) * 5);
  const X = i => todos.length < 2 ? (L + VW - R) / 2 : L + i * (VW - L - R) / (todos.length - 1), Y = v => T + (y1 - v) / (y1 - y0) * (VH - T - B);
  const paso = y1 - y0 > 20 ? 10 : 5, grid = [];
  for (let v = y0; v <= y1; v += paso) grid.push(`<line x1="${L}" x2="${VW - R}" y1="${Y(v)}" y2="${Y(v)}" style="stroke:var(--line)"/><text x="${L - 6}" y="${Y(v) + 3.5}" text-anchor="end" font-family="IBM Plex Mono, monospace" font-size="10" style="fill:var(--mut)">${v}</text>`);
  const reales = todos.filter(p => !p.prox);
  const linea = reales.length > 1 ? `<path d="${reales.map((p, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(p.v).toFixed(1)).join(" ")}" fill="none" style="stroke:var(--acc)" stroke-width="2" stroke-linecap="round"/>` : "";
  const ip = todos.length - 1, prox = todos[ip] && todos[ip].prox && reales.length ? `<path d="M${X(ip - 1).toFixed(1)} ${Y(reales[reales.length - 1].v).toFixed(1)} L${X(ip).toFixed(1)} ${Y(todos[ip].v).toFixed(1)}" fill="none" style="stroke:var(--faint)" stroke-width="2" stroke-dasharray="4 4"/>` : "";
  const puntos = todos.map((p, i) => `<circle cx="${X(i)}" cy="${Y(p.v)}" r="4.5" style="${p.prox ? "fill:var(--bg);stroke:var(--faint)" : "fill:var(--acc);stroke:var(--bg)"}" stroke-width="2"/><text x="${X(i)}" y="${VH - 6}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="9" style="fill:var(--mut)">${p.l}</text>`).join("");
  return `<figure class="chart" style="margin:0"><span class="k">Carga más alta por sesión · kg</span>
    <svg viewBox="0 0 ${VW} ${VH}" role="img" aria-label="${esc(todos.map(p => `${p.l}: ${f(p.v)} kg`).join("; "))}">${grid.join("")}${linea}${prox}${puntos}</svg></figure>`;
}
function histHtml(primera) {
  const ses = sesionesDe(sheet.id), pr = PROG[sheet.id];
  return `<div class="sheet${primera ? " entra" : ""}" role="dialog" aria-modal="true" aria-labelledby="sh-h"><div class="sheet-in">
    <div class="sheet-top"><button class="back" data-sheet-close aria-label="Volver">${ICON.back}</button>
      <div class="top-txt"><span class="eyebrow">Historial</span><h1 id="sh-h">${esc(sheet.nombre)}</h1></div></div>
    <div class="sheet-body">
      ${ses.length ? graficoHist(ses, pr) : `<p class="small mut">Todavía no hay series registradas de este ejercicio${conectado() ? "" : " en este teléfono"}.</p>`}
      ${pr ? `<div class="prox"><span class="k">PRÓXIMA</span><span><b class="mono">${kg(pr.next)}</b> · ${esc(pr.motivo)}.</span></div>` : ""}
      ${ses.length ? `<div class="notas-l">${ses.slice().reverse().map(x => `<div class="nota-i"><span class="k">S${x.w} · D${x.d}</span><span class="mono">${esc(resumen(x.sets))}</span>${x.com ? `<p>“${esc(x.com)}”</p>` : ""}</div>`).join("")}</div>` : ""}
    </div></div></div>`;
}

/* ── pantalla encendida mientras entrenas (Chrome en Android): con un ejercicio abierto o el registro a mano ── */
let bloqueo = null, pidiendo = false;
const pantallaOn = () => { try { return localStorage.getItem("exp-pantalla") !== "0"; } catch (e) { return true; } };
const quierePantalla = () => pantallaOn() && !!(edit || (sheet && sheet.tipo !== "hist")) && document.visibilityState === "visible";
async function pantalla() {
  if (pidiendo || typeof navigator === "undefined" || !navigator.wakeLock) return;  // un pedido a la vez: si no, queda uno suelto encendido
  const quiere = quierePantalla();
  try {
    if (quiere && !bloqueo) {
      pidiendo = true;
      const b = await navigator.wakeLock.request("screen");
      bloqueo = b; b.addEventListener("release", () => { if (bloqueo === b) bloqueo = null; });
      pidiendo = false;
      if (!quierePantalla()) pantalla();  // cambió mientras se pedía
    } else if (!quiere && bloqueo) { const b = bloqueo; bloqueo = null; await b.release(); }
  } catch (e) { pidiendo = false; }
}

/* ── borrador: lo que vas anotando sobrevive si el teléfono cierra la app ──
   Las series confirmadas ya se guardan al instante en el registro. Esto cubre lo que todavía no
   confirmas: la serie en curso de Hoy y el registro completo a medio llenar. Dura 12 horas. */
const BKEY = "exp-borrador";
function guardarBorrador() {
  if (recargando) return;
  try {
    const b = {t: Date.now(), quien: storeKey(), w: ui.week, day: ui.day, edit: edit && edit.tocado ? edit : null};
    if (sheet && sheet.tipo !== "hist") b.sheet = sheet.tipo === "reg"
      ? {tipo: "reg", w: sheet.w, key: sheet.key, rows: sheet.rows, sel: sheet.sel, hid: sheet.hid, otro: sheet.otro, com: sheet.com}
      : {tipo: "extra", w: sheet.w, did: sheet.did, nombre: sheet.nombre, rows: sheet.rows};
    localStorage.setItem(BKEY, JSON.stringify(b));
  } catch (e) {}
}
function restaurarBorrador() {
  let b = null;
  try { b = JSON.parse(localStorage.getItem(BKEY) || "null"); } catch (e) {}
  if (!b || Date.now() - (b.t || 0) > 12 * 3600 * 1000 || (b.quien || STORE) !== storeKey()) return false;  // solo el de esta persona
  const e = b.edit;
  if (e && e.w === ui.week && itemDeClave(e.w, e.key)) {
    const prev = (LOG[e.w] || {})[e.key], n = prev && prev.sets && !prev.omitido ? prev.sets.length : 0;
    edit = Object.assign({}, e, {idx: Math.min(e.idx, n)});
    const d = W[e.w - 1].dias.findIndex(x => x.id === e.key.split(":")[0]);
    if (d >= 0) ui.day = d;
    ui.abierto = e.key;
  }
  const h = b.sheet;
  if (h && h.tipo === "reg" && itemDeClave(h.w, h.key) && Array.isArray(h.rows) && h.rows.length) {
    sheet = Object.assign({}, h, {it: itemDeClave(h.w, h.key), sel: Math.max(0, Math.min(h.sel || 0, h.rows.length - 1))});
    return true;
  }
  if (h && h.tipo === "extra" && W[h.w - 1] && Array.isArray(h.rows) && h.rows.length) { sheet = Object.assign({}, h); return true; }
  return false;
}

/* ── vistas ── */
function autoDia() {
  const s = W[ui.week - 1], log = LOG[s.w] || {};
  const i = s.dias.findIndex(d => itemsEj(d).some(it => !registrado(log[claveDe(d.id, it)])));
  const dia = i >= 0 ? i : 0;
  // Si estabas anotando una serie de esta semana, se queda abierta en su día.
  if (edit && edit.tocado && edit.w === s.w) {
    const d = s.dias.findIndex(x => x.id === edit.key.split(":")[0]);
    if (d >= 0) { ui.day = d; ui.abierto = edit.key; return; }
  }
  // Volver a la app desde otra (música, mensajes) no cambia el ejercicio abierto ni borra lo que llevabas.
  if (dia !== ui.day || !edit || edit.w !== s.w) ui.abierto = undefined;
  ui.day = dia;
}
/* ── entrada: sin cuenta ni registro en el teléfono, la bienvenida; con correo por primera vez, el punto de partida ── */
const PARTIDA = [["banca", "Press de banca"], ["sentadilla", "Sentadilla"], ["peso_muerto", "Peso muerto"], ["jalon", "Jalón al pecho"]];
const hoyIso = () => { const h = new Date(); return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, "0")}-${String(h.getDate()).padStart(2, "0")}`; };
function puerta() {
  if (otraPersona()) return perfil ? null : perfilRevisado ? "partida" : "cargando";
  return !conectado() && !datosLocales && !Object.keys(LOG).length ? "bienvenida" : null;  // con registros en el teléfono, sigue como siempre
}
function maxPartida(id) {
  const x = ui.partida[id] || {}, k = num(x.kg), r = num(x.reps), rpe = num(x.rpe);
  if (!(k > 0 && r > 0 && rpe >= 6)) return null;
  return {max: r05(e1rm({kg: k, reps: r, rpe})), margen: r + (10 - rpe)};
}
function maxPartidaTxt(id) {
  const m = maxPartida(id);
  return !m ? "Pon kilos, reps y RPE." : `Máximo ≈ ${kg(m.max)}${m.margen > MAX_FIABLE ? " · poco preciso: estima mejor con una serie de 1–5 reps cerca del fallo (p.115, p.120)" : ""}`;
}
function bienvenidaHtml() {
  const inv = ui.inv || {};
  const tabs = [["Hoy", "Lo que toca hoy y dónde anotar cada serie."], ["Semana", "La semana entera, tu volumen y lo que falta."],
    ["Año", "Los ciclos, tus máximos y tus medidas."], ["Más", "Las reglas del libro, tus datos y los colores."]];
  return `<div class="titulo"><h1>Tu año de entrenamiento</h1><p class="sub">Un plan de 52 semanas hecho con la Pirámide, que se ajusta con lo que anotas.</p></div>
    <div class="panel" style="margin-top:16px">
      <p class="small" style="margin:0 0 12px">${inv.repo ? "Tu repositorio ya viene en el enlace. Pega la clave que te mandaron y toca Conectar." : "Quien te invitó te manda un enlace y una clave. Abre el enlace en este teléfono, o escribe aquí tu repositorio."}</p>
      <div style="display:flex;flex-direction:column;gap:12px">
        <label class="fl">Usuario<input class="inp" id="g-owner" value="${esc(inv.owner || TU_REPO.owner)}" autocapitalize="off" autocorrect="off" spellcheck="false"></label>
        <label class="fl">Tu repositorio<input class="inp" id="g-repo" value="${esc(inv.repo || "")}" placeholder="exponential-nombre" autocapitalize="off" autocorrect="off" spellcheck="false"></label>
        <label class="fl">Clave de acceso<input class="inp" id="g-token" type="password" autocomplete="off" placeholder="github_pat_…"></label>
        <div class="btn-row"><button class="btn pri" data-connect>Conectar</button></div>
        <p class="small mut" id="g-msg"></p>
      </div>
    </div>
    <p class="small mut" style="margin-top:12px">Tu registro se guarda en este teléfono y en un repositorio privado. Lo ven tú, quien te invitó y Claude cuando lo revisa para dejarte comentarios. No necesitas cuenta de GitHub: la clave basta.</p>
    <h2>Al entrar</h2>
    <div class="lista-puerta">${tabs.map(([n, d]) => `<div><b>${n}</b><span>${d}</span></div>`).join("")}</div>`;
}
function cargandoHtml() {
  const err = syncState === "error" && $("#sync") ? $("#sync").title : "";
  return `<div class="titulo"><h1>Entrando…</h1><p class="sub mono">${esc(cfg.owner)}/${esc(cfg.repo)}</p></div>
    <p class="small mut" style="margin-top:12px">${!navigator.onLine ? "Sin señal: la primera vez hace falta conexión para leer tu repositorio." : err ? esc(err) : "Leyendo tu repositorio."}</p>
    <div class="acciones">${err || !navigator.onLine ? `<button class="btn" data-syncnow>Reintentar</button>` : ""}<button class="btn quiet" data-disconnect>Desconectar</button></div>`;
}
function partidaHtml() {
  const P = ui.partida, rpes = [10, 9.5, 9, 8.5, 8, 7.5, 7];
  return `<div class="titulo"><h1>Tu punto de partida</h1><p class="sub">Con esto se calculan las cargas de tus 52 semanas.</p></div>
    <label class="fl" style="margin-top:16px">Tu nombre<input class="inp" data-pnombre value="${esc(P.nombre || "")}" autocomplete="given-name" placeholder="Cómo te llamas"></label>
    <h2>Tus básicos</h2>
    <p class="small mut">Una serie reciente de cada uno, de 1 a 5 reps y cerca del fallo: kilos, reps y RPE. Si sabes tu máximo, pon 1 rep a RPE 10. El máximo sale de la tabla de <span class="pg">p.64</span>.</p>
    <div class="partida">${PARTIDA.map(([id, n]) => { const x = P[id] || {}; return `<div class="pt-f"><b>${n}</b>
      <div class="pt-in">
        <label class="fl">Kilos<input class="inp mono" data-pl="${id}" data-pf="kg" inputmode="decimal" value="${esc(x.kg ?? "")}" placeholder="kg"></label>
        <label class="fl">Reps<input class="inp mono" data-pl="${id}" data-pf="reps" inputmode="numeric" value="${esc(x.reps ?? "")}" placeholder="reps"></label>
        <label class="fl">RPE<select class="inp mono" data-pl="${id}" data-pf="rpe"><option value="">—</option>${rpes.map(r => `<option value="${r}" ${String(x.rpe) === String(r) ? "selected" : ""}>${f(r)}</option>`).join("")}</select></label>
      </div><span class="small pt-out" id="pt-${id}">${esc(maxPartidaTxt(id))}</span></div>`; }).join("")}</div>
    <div class="acciones"><button class="btn pri" data-armar>Armar mi plan</button></div>
    <p class="small mut" style="margin-top:10px">Empiezas en la semana 1: una semana intro con ¾ de las series y un punto menos de RPE <span class="pg">p.104–105</span>. El plan está pensado para nivel intermedio <span class="pg">p.109, p.114</span>. Los máximos los cambias después en Año › Tus máximos.</p>
    <div class="acciones"><button class="btn quiet" data-disconnect>Desconectar</button></div>`;
}
function renderPuerta(p) {
  $("#h-eyebrow").textContent = "Exponential";
  ["semana", "ano", "mas"].forEach(t => { $("#v-" + t).hidden = true; });
  const v = $("#v-hoy"); v.hidden = false;
  v.innerHTML = `<div class="puerta">${p === "bienvenida" ? bienvenidaHtml() : p === "cargando" ? cargandoHtml() : partidaHtml()}</div>`;
}
function render() {
  if (!DATA) return;
  const p = puerta();
  document.body.classList.toggle("en-puerta", !!p);
  if (p) { renderPuerta(p); return; }
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
  renderDock();
  guardarBorrador();
  pantalla();
}
function irSemana(w) {
  ui.week = Math.max(1, Math.min(52, w));
  ui.dayTouched = true;
  if (ui.week === st.actual) autoDia(); else { ui.day = 0; ui.abierto = undefined; }
  saveStore();
  cargarSemana(ui.week);
  render();
  window.scrollTo(0, 0);
}
let toastT = null;
function toast(msg) {
  const r = $("#toast-root");
  r.innerHTML = `<div class="toast" role="status">${esc(msg)}</div>`;
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
  if (ds.libro) { abrirVisor(Number(ds.libro)); return; }
  if (ds.libroIr && visor) { visor.pag = Number(ds.libroIr); visor.zoom = 1; pintarVisor(); return; }
  if ("libroCerrar" in ds) { cerrarVisor(); return; }
  if (ds.tab) { ui.tab = ds.tab; ui.dockCtl = false; render(); window.scrollTo(0, 0); return; }
  if (ds.inv) {
    const r = String(ui.inv.nuevo || "").trim();
    if (!/^[A-Za-z0-9._-]+$/.test(r)) { toast("Escribe el nombre de su repositorio, por ejemplo exponential-ana."); return; }
    if (r === TU_REPO.repo) { toast("Ese es tu repositorio: elige otro nombre."); return; }
    if (ds.inv === "repo") window.open(enlaceRepoNuevo(r), "_blank", "noopener");
    else if (ds.inv === "clave") window.open(enlaceClave(r, "el registro de " + r), "_blank", "noopener");
    else {
      ui.inv.enlace = enlaceInvitacion(r);
      try { await navigator.clipboard.writeText(ui.inv.enlace); toast("Enlace copiado: pégalo en el correo."); }
      catch (err) { toast("No pude copiarlo: mantén presionado el enlace de abajo."); }
      renderMas();
    }
    return;
  }
  if ("armar" in ds) {
    const nombre = String(ui.partida.nombre || "").trim(), M = {};
    for (const [id, n] of PARTIDA) { const m = maxPartida(id); if (!m) { toast(`Falta ${n.toLowerCase()}: kilos, reps y RPE.`); return; } M[id] = m.max; }
    if (!nombre) { toast("Pon tu nombre."); return; }
    perfil = {nombre, creado: hoyIso(), partida: Object.fromEntries(PARTIDA.map(([id]) => [id, Object.assign({}, ui.partida[id], {max: M[id]})]))};
    st.rm = [{banca: M.banca, sentadilla: M.sentadilla, peso_muerto: M.peso_muerto}, {}, {}, {}, {}];
    st.jalon = M.jalon; st.actual = 1;
    Object.assign(ui, {week: 1, day: 0, abierto: undefined, tab: "hoy", dayTouched: false});
    dirty.perfil = marca(); dirty.estado = marca();
    pedirGuardado(0); render(); window.scrollTo(0, 0);
    toast(`Listo, ${nombre}: tu plan empieza en la semana 1.`); return;
  }
  if (t.id === "sync") { ui.tab = "mas"; ui.mas = "datos"; render(); window.scrollTo(0, 0); return; }
  if (ds.step) return irSemana(ui.week + Number(ds.step));
  if ("today" in ds) return irSemana(st.actual);
  if (ds.goweek) { ui.tab = "hoy"; return irSemana(Number(ds.goweek)); }
  if (ds.goday !== undefined) { ui.tab = "hoy"; ui.day = Number(ds.goday); ui.dayTouched = true; ui.abierto = undefined; render(); window.scrollTo(0, 0); return; }
  if (ds.day !== undefined) { ui.day = Number(ds.day); ui.dayTouched = true; ui.abierto = undefined; render(); return; }
  if (ds.abrir) {
    if (ui.abierto === ds.abrir) { ui.abierto = null; edit = null; }
    else { ui.abierto = ds.abrir; edit = nuevoEdit(ui.week, ds.abrir); }
    ui.dockCtl = false; render(); return;
  }
  if (ds.editset !== undefined && edit) { edit = nuevoEdit(edit.w, edit.key, Number(ds.editset)); edit.tocado = true; render(); return; }
  if (ds.stp) return pasoNum(ds.stp, Number(ds.d));
  if (ds.rpe) return elegirRpe(Number(ds.rpe));
  if ("guardarset" in ds) return guardarSerie();
  if (ds.hist) return abrirHistorial(ds.hist, ds.n || "Ejercicio");
  if (ds.lado && edit) { edit.lado = ds.lado; edit.tocado = true; render(); return; }
  if (ds.calor) {
    const k = ds.calor, i = Number(ds.i), a = ui.calor[k] || [];
    ui.calor[k] = a.includes(i) ? a.filter(x => x !== i) : a.concat(i);
    render(); return;
  }
  if ("pantalla" in ds) { try { localStorage.setItem("exp-pantalla", pantallaOn() ? "0" : "1"); } catch (e) {} render(); return; }
  if (ds.rtrpe) { ui.rt[ds.rtrpe] = Object.assign({}, ui.rt[ds.rtrpe], {rpe: Number(ds.v)}); renderSemana(); return; }
  if (ds.rtsave) {
    const l = ds.rtsave, w = Number(ds.w), b = ui.rt[l] || {}, i = $(`[data-rtkg="${l}"]`), antes = (LOG[w] || {})["rt~" + l] || {};
    const kgv = num(i ? i.value : b.kg), rpe = b.rpe ?? antes.rpe;
    if (!(kgv > 0) || !(rpe >= 8)) { toast("Anota los kilos del single y su RPE (8–9)."); return; }
    LOG[w] = LOG[w] || {};
    LOG[w]["rt~" + l] = {kg: kgv, reps: 1, rpe, t: Date.now()};
    ui.rt[l] = {}; dirty.weeks[w] = marca(); pedirGuardado(300); render();
    toast(`Single guardado: máximo estimado ≈ ${kg(r05(e1rm({kg: kgv, reps: 1, rpe})))}.`); return;
  }
  if ("medida" in ds) {
    const h = new Date(), m = {f: `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, "0")}-${String(h.getDate()).padStart(2, "0")}`};
    let alguna = false;
    document.querySelectorAll("[data-med]").forEach(x => { const v = num(x.value); if (v != null && v > 0) { m[x.dataset.med] = v; alguna = true; } });
    if (!alguna) { toast("Anota al menos una medida."); return; }
    st.medidas = (st.medidas || []).concat([m]);
    dirty.estado = marca(); pedirGuardado(300); renderAno(); toast("Medición guardada."); return;
  }
  if ("anillo" in ds) { ui.dockCtl = !ui.dockCtl; if (sheet) renderSheet(); else renderDock(); return; }
  if (ds.selrow !== undefined && sheet) { sheet.sel = Number(ds.selrow); renderSheet(); return; }
  if (ds.open) return abrirRegistro(ui.week, ds.open);
  if (ds.extraOpen) return abrirExtra(ds.extraOpen);
  if (ds.mas) { ui.mas = ds.mas; ui.cat.prog = null; saveStore(); render(); return; }
  if (ds.catobj || ds.catdias) { if (ds.catobj) ui.cat.obj = ds.catobj; else ui.cat.dias = ds.catdias; renderMas(); return; }
  if (ds.prog) {
    ui.cat = {...ui.cat, prog: ds.prog, sem: 0, y: window.scrollY};
    try { if (!(history.state && history.state.ficha)) history.pushState({ficha: 1}, ""); } catch (err) {}
    renderMas(); window.scrollTo(0, 0); return;
  }
  if (ds.usar) return usarPrograma(ds.usar, Number(ds.desde));
  if ("dejar" in ds) return dejarPrograma();
  if ("progVolver" in ds) { if (history.state && history.state.ficha) history.back(); else cerrarFicha(); return; }
  if (ds.progsem) { ui.cat.sem = Math.max(0, ui.cat.sem + Number(ds.progsem)); renderMas(); const h = $(".prog-sem"); if (h) h.scrollIntoView({block: "start"}); return; }
  if (ds.tema) { tema.modo = ds.tema; guardarTema(); renderMas(); return; }
  if (ds.av) { ui.av = ds.av; ui.avPt = null; renderAno(); return; }
  if (ds.tmas) {
    if (descansoT) { descansoT.fin = Math.max(Date.now() + 5000, descansoT.fin + Number(ds.tmas) * 1000); descansoT.total = Math.max(descansoT.total || 0, quedan()); guardarDescanso(); tickDescanso(); }
    return;
  }
  if ("tstop" in ds) return pararDescanso();
  if ("descanso" in ds) {
    const it = sheet && sheet.it ? sheet.it : itemEdit();
    if (it) { ui.dockCtl = false; iniciarDescanso(segundosDescanso(descanso(it)), nombrePlan(it)); if (sheet) renderSheet(); }
    return;
  }
  if (ds.delx) {
    const w = ui.week, k = "x~" + ds.delx, i = Number(ds.i);
    if (!LOG[w] || !LOG[w][k]) return;
    const x = LOG[w][k].splice(i, 1)[0];
    if (x) LOG[w]._del = [...(LOG[w]._del || []), x.t];
    dirty.weeks[w] = marca(); pedirGuardado(300); render(); return;
  }
  if (ds.setrm) {
    const lift = ds.setrm, v = Number(ds.v), w = Number(ds.w);
    if (lift === "jalon") st.jalon = v; else { const i = tramo(w); st.rm[i] = st.rm[i] || {}; st.rm[i][lift] = v; }
    dirty.estado = marca(); pedirGuardado(300); render(); toast(`Máximo actualizado: ${kg(v)}.`); return;
  }
  if (ds.actual) { st.actual = Number(ds.actual); dirty.estado = marca(); pedirGuardado(300); render(); toast(`La semana ${st.actual} es ahora la actual.`); return; }
  if ("sheetClose" in ds) return cerrarSheet();
  if ("addSet" in ds) {
    const l = sheet.rows[sheet.rows.length - 1] || {kg: "", reps: "", rpe: ""};
    sheet.rows.push(Object.assign({kg: l.kg, reps: l.reps, rpe: ""}, l.lado ? {lado: l.lado === "izq" ? "der" : "izq"} : {}));
    if (sheet.tipo === "reg") { sheet.sel = sheet.rows.length - 1; renderSheet(); } else refrescarSets();
    return;
  }
  if ("delSet" in ds) {
    if (sheet.rows.length > 1) { sheet.rows.pop(); sheet.sel = Math.min(sheet.sel, sheet.rows.length - 1); if (sheet.tipo === "reg") renderSheet(); else refrescarSets(); }
    return;
  }
  if ("igual" in ds) return guardarSheet("igual");
  if ("omit" in ds) return guardarSheet("omit");
  if ("save" in ds) return guardarSheet("normal");
  if ("saveExtra" in ds) return guardarExtraSheet();
  if ("syncnow" in ds) { Object.keys(loaded).forEach(k => delete loaded[k]); await enCola(pull); return; }
  if ("export" in ds) return exportar();
  if ("disconnect" in ds) {
    saveStore();  // lo de esta persona queda guardado aparte en el teléfono
    const quien = storeKey(); cfg.token = ""; saveCfg();
    if (storeKey() !== quien) return recargar();  // era otra persona: vuelve a la bienvenida sin mezclar datos
    setSync("local", "Guardado solo en este teléfono"); render(); return;
  }
  if ("connect" in ds) {
    const msg = $("#g-msg"), owner = $("#g-owner").value.trim(), repo = $("#g-repo").value.trim(), token = $("#g-token").value.trim();
    if (!owner || !repo || !token) { msg.textContent = "Completa los tres campos."; return; }
    msg.textContent = "Conectando…";
    try { await conectar(owner, repo, token); if (!recargando) { toast("Conectado a tu cuenta."); render(); } }
    catch (err) { msg.textContent = err.message; }
    return;
  }
});
const _deb = {};
document.addEventListener("input", e => {
  const t = e.target;
  if (!sheet && t.dataset.ed && edit) { edit[t.dataset.ed] = t.value; edit.tocado = true; pintarBarra(); guardarBorrador(); return; }
  if (sheet && t.dataset.f) {
    sheet.rows[Number(t.dataset.i)][t.dataset.f] = t.value;
    if (sheet.tipo === "reg") { const tb = $("#tabla-series"); if (tb) tb.innerHTML = tablaSeries(placeholders()); }
    $("#sh-sum").textContent = sumTxt(); guardarBorrador(); return;
  }
  if (t.dataset.rtkg) { ui.rt[t.dataset.rtkg] = Object.assign({}, ui.rt[t.dataset.rtkg], {kg: t.value}); return; }
  if (t.dataset.pl) {
    const id = t.dataset.pl; ui.partida[id] = Object.assign({}, ui.partida[id], {[t.dataset.pf]: t.value});
    const o = $("#pt-" + id); if (o) o.textContent = maxPartidaTxt(id); return;
  }
  if ("pnombre" in t.dataset) { ui.partida.nombre = t.value; return; }
  if ("invrepo" in t.dataset) { ui.inv.nuevo = t.value; ui.inv.enlace = ""; return; }
  if (sheet && "otro" in t.dataset) { sheet.otro = t.value; guardarBorrador(); return; }
  if (sheet && "com" in t.dataset) { sheet.com = t.value; guardarBorrador(); return; }
  if (sheet && "xn" in t.dataset) { sheet.nombre = t.value; guardarBorrador(); return; }
  if (t.dataset.dn) {
    const w = ui.week, did = t.dataset.dn;
    LOG[w] = LOG[w] || {};
    LOG[w]["n~" + did] = {txt: t.value.trim(), t: Date.now()};
    dirty.weeks[w] = marca();
    saveStore();  // en el teléfono, al instante; la subida espera a que dejes de escribir
    clearTimeout(_deb.dn); _deb.dn = setTimeout(() => pedirGuardado(0), 800);
    return;
  }
  if (t.id === "c-kg" || t.id === "c-reps") actualizarCalc();
  else if (t.id === "peso") { st.peso = t.value; dirty.estado = marca(); saveStore(); actualizarPeso(); clearTimeout(_deb.p); _deb.p = setTimeout(() => pedirGuardado(0), 900); }
});
/* Puntos del gráfico de avance: tocar o enfocar muestra el detalle debajo. */
function mostrarPunto(el) {
  ui.avPt = Number(el.dataset.pt);
  const a = serieAvance(ui.av), estimado = a.pts.length > 0 && (!!LIFT_N[ui.av] || a.pts.length === a.mejores.length), p = (estimado ? a.pts : a.mejores)[ui.avPt], tip = $("#av-tip");
  if (p && tip) tip.textContent = tipAvance(p, estimado);
}
document.addEventListener("click", e => { const h = e.target.closest && e.target.closest(".hit"); if (h) mostrarPunto(h); });
document.addEventListener("click", e => { if (visor && LIBRO && e.target.closest && e.target.closest(".visor-pag canvas")) zoomVisor(e); });
document.addEventListener("focusin", e => { if (e.target.classList && e.target.classList.contains("hit")) mostrarPunto(e.target); });
document.addEventListener("change", e => {
  const t = e.target;
  if (t.id === "libro-file") { const f = t.files && t.files[0]; t.value = ""; if (f) importarLibro(f); return; }
  if (t.id === "cat-file") { const f = t.files && t.files[0]; t.value = ""; if (f) importarCatalogo(f); return; }
  if ("avSel" in t.dataset) { ui.av = t.value; ui.avPt = null; renderAno(); return; }
  if (t.dataset.meta || t.dataset.metamed) { cambiarMeta(t.dataset.meta || t.dataset.metamed, t.value); renderAno(); return; }
  // anotaste las reps de una serie de esta semana: empieza el descanso de ese ejercicio
  if (sheet && sheet.tipo === "reg" && t.dataset.f === "reps" && t.value.trim() && sheet.w === st.actual) {
    iniciarDescanso(segundosDescanso(descanso(sheet.it)), nombrePlan(sheet.it));
  }
  if (sheet && "hecho" in t.dataset) {
    sheet.hid = t.value;
    renderSheet();
    if (t.value === "otro") { const o = $("[data-otro]"); if (o) o.focus(); }
    return;
  }
  if (t.dataset.temaClaro !== undefined) { tema.claro = t.value; guardarTema(); return; }
  if (t.dataset.temaOscuro !== undefined) { tema.oscuro = t.value; guardarTema(); return; }
  if (t.dataset.rm) {
    const i = Number(t.dataset.rm); st.rm[i] = st.rm[i] || {};
    st.rm[i][t.dataset.lift] = t.value.trim().replace(",", ".");
    dirty.estado = marca(); pedirGuardado(300); renderAno(); return;
  }
  if (t.dataset.jalon) { st.jalon = t.value.trim().replace(",", "."); dirty.estado = marca(); pedirGuardado(300); return; }
  if ("ck" in t.dataset) actualizarChecklist();
  else if (t.id === "c-rpe") actualizarCalc();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && visor) { cerrarVisor(); return; }
  if (e.key === "Escape" && sheet) { cerrarSheet(); return; }
  // en Hoy, Enter en los kilos pasa a las reps; Enter en las reps guarda la serie
  const t = e.target;
  if (e.key === "Enter" && t.dataset && t.dataset.ed && edit && !sheet) {
    e.preventDefault();
    if (t.dataset.ed === "kg") { const r = $('#v-hoy [data-ed="reps"]'); if (r) r.focus(); }
    else guardarSerie();
  }
});
window.addEventListener("online", () => enCola(flush));
// Con la app abierta, cada 90 s revisa si hay registros nuevos o comentarios de Claude.
setInterval(() => {
  if (document.visibilityState !== "visible" || !conectado() || sheet || editando() || !navigator.onLine) return;
  [...new Set([ui.week, st.actual])].forEach(w => cargarSemana(w, true));
}, 90000);
function alSalir() {
  saveStore(); guardarBorrador();
  if (conectado() && pendientes() && navigator.onLine) enCola(flush);
}
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return alSalir();
  tickDescanso();
  pantalla();  // el teléfono suelta el bloqueo al salir; se pide de nuevo al volver
  if (conectado() && !sheet) enCola(pull);
});
window.addEventListener("pagehide", alSalir);
window.addEventListener("popstate", () => { if (visor) cerrarVisor(true); else if (sheet) cerrarSheet(true); else if (ui.cat.prog) cerrarFicha(); });

/* ── inicio ── */
(async function inicio() {
  aplicarTema();
  leerInvitacion();  // enlace de invitación: trae tu usuario y su repositorio, nunca la clave
  readStore();
  try {
    const r = await fetch(esTuyo() ? "data/plan.json" : "data/plan-base.json", {cache: "no-cache"});
    DATA = await r.json();
  } catch (e) {
    $("#v-hoy").innerHTML = `<div class="titulo"><h1>No pude cargar el plan</h1><p class="sub">Abre la app con señal una vez para guardarla en el teléfono.</p></div>`;
    return;
  }
  BASE = DATA.semanas; G = DATA.grupos; P64 = DATA.p64;
  aplicarPlan();  // con un programa del catálogo, sus semanas desde la que elegiste
  ui.week = Math.max(1, Math.min(52, ui.week || st.actual));
  if (ui.week === st.actual) autoDia();
  const conHoja = restaurarBorrador();
  render();
  if (conHoja) { marcarHoja(); renderSheet(true); toast("Recuperé lo que estabas anotando."); }
  else if (edit && edit.tocado) toast("Recuperé la serie que estabas anotando.");
  if (descansoT) tickDescanso();
  setSync(conectado() ? (navigator.onLine ? "saving" : "offline") : "local", conectado() ? "" : "Guardado solo en este teléfono");
  if (conectado()) enCola(pull);
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
})();
