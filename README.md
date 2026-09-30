# ATENEO — Trivial de cultura general

Web app de trivial con **200 preguntas de cultura general en español** en dos
niveles de dificultad, sin backend. Stack: **Vite + React** (JavaScript). El
ranking se guarda en `localStorage`.

## Contenido

- **200 preguntas** en dos niveles:
  - **Intermedio** (100) — Arte (25), Historia universal (25), Filosofía (20),
    Química (15) y Matemáticas (15). Para mentes cultas: un reto serio sin
    agobios. Campo `difficulty: "media"`.
  - **Avanzado** (100) — mismo reparto, nivel exigente. Campo
    `difficulty: "alta"`.
- Cada pregunta tiene 4 opciones, una sola correcta y explicación didáctica.
- **~68 preguntas con imagen** de Wikimedia Commons (todas verificadas con
  HTTP 200; `onError` las oculta si alguna falla).
- **13 preguntas musicales**: motivos famosos de dominio público sintetizados
  con Web Audio API (Beethoven, Mozart, Vivaldi, Bach, Chopin, Rossini, Grieg).
- **Efectos de sonido** (acierto, fallo, tic-tac, fanfarria) y **música ambiental
  generativa** (pad de acordes), con botón de silencio persistente.

## Juego

- Selector de **nivel** (Intermedio / Avanzado) con la mejor marca de cada uno,
  y modos **partida completa** (100 preguntas) y **partida rápida** (20 al azar).
- **10 segundos por pregunta** con anillo de cuenta atrás (rojo y pulsante en
  los últimos 3 s). Teclas 1–4 para responder.
- Puntuación: 100 base + bonus de velocidad (hasta 100) + racha (25 × racha,
  tope 250).
- Al final: estadísticas por categoría, guardado de marca con apodo (top 10 en
  `localStorage`, clave `ateneo_ranking`, con etiqueta de nivel), repaso
  completo con explicaciones. Las marcas antiguas sin nivel se muestran como
  «Avanzado».

## Diseño

Estética moderna, elegante y sobria: tema oscuro de tinta/carbón con un único
acento (dorado champagne apagado), tipografía **Manrope** autoalojada
(`public/fonts`, sin dependencias externas), tarjetas limpias con aire,
micro-animaciones sutiles y `prefers-reduced-motion` respetado. Base de 19 px
para una lectura cómoda.

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
  App.jsx                  # máquina de pantallas (nivel + modo)
  components/              # Home, Quiz, Final, Ranking, Review, HowTo
  data/
    questions/             # art.js, history.js, philosophy.js, chemistry.js, maths.js (avanzado)
    questions/intermedio/  # iart.js… imaths.js (intermedio) + index.js
    questions/index.js     # niveles, buildDeck(mode, level), validateBank()
    images.js              # URLs de Wikimedia Commons verificadas
  lib/
    audio.js               # Web Audio: SFX, ambiente generativo, melodías
    storage.js             # ranking en localStorage (con nivel por marca)
verification/              # capturas de la verificación headless
```

La validación del banco (`validateBank`) se ejecuta en modo dev y comprueba:
200 preguntas, 4 opciones cada una, un único `answer` válido (0–3), sin
duplicados, reparto por categorías y nivel, y `difficulty` en
`{"media","alta"}`. Además las opciones se **barajan en cada partida**, así que
la posición de la respuesta correcta queda uniformemente distribuida.
