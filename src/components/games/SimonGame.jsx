/**
 * SimonGame.jsx — Minijuego: SIMON GLITCH (memorizar secuencia)
 * ─────────────────────────────────────────────────────
 * Juego de memoria: el juego muestra una secuencia de colores y el
 * jugador debe repetirla en el mismo orden.
 *
 * MEJORAS:
 *   • Los botones se ILUMINAN al presionarlos (presedLit state)
 *   • Flash verde "¡CORRECTO!" al completar una ronda exitosa
 *   • Flash rojo "¡FALLASTE!" con vibración al equivocarse
 *   • La fase "showing" deshabilita interacción visualmente (cursor)
 *
 * Fases: idle → showing → input → correct (breve) → showing...
 *        error → fail → fin
 *
 * Score = longitud de secuencia completada × 50 pts por ronda
 */
import { useState, useCallback } from "react";

const SIMON_COLORS = [
  { id: 0, color: "#e05252", label: "🟥", name: "ROJO"    },
  { id: 1, color: "#5b8dd9", label: "🟦", name: "AZUL"    },
  { id: 2, color: "#52c97a", label: "🟩", name: "VERDE"   },
  { id: 3, color: "#f5c842", label: "🟨", name: "AMARILLO"},
];

export default function SimonGame({ onEnd }) {
  const [seq,        setSeq]        = useState([]);
  const [playerSeq,  setPlayerSeq]  = useState([]);
  const [phase,      setPhase]      = useState("idle");
  const [lit,        setLit]        = useState(null);   // iluminado por el juego al mostrar
  const [pressedLit, setPressedLit] = useState(null);  // iluminado por el jugador al presionar
  const [score,      setScore]      = useState(0);
  const [started,    setStarted]    = useState(false);
  const [feedback,   setFeedback]   = useState(null);  // "correct" | "wrong" | null

  const showSeq = useCallback((sequence) => {
    setPhase("showing");
    setFeedback(null);
    let i = 0;
    const delay = sequence.length > 6 ? 350 : 500;  // acelera en rondas avanzadas
    const show = () => {
      if (i >= sequence.length) { setPhase("input"); return; }
      setLit(sequence[i]);
      setTimeout(() => { setLit(null); i++; setTimeout(show, 250); }, delay);
    };
    setTimeout(show, 500);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const nextRound = useCallback((current) => {
    const next = [...current, Math.floor(Math.random() * 4)];
    setSeq(next); setPlayerSeq([]); showSeq(next);
  }, [showSeq]);

  const start = () => {
    setStarted(true); setScore(0); setSeq([]);
    setFeedback(null); nextRound([]);
  };

  const press = (id) => {
    if (phase !== "input") return;

    // Iluminar el botón presionado
    setPressedLit(id);
    setTimeout(() => setPressedLit(null), 200);

    const newP = [...playerSeq, id];
    setPlayerSeq(newP);

    // ¿Error?
    if (newP[newP.length - 1] !== seq[newP.length - 1]) {
      setPhase("wrong");
      setFeedback("wrong");
      setTimeout(() => onEnd(score), 1400);
      return;
    }

    // ¿Ronda completa?
    if (newP.length === seq.length) {
      const pts = seq.length * 50;
      setScore(p => p + pts);
      setFeedback("correct");
      setPhase("correct");
      setTimeout(() => nextRound(seq), 800);
    }
  };

  if (!started) {
    return (
      <div className="game-start-screen">
        <div className="game-start-hint">
          Observa la secuencia de colores y repítela.<br />
          Un error termina el juego. ¡Buena suerte!
        </div>
        <button className="btn-gold" onClick={start}>▶ INICIAR</button>
      </div>
    );
  }

  return (
    <div className="simon-wrapper">

      {/* Status */}
      <div className={`simon-status${feedback === "correct" ? " correct" : feedback === "wrong" ? " wrong" : ""}`}>
        {phase === "showing"  ? "👁 OBSERVA EL PATRÓN..."
         : phase === "input"  ? `⌨ TU TURNO — ${seq.length - playerSeq.length} pasos restantes`
         : phase === "correct"? "✅ ¡CORRECTO! Siguiente ronda..."
         : phase === "wrong"  ? "❌ ¡FALLASTE! FIN DEL JUEGO"
         : ""}
      </div>

      {/* Grid de botones */}
      <div className="simon-grid">
        {SIMON_COLORS.map(c => {
          const isGameLit    = lit       === c.id;  // el juego lo ilumina
          const isPlayerLit  = pressedLit === c.id;  // el jugador lo presionó
          const isActive     = isGameLit || isPlayerLit;
          const isFail       = phase === "wrong";

          return (
            <button
              key={c.id}
              className={`simon-btn${isActive ? " lit" : ""}${isFail ? " wrong-flash" : ""}${phase === "input" ? " interactive" : ""}`}
              style={{ "--sc": c.color }}
              onClick={() => press(c.id)}
              disabled={phase !== "input"}
            >
              <span className="simon-btn-icon">{c.label}</span>
              {isPlayerLit && (
                <div className="simon-btn-label" style={{ "--btn-c": c.color }}>
                  {c.name}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Progreso de la ronda */}
      <div className="simon-pattern-display">
        Ronda: {seq.length} &nbsp;|&nbsp; Progreso: {playerSeq.length}/{seq.length}
        &nbsp;|&nbsp; Puntos: {score}
      </div>

      {/* Indicador visual de progreso de la secuencia */}
      <div className="simon-progress">
        {seq.map((colorId, idx) => {
          const c = SIMON_COLORS[colorId];
          const done = idx < playerSeq.length;
          return (
            <div
              key={idx}
              className={`simon-dot${done ? " done" : ""}`}
              style={{ "--dot-c": c.color }}
            />
          );
        })}
      </div>
    </div>
  );
}
