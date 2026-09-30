/* ATENEO — ranking en localStorage */

const KEY = "ateneo_ranking";
const MAX = 10;

export function loadRanking() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
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
    date: new Date().toISOString(),
  });
  r.sort((a, b) => b.score - a.score);
  const top = r.slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(top));
  } catch {}
  return top;
}

export function bestScore() {
  const r = loadRanking();
  return r.length ? r[0].score : 0;
}

export function clearRanking() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
