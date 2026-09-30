import { useCallback, useEffect, useRef, useState } from "react";
import { CATEGORIES } from "../data/questions";
import { IMAGES } from "../data/images";
import { audio } from "../lib/audio";

const QUESTION_TIME = 10;
const FEEDBACK_MS = 3000;

function TimerRing({ seconds }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const frac = Math.max(0, seconds / QUESTION_TIME);
  const urgent = seconds <= 3.05;
  return (
    <div className={"timer-wrap" + (urgent ? " urgent" : "")} role="timer" aria-label={`${Math.ceil(seconds)} segundos restantes`}>
      <svg className="timer-ring" width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
        <circle className="bg" cx="32" cy="32" r={r} fill="none" strokeWidth="7" />
        <circle
          className="fg" cx="32" cy="32" r={r} fill="none" strokeWidth="7"
          strokeLinecap="round" strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
        />
      </svg>
      <span className="timer-num">{Math.ceil(seconds)}</span>
    </div>
  );
}

export default function Quiz({ deck, onFinish, onQuit }) {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("answering"); // answering | feedback
  const [picked, setPicked] = useState(null);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [lastPoints, setLastPoints] = useState(null);
  const [imgOk, setImgOk] = useState(true);

  const resultsRef = useRef([]);
  const streakRef = useRef(0);
  const scoreRef = useRef(0);
  const phaseRef = useRef("answering");
  const timeRef = useRef(QUESTION_TIME);
  const lastTickRef = useRef(99);
  const activeRef = useRef(true);
  useEffect(() => () => { activeRef.current = false; }, []);

  const q = deck[idx];
  const cat = CATEGORIES[q.category];

  const advance = useCallback(() => {
    if (!activeRef.current) return;
    if (idx + 1 >= deck.length) {
      onFinish(resultsRef.current);
    } else {
      setImgOk(true);
      setLastPoints(null);
      setIdx((i) => i + 1);
    }
  }, [idx, deck.length, onFinish]);

  const resolve = useCallback((choice) => {
    if (phaseRef.current !== "answering") return;
    phaseRef.current = "feedback";
    setPhase("feedback");
    setPicked(choice);
    const correct = choice !== null && choice === q.answer;
    let points = 0;
    if (correct) {
      const speedBonus = Math.round((timeRef.current / QUESTION_TIME) * 100);
      streakRef.current += 1;
      const streakBonus = Math.min(25 * streakRef.current, 250);
      points = 100 + speedBonus + streakBonus;
      scoreRef.current += points;
      audio.sfxCorrect();
    } else {
      streakRef.current = 0;
      audio.sfxWrong();
    }
    setStreak(streakRef.current);
    setScore(scoreRef.current);
    setLastPoints({ correct, points });
    resultsRef.current.push({
      q, picked: choice, correct, points, timeLeft: +timeRef.current.toFixed(1),
    });
    setTimeout(advance, FEEDBACK_MS);
  }, [q, advance]);

  // temporizador por pregunta
  useEffect(() => {
    timeRef.current = QUESTION_TIME;
    lastTickRef.current = 99;
    phaseRef.current = "answering";
    setTimeLeft(QUESTION_TIME);
    setPhase("answering");
    setPicked(null);
    if (q.audio) {
      const t = setTimeout(() => audio.playMelody(q.audio), 400);
      return () => clearTimeout(t);
    }
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const id = setInterval(() => {
      if (phaseRef.current !== "answering") return;
      timeRef.current = Math.max(0, +(timeRef.current - 0.1).toFixed(2));
      setTimeLeft(timeRef.current);
      const whole = Math.ceil(timeRef.current);
      if (whole <= 3 && whole >= 1 && whole !== lastTickRef.current) {
        lastTickRef.current = whole;
        audio.sfxTick();
      }
      if (timeRef.current <= 0) resolve(null);
    }, 100);
    return () => clearInterval(id);
  }, [resolve]);

  // teclas 1-4
  useEffect(() => {
    const onKey = (e) => {
      if (["1", "2", "3", "4"].includes(e.key)) resolve(Number(e.key) - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resolve]);

  const imgUrl = q.imageKey ? IMAGES[q.imageKey] : null;

  return (
    <div className={`card quiz-card${q.question.length > 90 ? " q-long" : ""}`}>
      <div className="quiz-meta">
        <span className="badge" style={{ background: cat.color }}>{cat.label}</span>
        <span className="q-counter">Pregunta {idx + 1} de {deck.length}</span>
        <span className="score-line">Puntos: {score.toLocaleString("es-ES")}</span>
        {streak >= 2 && <span className="streak">🔥 Racha ×{streak}</span>}
        <TimerRing seconds={timeLeft} />
      </div>

      <h2 className="q-text">{q.question}</h2>

      {imgUrl && imgOk && (
        <div className="q-image-wrap">
          <img
            className="q-image"
            src={imgUrl}
            alt=""
            loading="lazy"
            onError={() => setImgOk(false)}
          />
          <p className="q-image-cap">Imagen: Wikimedia Commons</p>
        </div>
      )}

      {q.audio && (
        <div className="audio-box">
          <span className="note" aria-hidden="true">🎼</span>
          <p>Escuche con atención…</p>
          <button
            className="icon-btn"
            style={{ marginLeft: "auto" }}
            onClick={() => { audio.sfxClick(); audio.playMelody(q.audio); }}
          >
            ↻ Repetir melodía
          </button>
        </div>
      )}

      <div className="quiz-body">
        <div className="options" role="group" aria-label="Opciones de respuesta">
          {q.options.map((opt, i) => {
            let cls = "option";
            if (phase === "feedback") {
              if (i === q.answer) cls += " is-correct";
              else if (i === picked) cls += " is-wrong";
              else cls += " dim";
            }
            return (
              <button
                key={i}
                className={cls}
                disabled={phase !== "answering"}
                onClick={() => resolve(i)}
                aria-label={`Opción ${i + 1}: ${opt}`}
              >
                <span className="key" aria-hidden="true">{i + 1}</span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {phase === "feedback" && lastPoints && (
          <div className={"feedback " + (lastPoints.correct ? "ok" : "ko")} aria-live="polite">
            <span className="verdict">
              {picked === null
                ? "⏱ Tiempo agotado"
                : lastPoints.correct
                  ? "✓ Correcto"
                  : "✗ Incorrecto"}
              {lastPoints.correct && (
                <span className="points-pop">+{lastPoints.points}</span>
              )}
            </span>
            {q.explanation}
          </div>
        )}
      </div>

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={() => { audio.sfxClick(); onQuit(); }}>
          Abandonar
        </button>
      </div>
    </div>
  );
}
