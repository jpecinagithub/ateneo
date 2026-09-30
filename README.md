# ATENEO — Trivial de cultura general

Web app de trivial con **100 preguntas de cultura general en español**, de nivel
exigente, sin backend. Stack: **Vite + React** (JavaScript). El ranking se guarda
en `localStorage`.

## Contenido

- **100 preguntas** — Arte (25), Historia universal (25), Filosofía (20),
  Química (15) y Matemáticas (15). Cada una con 4 opciones, una sola correcta,
  explicación didáctica y nivel de dificultad (1–3).
- **35 preguntas con imagen** de Wikimedia Commons (verificadas con HTTP 200).
- **8 preguntas musicales**: motivos famosos de dominio público sintetizados con
  Web Audio API (Beethoven, Mozart, Vivaldi, Bach, Chopin, Rossini, Grieg).
- **Efectos de sonido** (acierto, fallo, tic-tac, fanfarria) y **música ambiental
  generativa** (pad de acordes), con botón de silencio persistente.

## Juego

- Modos: **partida completa** (100 preguntas) y **partida rápida** (20 al azar).
- **10 segundos por pregunta** con anillo de cuenta atrás (rojo y pulsante en
  los últimos 3 s). Teclas 1–4 para responder.
- Puntuación: 100 base + bonus de velocidad (hasta 100) + racha (25 × racha,
  tope 250).
- Al final: estadísticas por categoría, guardado de marca con apodo (top 10 en
  `localStorage`, clave `ateneo_ranking`), repaso completo con explicaciones.

## Desarrollo

```bash
npm install
npm run dev      # desarrollo
npm run build    # build de producción (dist/)
npm run preview  # servir dist/ en local
```

## Estructura

```
src/
  App.jsx                  # máquina de pantallas
  components/              # Home, Quiz, Final, Ranking, Review, HowTo
  data/
    questions/             # art.js, history.js, philosophy.js, chemistry.js, maths.js, index.js
    images.js              # URLs de Wikimedia Commons verificadas
  lib/
    audio.js               # Web Audio: SFX, ambiente generativo, melodías
    storage.js             # ranking en localStorage
verification/              # capturas de la verificación headless
```

La validación del banco (`validateBank`) se ejecuta en modo dev y comprueba:
100 preguntas, 4 opciones cada una, un único `answer` válido (0–3) y el reparto
por categorías. Además las opciones se **barajan en cada partida**, así que la
posición de la respuesta correcta queda uniformemente distribuida.
