import { CATEGORIES } from "../data/questions";
import { audio } from "../lib/audio";

export default function Review({ results, onBack }) {
  return (
    <div className="card">
      <p className="eyebrow">Repaso completo</p>
      <h1 className="title">Todas las respuestas</h1>
      <p className="lead muted" style={{ fontSize: "1.05rem" }}>
        {results.filter((r) => r.correct).length} aciertos de {results.length} preguntas.
      </p>

      {results.map((r, i) => {
        const cat = CATEGORIES[r.q.category];
        return (
          <div className="review-item" key={r.q.id + "-" + i}>
            <span className="tag" style={{ background: cat.color }}>
              {cat.label} · {r.correct ? "✓" : r.picked === null ? "⏱" : "✗"}
            </span>
            <p className="rq">{i + 1}. {r.q.question}</p>
            {r.q.options.map((opt, oi) => {
              let cls = "ra";
              if (oi === r.q.answer) cls += " true";
              else if (oi === r.picked) cls += " yours-ko";
              return (
                <p className={cls} key={oi}>
                  {oi === r.q.answer ? "✓ " : oi === r.picked ? "✗ " : "· "}
                  {opt}
                  {oi === r.picked && oi !== r.q.answer ? " (su respuesta)" : ""}
                  {oi === r.q.answer ? " (correcta)" : ""}
                </p>
              );
            })}
            {r.picked === null && <p className="ra yours-ko">⏱ Sin respuesta (tiempo agotado)</p>}
            <p className="expl">{r.q.explanation}</p>
          </div>
        );
      })}

      <div className="btn-row">
        <button className="btn btn-primary" onClick={() => { audio.sfxClick(); onBack(); }}>
          Volver
        </button>
      </div>
    </div>
  );
}
