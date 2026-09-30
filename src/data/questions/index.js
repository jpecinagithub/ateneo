// ATENEO — categorías, niveles, montaje del mazo y validación del banco
import { art } from "./art";
import { history } from "./history";
import { philosophy } from "./philosophy";
import { chemistry } from "./chemistry";
import { maths } from "./maths";
import { INTERMEDIO } from "./intermedio/index";

export const CATEGORIES = {
  Arte:        { label: "Arte",        color: "#d08a94", soft: "rgba(208,138,148,0.14)" },
  Historia:    { label: "Historia",    color: "#7fb894", soft: "rgba(127,184,148,0.14)" },
  Filosofía:   { label: "Filosofía",   color: "#a793d6", soft: "rgba(167,147,214,0.14)" },
  Química:     { label: "Química",     color: "#6fb3c4", soft: "rgba(111,179,196,0.14)" },
  Matemáticas: { label: "Matemáticas", color: "#d6a06a", soft: "rgba(214,160,106,0.14)" },
};

export const LEVELS = {
  media: { label: "Intermedio", tagline: "Un reto serio, sin agobios" },
  alta:  { label: "Avanzado",   tagline: "La prueba definitiva" },
};

export const ADVANCED = [...art, ...history, ...philosophy, ...chemistry, ...maths];
export { INTERMEDIO };
export const ALL_QUESTIONS = [...ADVANCED, ...INTERMEDIO];

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Devuelve una instancia de pregunta con las opciones barajadas y answer remapeado. */
export function instantiate(q) {
  const order = shuffle([0, 1, 2, 3]);
  return {
    ...q,
    options: order.map((i) => q.options[i]),
    answer: order.indexOf(q.answer),
  };
}

/**
 * level: "media" (intermedio) | "alta" (avanzado)
 * mode: "express" (10 aleatorias) | "classic" (25 aleatorias)
 */
export function buildDeck(mode, level = "media") {
  const pool = level === "alta" ? ADVANCED : INTERMEDIO;
  const deck = shuffle(pool).slice(0, mode === "express" ? 10 : 25);
  return deck.map(instantiate);
}

/** Validación estricta del banco: 200 preguntas, 4 opciones, una única respuesta válida. */
export function validateBank() {
  const errors = [];
  if (ALL_QUESTIONS.length !== 200) errors.push(`Total: ${ALL_QUESTIONS.length}, esperado 200`);
  const counts = {};
  const ids = new Set();
  ALL_QUESTIONS.forEach((q, i) => {
    const tag = q.id || `#${i}`;
    if (!q.id) errors.push(`${tag}: sin id`);
    if (ids.has(q.id)) errors.push(`${tag}: id duplicado`);
    ids.add(q.id);
    counts[q.category] = (counts[q.category] || 0) + 1;
    counts[q.difficulty] = (counts[q.difficulty] || 0) + 1;
    if (q.difficulty !== "alta" && q.difficulty !== "media")
      errors.push(`${tag}: difficulty inválido (${q.difficulty})`);
    if (!Array.isArray(q.options) || q.options.length !== 4)
      errors.push(`${tag}: options.length = ${q.options?.length}, esperado 4`);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3)
      errors.push(`${tag}: answer inválido (${q.answer})`);
    if (new Set(q.options).size !== 4) errors.push(`${tag}: opciones duplicadas`);
    if (!q.question || !q.explanation) errors.push(`${tag}: falta question/explanation`);
    if (q.audio && typeof q.audio !== "string") errors.push(`${tag}: audio inválido`);
  });
  const expected = { Arte: 50, Historia: 50, Filosofía: 40, Química: 30, Matemáticas: 30 };
  for (const [cat, n] of Object.entries(expected)) {
    if (counts[cat] !== n) errors.push(`Categoría ${cat}: ${counts[cat] || 0}, esperado ${n}`);
  }
  if (counts["media"] !== 100) errors.push(`Nivel media: ${counts["media"] || 0}, esperado 100`);
  if (counts["alta"] !== 100) errors.push(`Nivel alta: ${counts["alta"] || 0}, esperado 100`);
  const pos = [0, 0, 0, 0];
  // El reparto se comprueba sobre preguntas instanciadas (opciones barajadas),
  // que es lo que realmente ve el jugador en cada partida.
  ALL_QUESTIONS.map(instantiate).forEach((q) => { pos[q.answer] += 1; });
  pos.forEach((n, i) => {
    if (n < 30 || n > 70) errors.push(`Posición correcta ${i} tras barajar: ${n} (esperado 30-70)`);
  });
  return { ok: errors.length === 0, errors, counts, positions: pos };
}
