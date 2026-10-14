"""Corrige registros de S11–S13 que contradicen tu propia nota. La nota manda.

Solo se tocan los casos en que la nota dice el número exacto; los demás quedan como están.
Uso: python corregir_registros_2026-10-14.py <carpeta del repo exponential-datos>
"""
import json
import os
import sys

# Cada registro conserva su hora original («t»): de ella sale el orden real de lo que hiciste
# y, con él, la progresión.
base = sys.argv[1]


def abrir(n):
    p = os.path.join(base, "semanas", f"w{n}.json")
    return p, json.load(open(p, encoding="utf8"))


def guardar(p, d):
    json.dump(d, open(p, "w", encoding="utf8", newline="\n"), ensure_ascii=False, indent=1)


cambios = []

p, d = abrir(11)
e = d["e"]
# «este no lo hice»: queda como no hecho, no como pendiente
e["d1:militar"].update({"omitido": True, "sets": []})
cambios.append("S11 D1 press militar: «No lo hice» (tu nota)")
# «con mancuernas de 7 kg, entre 12 y 15 reps por serie»: las reps estaban vacías; se anota el mínimo que indicas
for s in e["d5:frances"]["sets"]:
    if s.get("reps") is None:
        s["reps"] = 12
cambios.append("S11 D5 press francés: reps vacías → 12, el mínimo de tu nota (12–15)")
guardar(p, d)

p, d = abrir(13)
e = d["e"]
# «Más 1 serie y todas las hice con 54 kg»
e["d2:femoral"]["sets"] = [{"kg": 54, "reps": s["reps"], "rpe": s.get("rpe")} for s in e["d2:femoral"]["sets"]]
e["d2:femoral"]["sets"].append(dict(e["d2:femoral"]["sets"][-1]))
cambios.append("S13 D2 curl femoral: 40 → 54 kg y una serie más (tu nota)")
# «Más una serie con los mismos kilos»
e["d2:gemelo_pie"]["sets"].append(dict(e["d2:gemelo_pie"]["sets"][-1]))
cambios.append("S13 D2 gemelos de pie: una serie más con los mismos kilos (tu nota)")
# «Más 1 serie igual a las anteriores»
e["d5:laterales"]["sets"].append(dict(e["d5:laterales"]["sets"][-1]))
cambios.append("S13 D5 elevaciones laterales: una serie más igual (tu nota)")
# «Hice una más de 12 con 130»
e["d6:prensa"]["sets"].append({"kg": 130, "reps": 12, "rpe": None})
cambios.append("S13 D6 prensa: una serie más, 130 × 12 (tu nota)")
guardar(p, d)

print("\n".join(cambios))
