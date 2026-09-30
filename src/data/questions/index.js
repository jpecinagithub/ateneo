// ATENEO — categorías, montaje del mazo y validación del banco
import { art } from "./art";
import { history } from "./history";
import { philosophy } from "./philosophy";
import { chemistry } from "./chemistry";
import { maths } from "./maths";

export const CATEGORIES = {
  Arte:        { label: "Arte",        color: "#b03a4b", soft: "#f7e3e6" },
  Historia:    { label: "Historia",    color: "#2e7d5b", soft: "#e0f0e8" },
  Filosofía:   { label: "Filosofía",   color: "#6a4fa3", soft: "#e9e2f7" },
  Química:     { label: "Química",     color: "#0f7b8a", soft: "#ddeff2" },
  Matemáticas: { label: "Matemáticas", color: "#c46a1b", soft: "#fbeadb" },
};

export const ALL_QUESTIONS = [...art, ...history, ...philosophy, ...chemistry, ...maths];

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

/** mode: "full" (100) | "quick" (20 aleatorias) */
export function buildDeck(mode) {
  const pool = mode === "quick" ? shuffle(ALL_QUESTIONS).slice(0, 20) : shuffle(ALL_QUESTIONS);
  return pool.map(instantiate);
}

/** Validación estricta del banco: 100 preguntas, 4 opciones, una única respuesta válida. */
export function validateBank() {
  const errors = [];
  if (ALL_QUESTIONS.length !== 100) errors.push(`Total: ${ALL_QUESTIONS.length}, esperado 100`);
  const counts = {};
  const ids = new Set();
  ALL_QUESTIONS.forEach((q, i) => {
    const tag = q.id || `#${i}`;
    if (!q.id) errors.push(`${tag}: sin id`);
    if (ids.has(q.id)) errors.push(`${tag}: id duplicado`);
    ids.add(q.id);
    counts[q.category] = (counts[q.category] || 0) + 1;
    if (!Array.isArray(q.options) || q.options.length !== 4)
      errors.push(`${tag}: options.length = ${q.options?.length}, esperado 4`);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3)
      errors.push(`${tag}: answer inválido (${q.answer})`);
    if (new Set(q.options).size !== 4) errors.push(`${tag}: opciones duplicadas`);
    if (!q.question || !q.explanation) errors.push(`${tag}: falta question/explanation`);
  });
  const expected = { Arte: 25, Historia: 25, Filosofía: 20, Química: 15, Matemáticas: 15 };
  for (const [cat, n] of Object.entries(expected)) {
    if (counts[cat] !== n) errors.push(`Categoría ${cat}: ${counts[cat] || 0}, esperado ${n}`);
  }
  return { ok: errors.length === 0, errors, counts };
}
