import { useCallback, useState } from "react";
import Home from "./components/Home";
import Quiz from "./components/Quiz";
import Final from "./components/Final";
import Ranking from "./components/Ranking";
import Review from "./components/Review";
import HowTo from "./components/HowTo";
import { buildDeck, validateBank } from "./data/questions";
import { audio } from "./lib/audio";

// Validación del banco en desarrollo: avisa en consola si algo falla.
if (import.meta.env.DEV) {
  const v = validateBank();
  if (!v.ok) console.error("[ATENEO] Banco inválido:", v.errors);
  else console.info("[ATENEO] Banco OK:", v.counts, "posiciones:", v.positions);
}

export default function App() {
  const [screen, setScreen] = useState("home"); // home|howto|quiz|final|ranking|review
  const [deck, setDeck] = useState([]);
  const [mode, setMode] = useState("quick");
  const [level, setLevel] = useState("media");
  const [results, setResults] = useState([]);
  const [muted, setMuted] = useState(audio.muted);
  const [rankReturn, setRankReturn] = useState("home");
  const [reviewReturn, setReviewReturn] = useState("final");

  const goHome = useCallback(() => { audio.stopAmbient(); setScreen("home"); }, []);

  const startGame = useCallback((m, l) => {
    audio.ensure();
    audio.startAmbient();
    setMode(m);
    setLevel(l);
    setDeck(buildDeck(m, l));
    setResults([]);
    setScreen("quiz");
  }, []);

  const finishGame = useCallback((res) => {
    audio.stopAmbient();
    audio.sfxFanfare();
    setResults(res);
    setScreen("final");
  }, []);

  const quitGame = useCallback(() => {
    audio.stopAmbient();
    setScreen("home");
  }, []);

  const toggleMute = useCallback(() => {
    audio.ensure();
    const next = !muted;
    audio.setMuted(next);
    setMuted(next);
  }, [muted]);

  const showRanking = useCallback((from) => {
    setRankReturn(from || (screen === "final" ? "final" : "home"));
    setScreen("ranking");
  }, [screen]);

  return (
    <>
      <header className="topbar">
        <button className="brand" onClick={goHome} aria-label="ATENEO — ir al inicio">
          ATENEO<span className="dot">·</span><small>CULTURA GENERAL</small>
        </button>
        <div className="top-actions">
          <button
            className="icon-btn"
            onClick={toggleMute}
            aria-pressed={muted}
            aria-label={muted ? "Activar sonido" : "Silenciar sonido"}
            title={muted ? "Activar sonido" : "Silenciar sonido"}
          >
            <span aria-hidden="true">{muted ? "🔕" : "🔔"}</span>
            {muted ? "Silenciado" : "Sonido"}
          </button>
        </div>
      </header>

      <main className="stage">
        {screen === "home" && (
          <Home
            onStart={startGame}
            onShowRanking={() => showRanking("home")}
            onShowHowTo={() => setScreen("howto")}
          />
        )}
        {screen === "howto" && <HowTo onBack={() => setScreen("home")} />}
        {screen === "quiz" && (
          <Quiz deck={deck} onFinish={finishGame} onQuit={quitGame} />
        )}
        {screen === "final" && (
          <Final
            results={results}
            mode={mode}
            level={level}
            onSaved={() => showRanking("final")}
            onReview={() => { setReviewReturn("final"); setScreen("review"); }}
            onReplay={() => startGame(mode, level)}
            onHome={goHome}
          />
        )}
        {screen === "ranking" && (
          <Ranking onBack={() => setScreen(rankReturn)} />
        )}
        {screen === "review" && (
          <Review results={results} onBack={() => setScreen(reviewReturn)} />
        )}
      </main>

      <footer className="foot">
        ATENEO · Trivial de cultura general · Imágenes: Wikimedia Commons · Música sintetizada en su navegador
      </footer>
    </>
  );
}
