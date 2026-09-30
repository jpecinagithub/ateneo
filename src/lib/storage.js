/* ATENEO — ranking en localStorage (con nivel de dificultad por marca) */

const KEY = "ateneo_ranking";
const MAX = 10;

/** Las marcas antiguas (sin nivel) se consideran del nivel avanzado. */
export function normalizeLevel(level) {
  return level === "media" ? "media" : "alta";
}

export function loadRanking() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return [];
    return arr.map((r) => ({ ...r, level: normalizeLevel(r.level) }));
  } catch {
    return [];
  }
}

export function qualifies(score) {
  if (score <= 0) return false;
  const r = loadRanking();
  return r.length < MAX || score > r[r.length - 1].score;
}

export function saveScore(entry) {
  const r = loadRanking();
  r.push({
    nickname: String(entry.nickname).slice(0, 16),
    score: entry.score,
    correct: entry.correct,
    total: entry.total,
    mode: entry.mode,
    level: normalizeLevel(entry.level),
    date: new Date().toISOString(),
  });
  r.sort((a, b) => b.score - a.score);
  const top = r.slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(top));
  } catch {}
  return top;
}

/** Mejor marca de un nivel ("media" | "alta"). */
export function bestScore(level) {
  const r = loadRanking().filter((e) => normalizeLevel(e.level) === normalizeLevel(level));
  return r.length ? r[0].score : 0;
}

export function clearRanking() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
