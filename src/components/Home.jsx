import { useState } from "react";
import { bestScore } from "../lib/storage";
import { LEVELS } from "../data/questions";
import { audio } from "../lib/audio";

export default function Home({ onStart, onShowRanking, onShowHowTo }) {
  const [level, setLevel] = useState("media");
  const [mode, setMode] = useState("express");
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
              <p>{lv.tagline}.</p>
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
          className={"pick-card" + (mode === "classic" ? " selected" : "")}
          role="radio" aria-checked={mode === "classic"}
          onClick={() => pickMode("classic")}
        >
          <span className="tick" aria-hidden="true">✓</span>
          <h3>Partida clásica · 25 preguntas</h3>
          <p>25 preguntas al azar. La partida estándar, redonda y completa.</p>
        </button>
        <button
          className={"pick-card" + (mode === "express" ? " selected" : "")}
          role="radio" aria-checked={mode === "express"}
          onClick={() => pickMode("express")}
        >
          <span className="tick" aria-hidden="true">✓</span>
          <h3>Partida exprés · 10 preguntas</h3>
          <p>Solo 10 preguntas. Perfecta para un café.</p>
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
