import { useState } from "react";
import { loadRanking, clearRanking } from "../lib/storage";
import { audio } from "../lib/audio";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Ranking({ onBack }) {
  const [rows, setRows] = useState(loadRanking);
  const [confirming, setConfirming] = useState(false);

  const wipe = () => {
    if (!confirming) { setConfirming(true); return; }
    clearRanking();
    setRows([]);
    setConfirming(false);
    audio.sfxClick();
  };

  const fmtDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
    } catch { return ""; }
  };

  return (
    <div className="card">
      <p className="eyebrow">Cuadro de honor</p>
      <h1 className="title">Salón de la fama</h1>
      <p className="lead muted" style={{ fontSize: "1.05rem" }}>
        Las diez mejores marcas, guardadas en este dispositivo.
      </p>

      {rows.length === 0 ? (
        <p className="empty">Aún no hay marcas registradas.<br />Sea usted la primera leyenda del ateneo.</p>
      ) : (
        <>
          <div className="podium">
            {rows.slice(0, 3).map((r, i) => (
              <div className={"place p" + (i + 1)} key={i}>
                <div className="medal" aria-hidden="true">{MEDALS[i]}</div>
                <div className="who">{r.nickname}</div>
                <div className="pts">{r.score.toLocaleString("es-ES")}</div>
                <div className="muted" style={{ fontSize: "0.9rem" }}>
                  {r.correct}/{r.total} · {r.mode === "quick" ? "rápida" : "completa"}
                </div>
              </div>
            ))}
          </div>
          <ol className="rank-list">
            {rows.map((r, i) => (
              <li key={i}>
                <span className="pos">{i + 1}.</span>
                <span className="nm">{r.nickname}</span>
                <span className="dt">{fmtDate(r.date)}</span>
                <span className="sc">{r.score.toLocaleString("es-ES")} pts</span>
              </li>
            ))}
          </ol>
        </>
      )}

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={onBack}>Volver</button>
        {rows.length > 0 && (
          <button className="btn btn-ghost" onClick={wipe} style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>
            {confirming ? "Pulse de nuevo para confirmar el borrado" : "Borrar ranking"}
          </button>
        )}
      </div>
    </div>
  );
}
