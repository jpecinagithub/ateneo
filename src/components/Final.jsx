import { useMemo, useState } from "react";
import { CATEGORIES } from "../data/questions";
import { qualifies, saveScore } from "../lib/storage";
import { audio } from "../lib/audio";

export default function Final({ results, mode, onSaved, onReview, onReplay, onHome }) {
  const [nickname, setNickname] = useState("");
  const [saved, setSaved] = useState(false);

  const stats = useMemo(() => {
    const total = results.length;
    const correct = results.filter((r) => r.correct).length;
    const score = results.reduce((s, r) => s + r.points, 0);
    const best = results.reduce((m, r) => Math.max(m, r.points), 0);
    const byCat = {};
    for (const r of results) {
      const c = r.q.category;
      byCat[c] = byCat[c] || { total: 0, correct: 0 };
      byCat[c].total += 1;
      if (r.correct) byCat[c].correct += 1;
    }
    return { total, correct, score, best, byCat, pct: total ? Math.round((correct / total) * 100) : 0 };
  }, [results]);

  const canSave = !saved && qualifies(stats.score);

  const doSave = () => {
    const name = nickname.trim().slice(0, 16) || "Anónimo";
    saveScore({ nickname: name, score: stats.score, correct: stats.correct, total: stats.total, mode });
    audio.sfxCorrect();
    setSaved(true);
    onSaved();
  };

  return (
    <div className="card">
      <p className="eyebrow">Partida terminada</p>
      <h1 className="title">Su veredicto</h1>

      <p className="final-score">
        {stats.score.toLocaleString("es-ES")} <small>puntos</small>
      </p>

      <div className="stat-grid">
        <div className="stat">
          <div className="v">{stats.correct}/{stats.total}</div>
          <div className="l">aciertos</div>
        </div>
        <div className="stat">
          <div className="v">{stats.pct} %</div>
          <div className="l">de acierto</div>
        </div>
        <div className="stat">
          <div className="v">+{stats.best}</div>
          <div className="l">mejor jugada</div>
        </div>
      </div>

      <h2 className="serif" style={{ color: "var(--ink)", fontSize: "1.4rem" }}>Por categorías</h2>
      <div className="cat-stats">
        {Object.keys(CATEGORIES).map((c) => {
          const s = stats.byCat[c];
          if (!s) return null;
          const pct = Math.round((s.correct / s.total) * 100);
          return (
            <div className="cat-row" key={c}>
              <span className="name" style={{ color: CATEGORIES[c].color }}>{c}</span>
              <span className="bar"><i style={{ width: pct + "%", background: CATEGORIES[c].color }} /></span>
              <span className="pct">{s.correct}/{s.total}</span>
            </div>
          );
        })}
      </div>

      {canSave ? (
        <div>
          <p className="lead" style={{ fontSize: "1.05rem" }}>
            ¡Su marca entra en el <b>Salón de la fama</b>! Escriba su apodo para grabarla:
          </p>
          <div className="nick-row">
            <input
              className="nick-input"
              value={nickname}
              maxLength={16}
              placeholder="Su apodo (máx. 16 caracteres)"
              aria-label="Apodo para el ranking"
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") doSave(); }}
              autoFocus
            />
            <button className="btn btn-gold" onClick={doSave}>Guardar marca</button>
          </div>
        </div>
      ) : saved ? (
        <p className="lead" style={{ fontSize: "1.05rem" }}>✓ Marca guardada en el Salón de la fama.</p>
      ) : (
        <p className="lead muted" style={{ fontSize: "1.05rem" }}>
          Esta marca no alcanza el top 10 del Salón de la fama. ¡La próxima será mejor!
        </p>
      )}

      <div className="btn-row">
        {saved && <button className="btn btn-primary" onClick={onSaved}>Ver el ranking</button>}
        <button className="btn btn-ghost" onClick={onReview}>Repasar respuestas</button>
        <button className="btn btn-ghost" onClick={onReplay}>Jugar de nuevo</button>
        <button className="btn btn-ghost" onClick={onHome}>Inicio</button>
      </div>
    </div>
  );
}
