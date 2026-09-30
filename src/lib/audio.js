/* ATENEO — motor de audio (Web Audio API, sin ficheros externos) */

// Secuencias verificadas: [nota MIDI, duración en tiempos], ~112 bpm
export const MELODIES = {
  beethoven5: {
    title: "Sinfonía n.º 5 de Beethoven",
    notes: [[67,.5],[67,.5],[67,.5],[63,2],[60,.5],[60,.5],[60,.5],[62,2]],
  },
  furElise: {
    title: "Para Elisa",
    notes: [[76,.25],[75,.25],[76,.25],[75,.25],[76,.25],[71,.25],[74,.25],[72,.25],[69,.75]],
  },
  kleineNacht: {
    title: "Eine kleine Nachtmusik de Mozart",
    notes: [[67,.5],[74,1],[83,.5],[81,.5],[79,2],[78,.5],[76,.5],[74,2]],
  },
  primavera: {
    title: "La Primavera de Vivaldi",
    notes: [[76,.5],[76,.5],[76,.5],[76,1],[76,.5],[76,.5],[76,.5],[76,1],[76,.5],[79,.5],[77,.5],[76,1.5]],
  },
  toccata: {
    title: "Tocata y fuga en re menor de Bach",
    notes: [[69,.25],[67,.25],[69,.25],[67,.25],[65,.25],[64,.25],[62,.25],[61,.25],[62,1.5]],
  },
  marchaFunebre: {
    title: "Marcha fúnebre de Chopin",
    notes: [[58,.75],[58,.25],[58,.5],[56,.75],[55,.25],[55,.5],[58,.75],[58,.25],[58,.5],[54,1.5]],
  },
  guillermoTell: {
    title: "Obertura de Guillermo Tell de Rossini",
    notes: [[76,.5],[76,.5],[76,.5],[76,.5],[76,1],[74,.5],[72,.5],[71,.5],[69,1.5]],
  },
  montanaRey: {
    title: "En la gruta del rey de la montaña de Grieg",
    notes: [[59,.5],[60,.5],[62,.5],[60,.5],[59,.5],[57,.5],[55,.5],[54,.5],[52,1.5]],
  },
};

const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);
const BPM = 112;
const BEAT = 60 / BPM;

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.ambientNodes = null;
    this.muted = localStorage.getItem("ateneo_muted") === "1";
    this.ambientOn = false;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 1;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return true;
  }

  setMuted(m) {
    this.muted = m;
    localStorage.setItem("ateneo_muted", m ? "1" : "0");
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(m ? 0 : 1, this.ctx.currentTime, 0.05);
    }
  }

  // --- nota genérica con envolvente ---
  tone(freq, t0, dur, { type = "sine", gain = 0.25, attack = 0.01, release = 0.08 } = {}) {
    if (!this.ensure()) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0001), t0 + attack);
    g.gain.setValueAtTime(Math.max(gain, 0.0001), Math.max(t0 + attack, t0 + dur - release));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(this.master);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  // --- SFX ---
  sfxCorrect() {
    if (!this.ensure()) return;
    const t = this.ctx.currentTime;
    this.tone(midiToFreq(76), t, 0.28, { gain: 0.22 });
    this.tone(midiToFreq(83), t + 0.12, 0.4, { gain: 0.22 });
    this.tone(midiToFreq(88), t + 0.24, 0.5, { gain: 0.16 });
  }

  sfxWrong() {
    if (!this.ensure()) return;
    const t = this.ctx.currentTime;
    this.tone(138, t, 0.35, { type: "sawtooth", gain: 0.1 });
    this.tone(104, t + 0.16, 0.45, { type: "sawtooth", gain: 0.1 });
  }

  sfxTick() {
    if (!this.ensure()) return;
    const t = this.ctx.currentTime;
    this.tone(1250, t, 0.06, { type: "square", gain: 0.06 });
  }

  sfxFanfare() {
    if (!this.ensure()) return;
    const t = this.ctx.currentTime;
    const seq = [72, 76, 79, 84, 79, 84];
    seq.forEach((m, i) => {
      this.tone(midiToFreq(m), t + i * 0.16, i === seq.length - 1 ? 0.9 : 0.22,
        { type: "triangle", gain: 0.2 });
    });
  }

  sfxClick() {
    if (!this.ensure()) return;
    this.tone(660, this.ctx.currentTime, 0.07, { gain: 0.08 });
  }

  // --- melodías famosas (dominio público) ---
  playMelody(pieceId) {
    if (!this.ensure()) return 0;
    const piece = MELODIES[pieceId];
    if (!piece) return 0;
    const t0 = this.ctx.currentTime + 0.05;
    let t = t0;
    let total = 0;
    for (const [midi, beats] of piece.notes) {
      const dur = beats * BEAT;
      // voz principal
      this.tone(midiToFreq(midi), t, dur * 0.92, { type: "triangle", gain: 0.3, release: 0.05 });
      // refuerzo grave suave una octava abajo
      this.tone(midiToFreq(midi - 12), t, dur * 0.9, { type: "sine", gain: 0.1, release: 0.05 });
      t += dur;
      total += dur;
    }
    return total * 1000;
  }

  // --- ambiente generativo: pad de acordes lento, muy bajo ---
  startAmbient() {
    if (!this.ensure() || this.ambientOn) return;
    this.ambientOn = true;
    // Am — F — C — G  (acordes como tríadas MIDI)
    const chords = [
      [57, 60, 64], // Am
      [53, 57, 60], // F
      [48, 52, 55], // C (grave)
      [55, 59, 62], // G
    ];
    const chordDur = 9; // segundos por acorde
    let step = 0;
    const playChord = () => {
      if (!this.ambientOn || !this.ctx) return;
      const t = this.ctx.currentTime + 0.1;
      const chord = chords[step % chords.length];
      for (const m of chord) {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        const f = this.ctx.createBiquadFilter();
        o.type = "sine";
        o.frequency.value = midiToFreq(m);
        f.type = "lowpass";
        f.frequency.value = 900;
        // ataque lento, caída lenta
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.035, t + 3);
        g.gain.setValueAtTime(0.035, t + chordDur - 3);
        g.gain.exponentialRampToValueAtTime(0.0001, t + chordDur);
        o.connect(f).connect(g).connect(this.master);
        o.start(t);
        o.stop(t + chordDur + 0.2);
      }
      step++;
      this._ambientTimer = setTimeout(playChord, chordDur * 1000);
    };
    playChord();
  }

  stopAmbient() {
    this.ambientOn = false;
    if (this._ambientTimer) clearTimeout(this._ambientTimer);
  }
}

export const audio = new AudioEngine();
