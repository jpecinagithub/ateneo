import { audio } from "../lib/audio";

export default function HowTo({ onBack }) {
  return (
    <div className="card narrow">
      <p className="eyebrow">Reglamento</p>
      <h1 className="title">Cómo se juega</h1>
      <ol className="rules">
        <li><b>Dos niveles:</b> <b>Intermedio</b> (100 preguntas de cultura general sólida) y <b>Avanzado</b> (100 preguntas exigentes). En la partida rápida son 20 al azar.</li>
        <li><b>10 segundos por pregunta.</b> El anillo marca el tiempo; en los últimos 3 segundos se vuelve rojo y late.</li>
        <li>Cada pregunta tiene <b>4 opciones y una sola respuesta correcta</b>. Puede pulsar la opción o usar las teclas <b>1–4</b>.</li>
        <li><b>Puntuación:</b> 100 puntos por acierto, más hasta 100 de bonus por velocidad, más 25 por cada acierto en racha (tope 250). Fallar o agotar el tiempo rompe la racha.</li>
        <li>Tras responder verá la <b>explicación</b> durante 3 segundos: aquí también se aprende.</li>
        <li>Algunas preguntas son <b>musicales</b>: sonará un motivo famoso y deberá identificarlo. Puede repetirlo con el botón «Repetir melodía».</li>
        <li>Al final podrá <b>guardar su marca con un apodo</b> en el Salón de la fama (top 10, en este dispositivo) y <b>repasar todas las respuestas</b>.</li>
        <li>El icono <b>🔔/🔕</b> de la cabecera silencia la música ambiental y los efectos.</li>
      </ol>
      <div className="btn-row">
        <button className="btn btn-primary" onClick={() => { audio.sfxClick(); onBack(); }}>
          Entendido
        </button>
      </div>
    </div>
  );
}
