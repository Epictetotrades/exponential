"""Dibuja los iconos de la app: una E de trazos de latón sobre grafito.

Uso: python gen_iconos.py <carpeta icons/>
"""
import os
import sys

from PIL import Image, ImageDraw

BG = (17, 18, 20)
BRASS = (185, 162, 122)
IVORY = (236, 234, 229)


def icono(lado, zona):
    """zona: fracción del lado que ocupa el dibujo (0.8 normal, 0.6 para maskable)."""
    esc = 4  # se dibuja grande y se reduce para bordes suaves
    L = lado * esc
    im = Image.new("RGB", (L, L), BG)
    d = ImageDraw.Draw(im)
    caja = L * zona
    x0 = (L - caja) / 2
    y0 = (L - caja) / 2
    t = caja * 0.075            # grosor del trazo
    alto = caja * 0.62
    ancho = caja * 0.42
    ex = x0 + (caja - ancho) / 2 - caja * 0.02
    ey = y0 + (caja - alto) / 2
    # trazo vertical de la E
    d.rectangle([ex, ey, ex + t, ey + alto], fill=BRASS)
    # tres barras: arriba, centro (más corta) y abajo
    d.rectangle([ex, ey, ex + ancho, ey + t], fill=BRASS)
    d.rectangle([ex, ey + alto / 2 - t / 2, ex + ancho * 0.78, ey + alto / 2 + t / 2], fill=BRASS)
    d.rectangle([ex, ey + alto - t, ex + ancho, ey + alto], fill=BRASS)
    # punto marfil: la curva exponencial resumida en un punto que sube
    r = t * 0.75
    cx, cy = ex + ancho + caja * 0.13, ey + caja * 0.02
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=IVORY)
    return im.resize((lado, lado), Image.LANCZOS)


dst = sys.argv[1]
os.makedirs(dst, exist_ok=True)
icono(192, 0.8).save(os.path.join(dst, "icon-192.png"))
icono(512, 0.8).save(os.path.join(dst, "icon-512.png"))
icono(512, 0.62).save(os.path.join(dst, "icon-maskable-512.png"))
print("iconos listos en", dst)
