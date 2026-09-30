import { useState } from "react";
import { bestScore } from "../lib/storage";
import { audio } from "../lib/audio";

export default function Home({ onStart, onShowRanking, onShowHowTo }) {
  const [mode, setMode] = useState("full");
  const best = bestScore();

  const start = () => {
    audio.ensure();
    onStart(mode);
  };

  return (
    <div className="card">
      <div className="hero">
        <div className="crest" aria-hidden="true">A</div>
        <p className="eyebrow">Trivial de cultura general</p>
        <h1 className="title">ATENEO</h1>
        <p className="lead">
          Cien preguntas de nivel exigente sobre arte, historia universal,
          filosofía, química y matemáticas. Diez segundos por pregunta,
          sin red: solo usted y su memoria.
        </p>
      </div>

      <div className="mode-grid" role="radiogroup" aria-label="Modo de partida">
        <button
          className={"mode-card" + (mode === "full" ? " selected" : "")}
          role="radio" aria-checked={mode === "full"}
          onClick={() => { setMode("full"); audio.sfxClick(); }}
        >
          <h3>Partida completa</h3>
          <p>Las 100 preguntas del ateneo, en orden aleatorio. La prueba definitiva.</p>
        </button>
        <button
          className={"mode-card" + (mode === "quick" ? " selected" : "")}
          role="radio" aria-checked={mode === "quick"}
          onClick={() => { setMode("quick"); audio.sfxClick(); }}
        >
          <h3>Partida rápida</h3>
          <p>20 preguntas al azar. Perfecta para un café.</p>
        </button>
      </div>

      <div className="btn-row" style={{ justifyContent: "center" }}>
        <button className="btn btn-gold" onClick={start} autoFocus>
          Comenzar la partida
        </button>
      </div>
      <div className="btn-row" style={{ justifyContent: "center" }}>
        <button className="btn btn-ghost" onClick={onShowHowTo}>Cómo se juega</button>
        <button className="btn btn-ghost" onClick={onShowRanking}>Salón de la fama</button>
      </div>

      {best > 0 && (
        <p className="best-line">
          <span className="trophy" aria-hidden="true">🏆</span>
          Su mejor marca: {best.toLocaleString("es-ES")} puntos
        </p>
      )}
    </div>
  );
}
