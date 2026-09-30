import { useState } from "react";
import { bestScore } from "../lib/storage";
import { LEVELS } from "../data/questions";
import { audio } from "../lib/audio";

export default function Home({ onStart, onShowRanking, onShowHowTo }) {
  const [level, setLevel] = useState("media");
  const [mode, setMode] = useState("quick");
  const bestMedia = bestScore("media");
  const bestAlta = bestScore("alta");

  const start = () => {
    audio.ensure();
    onStart(mode, level);
  };

  const pickLevel = (l) => { setLevel(l); audio.sfxClick(); };
  const pickMode = (m) => { setMode(m); audio.sfxClick(); };

  return (
    <div className="card">
      <div className="hero">
        <div className="monogram" aria-hidden="true">A</div>
        <p className="eyebrow">Trivial de cultura general</p>
        <h1 className="title">ATENEO</h1>
        <p className="lead muted">
          Preguntas de arte, historia universal, filosofía, química y matemáticas.
          Diez segundos por pregunta, sin red: solo usted y su memoria.
        </p>
      </div>

      <p className="pick-label" id="lbl-level">Nivel de dificultad</p>
      <div className="pick-grid" role="radiogroup" aria-labelledby="lbl-level">
        {Object.entries(LEVELS).map(([key, lv]) => {
          const best = key === "media" ? bestMedia : bestAlta;
          return (
            <button
              key={key}
              className={"pick-card" + (level === key ? " selected" : "")}
              role="radio" aria-checked={level === key}
              onClick={() => pickLevel(key)}
            >
              <span className="tick" aria-hidden="true">✓</span>
              <h3>{lv.label}</h3>
              <p>{lv.tagline}. 100 preguntas de cultura general.</p>
              {best > 0 && (
                <span className="best">★ Mejor marca: {best.toLocaleString("es-ES")}</span>
              )}
            </button>
          );
        })}
      </div>

      <p className="pick-label" id="lbl-mode">Modo de partida</p>
      <div className="pick-grid" role="radiogroup" aria-labelledby="lbl-mode">
        <button
          className={"pick-card" + (mode === "full" ? " selected" : "")}
          role="radio" aria-checked={mode === "full"}
          onClick={() => pickMode("full")}
        >
          <span className="tick" aria-hidden="true">✓</span>
          <h3>Partida completa</h3>
          <p>Las 100 preguntas del nivel, en orden aleatorio. La prueba definitiva.</p>
        </button>
        <button
          className={"pick-card" + (mode === "quick" ? " selected" : "")}
          role="radio" aria-checked={mode === "quick"}
          onClick={() => pickMode("quick")}
        >
          <span className="tick" aria-hidden="true">✓</span>
          <h3>Partida rápida</h3>
          <p>20 preguntas al azar. Perfecta para un café.</p>
        </button>
      </div>

      <div className="btn-row" style={{ justifyContent: "center" }}>
        <button className="btn btn-primary" onClick={start} autoFocus>
          Comenzar la partida
        </button>
      </div>
      <div className="btn-row" style={{ justifyContent: "center" }}>
        <button className="btn btn-ghost" onClick={onShowHowTo}>Cómo se juega</button>
        <button className="btn btn-ghost" onClick={onShowRanking}>Salón de la fama</button>
      </div>
    </div>
  );
}
