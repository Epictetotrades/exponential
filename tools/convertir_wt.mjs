// Convierte una exportación de Workout Tracker al historial previo de Exponential (solo historial por movimiento).
// Uso: node convertir_wt.mjs <workout_data.json> <salida.json>
import fs from "fs";
const [, , ENTRADA, SALIDA] = process.argv;
const d = JSON.parse(fs.readFileSync(ENTRADA, "utf8"));
const slug = t => String(t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

// nombre en Workout Tracker → [id en Exponential, nombre]. Solo se juntan con tu plan los de peso libre (barra y mancuernas):
// en máquinas y poleas los kilos dependen del gimnasio y no se comparan.
const M = {
  "Barbell Bench Press": ["banca", "Press de banca"],
  "Incline Dumbbell Press": ["inclinado", "Press inclinado con mancuernas"],
  "Pec Deck Machine": [null, "Pec deck"],
  "Face Pulls": [null, "Face pull en polea"],
  "Reverse Pec Deck": [null, "Pec deck invertido"],
  "Reverse Peck Deck": [null, "Pec deck invertido"],
  "Barbell Rows": ["remo", "Remo con barra"],
  "Cable Rows": [null, "Remo en polea sentado"],
  "Machine Curls": [null, "Curl de bíceps en máquina"],
  "Chest Press Machine": [null, "Press de pecho en máquina"],
  "Cable Lateral Raises": [null, "Elevación lateral en polea baja"],
  "Tricep Pushdowns": [null, "Tríceps en polea"],
  "Cable Pushdowns": [null, "Tríceps en polea"],
  "Barbell Overhead Press": [null, "Press militar con barra"],
  "Cable Chest Flyes": [null, "Aperturas en polea"],
  "Reverse-Grip Pushdowns": [null, "Tríceps en polea agarre invertido"],
  "Dumbbell Bench Press": [null, "Press de banca con mancuernas"],
  "Seated Dumbbell Press": [null, "Press de hombro sentado con mancuernas"],
  "Tricep Kickbacks": [null, "Patada de tríceps"],
  "Wide Close Grip Pull Down": [null, "Jalón agarre ancho y cerrado"],
  "Wide-Grip Lat Pulldown": [null, "Jalón agarre ancho"],
  "Narrow Grip Pull Down": [null, "Jalón agarre estrecho"],
  "Pendlay Rows": [null, "Remo Pendlay"],
  "Incline Dumbbell Curls": [null, "Curl inclinado con mancuernas"],
  "Dumbbell Curls": [null, "Curl con mancuernas"],
  "Concentration Curls": [null, "Curl concentrado"],
  "Dips (Chest focus)": [null, "Fondos en paralelas (pecho)"],
  "Lat Pulldown": [null, "Jalón al pecho"],
  "Pull-Ups": [null, "Dominadas"],
  "One Arm Machine Curl Biceps": [null, "Curl en máquina a una mano"],
  "Forearm Behind Shrugs": [null, "Encogimientos detrás de la espalda"],
  "Front Raises": [null, "Elevaciones frontales"],
  "One Arm Tricep Supine Pressdown": [null, "Tríceps en polea a una mano, supino"],
  "T-Bar Rows": [null, "Remo en T"],
  "Close Grip Lats Pull-down": [null, "Jalón agarre cerrado"],
  "Straight Bar Cable Rows": [null, "Remo en polea con barra recta"],
  "Forearm Shrugs": [null, "Encogimientos de antebrazo"],
  "Dumbell Pronate Curls": [null, "Curl prono con mancuernas"],
};
const num = x => { const v = parseFloat(String(x ?? "").replace(",", ".")); return isFinite(v) ? v : null; };
const out = [], sinTraducir = new Set();
let descartadas = 0;
for (const [fecha, lista] of Object.entries(d.sessions || {}).sort()) {
  for (const x of lista || []) {
    const orig = String(x.exercise || "").trim(); if (!orig) continue;
    const m = M[orig]; if (!m) sinTraducir.add(orig);
    const n = m ? m[1] : orig, id = m && m[0] ? m[0] : "otro:" + slug(n);
    const sets = [];
    (x.weights || []).forEach((w, i) => {
      const kg = num(w), reps = num((x.actual_reps || [])[i]), rir = num((x.rir || [])[i]);
      if (kg == null || !reps) { descartadas++; return; }  // sin reps anotadas no es una serie real
      sets.push(Object.assign({kg, reps}, rir != null ? {rpe: Math.max(5, Math.min(10, 10 - rir))} : {}));
    });
    if (sets.length) out.push({fecha, id, n, wt: orig, sets});
  }
}
fs.writeFileSync(SALIDA, JSON.stringify({origen: "Workout Tracker (exportación)", nota: "Solo historial por movimiento: no son semanas de Exponential.", e: out, v: 1}, null, 1));
console.log(`${out.length} registros de ${new Set(out.map(x => x.fecha)).size} sesiones (${out[0]?.fecha} → ${out.at(-1)?.fecha}); series sin reps descartadas: ${descartadas}`);
if (sinTraducir.size) console.log("SIN TRADUCIR:", [...sinTraducir].join(" | "));
