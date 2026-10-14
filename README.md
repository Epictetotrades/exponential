# Exponential

App de entrenamiento para Android (PWA): plan de 52 semanas y registro de entrenos.

- **Abrir:** https://epictetotrades.github.io/exponential/ → en Chrome, menú ⋮ → «Instalar app».
- **Datos:** cada registro se guarda en el teléfono y se sube al repositorio privado `exponential-datos`
  (`estado.json`, `prog.json`, `semanas/wNN.json`). Sin señal, se sube al volver.
- **Plan:** `data/plan.json`. S1–S10 salen de `tools/gen_s1_s10.py` (Pirámide de Helms, 2.ª ed.:
  p.104–105, p.132, p.136), que imprime las comprobaciones contra la tabla de p.64.
- **Iconos:** `tools/gen_iconos.py`.

Sin dependencias ni compilación: HTML, CSS y JavaScript.
