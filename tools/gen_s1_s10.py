"""Genera S1–S10 con la Pirámide (Helms, 2.ª ed.) y escribe app/data/plan.json.

Estructura (10 semanas, antes de la intensidad de S11):
  S1      intro: ¾ de las series y RPE un punto menos (p.104–105)
  S2–S4   volumen: la carga sube y las reps bajan cada semana (p.132, tablas p.268–270)
  S5      descarga entre volumen e intensidad (p.105, p.132, p.246)
  S6–S8   intensidad (p.132, p.135, tablas p.270–272)
  S9      taper: ~10 series por músculo, mismas cargas, RPE 7–9 (p.136)
  S10     test: single a RPE 8–9 y AMRAP con 100 kg (p.115, p.118, p.136)

Plantillas: las semanas del ciclo 4 del plan (S45–S51, mismo esquema de p.132) y
el taper y test del ciclo 2 (S30–S31). Imprime las comprobaciones: RPE esperado
según la tabla de p.64 para cada básico y series por músculo (rango 10–20, p.62).

Uso: python gen_s1_s10.py <DATA.json del plan publicado> <salida plan.json>
"""
import copy
import json
import sys

src, dst = sys.argv[1], sys.argv[2]
D = json.load(open(src, encoding="utf8"))
W = {s["w"]: s for s in D["semanas"]}
P64 = D["p64"]
RM = D["rm_inicial"]


def reps_max(pct):
    """Reps posibles a un % del 1RM según p.64 (interpolación; bajo 70 % se extiende la recta)."""
    if pct >= 100:
        return 1
    for (r0, p0), (r1, p1) in zip(P64, P64[1:]):
        if pct >= p1:
            return r0 + (r1 - r0) * (p0 - pct) / (p0 - p1)
    return 11.5 + (70 - pct) / 2.5


def r25(x):
    return round(x / 2.5) * 2.5


def semana(base, w, etiqueta, pos, nota, tipo=None, k=None):
    s = copy.deepcopy(W[base])
    s.update({"w": w, "ciclo": "C1", "etiqueta": etiqueta, "pos": pos, "nota": nota,
              "viejo": False, "fuente": f"plantilla S{base}"})
    if tipo:
        s["tipo"] = tipo
    if k is not None:
        s["k"] = k
    for clave in ("bloque", "macro", "color", "basicos", "nota_libro"):
        s.pop(clave, None)
    return s


def mains(s):
    for d in s["dias"]:
        for it in d["items"]:
            if it["k"] == "main":
                yield d, it


NOTA_VOL = "Bloque de volumen (p.132): cada semana sube la carga y bajan las reps. Sube carga solo cuando salga fácil; nada al fallo en los básicos (p.134)."
nuevas = []

# S1 intro = S45 tal cual (ya es ¾ de las series de S46 con un punto menos de RPE)
nuevas.append(semana(45, 1, "Intro", "", "Semana intro: ¾ de las series y un punto menos de RPE. Entras al volumen sin el dolor muscular que frenaría las semanas siguientes (p.104–105).", tipo="acc", k=0))

# S2 volumen 1: cargas y reps de S45 con las series y el RPE de una semana normal de volumen (S46)
s2 = semana(46, 2, "Volumen", "1 de 3", NOTA_VOL, tipo="acc", k=1)
cargas_s45 = {(d["id"], it["slot"]): (it["pct"], it["reps"]) for d, it in mains(W[45])}
for d, it in mains(s2):
    it["pct"], it["reps"] = cargas_s45[(d["id"], it["slot"])]
nuevas.append(s2)

nuevas.append(semana(46, 3, "Volumen", "2 de 3", NOTA_VOL, tipo="acc", k=2))
nuevas.append(semana(47, 4, "Volumen", "3 de 3", NOTA_VOL, tipo="acc", k=2))
nuevas.append(semana(48, 5, "Descarga", "", W[48]["nota"]))
nuevas.append(semana(49, 6, "Intensidad", "1 de 3", W[49]["nota"]))
nuevas.append(semana(50, 7, "Intensidad", "2 de 3", W[50]["nota"]))
nuevas.append(semana(51, 8, "Intensidad", "3 de 3", W[51]["nota"]))

# S9 taper: estructura de S30 (2 series, RPE 7–8 en accesorios) con las cargas y reps de S8 (= S51)
s9 = semana(30, 9, "Taper", "", "Taper: unas 10 series por músculo, mismas cargas y reps de la última semana y sin llegar al fallo, RPE 7–9 (p.136).")
cargas_s51 = {(d["id"], it["slot"]): (it["pct"], it["reps"]) for d, it in mains(W[51])}
for d, it in mains(s9):
    it["pct"], it["reps"] = cargas_s51[(d["id"], it["slot"])]
nuevas.append(s9)

nuevas.append(semana(31, 10, "Test", "", W[31]["nota"].replace("antes de la semana siguiente", "antes de la S11")))

# ── comprobaciones ──
print("Máximos usados:", RM)
print(f"{'S':>3} {'día':4} {'básico':12} {'series×reps':>11} {'%':>6} {'kg':>7} {'reps máx p.64':>13} {'RPE esp.':>8}  rango plan")
problemas = []
for s in nuevas:
    for d, it in mains(s):
        lift = it["lift"]
        kg = r25(RM[lift] * it["pct"] / 100)
        rm = reps_max(it["pct"])
        rpe = 10 - (rm - it["reps"])
        lo, hi = [float(x) for x in str(it["rpe"]).split("–")]
        ok = lo - 0.5 <= rpe <= hi + 0.5
        if not ok:
            problemas.append(f"S{s['w']} {d['id']} {it['n']}: RPE esperado {rpe:.1f} fuera de {it['rpe']}")
        it["rpe_esp"] = round(rpe * 2) / 2
        print(f"{s['w']:>3} {d['id']:4} {lift[:12]:12} {it['sets']:>5}×{it['reps']:<5} {it['pct']:>6} {kg:>7} {rm:>13.1f} {rpe:>8.1f}  {it['rpe']}{'' if ok else '  ⚠'}")

print("\nSeries por músculo (rango 10–20, p.62; intro, descarga, taper y test van bajo a propósito):")
grupos = [g["id"] for g in D["grupos"]]
print("S".rjust(3), *[g[:6].rjust(7) for g in grupos])
for s in nuevas:
    fila = [f"{s['vol'][g]:>7}" for g in grupos]
    print(f"{s['w']:>3}", *fila, " ", s["etiqueta"], s.get("pos", ""))

if problemas:
    print("\nREVISAR:")
    print("\n".join(problemas))

out = copy.deepcopy(D)
out["semanas"] = nuevas + [s for s in D["semanas"] if s["w"] > 10]
assert [s["w"] for s in out["semanas"]] == list(range(1, 53))
json.dump(out, open(dst, "w", encoding="utf8"), ensure_ascii=False, separators=(",", ":"))
print(f"\nEscrito {dst}: {len(out['semanas'])} semanas")
