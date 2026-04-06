/**
 * AuthScreen.jsx — Pantalla de autenticación
 * ─────────────────────────────────────────────────────
 * handleSuccess ahora recibe authData del backend y lo
 * propaga a App.jsx para inicializar HomeScreen con datos reales.
 *
 * Props:
 *   onLogin(username, isNew, authData) — callback hacia App.jsx
 *     authData: { user, profile, stats } del backend, o null si es invitado
 */
import { useState, useEffect } from "react";
import "../styles/globals.css";
import "../styles/AuthScreen.css";

import Stars      from "../components/Stars";
import LoginForm  from "../components/LoginForm";
import SignupForm from "../components/SignupForm";

const SuccessOverlay = ({ mode, name }) => (
  <div className="success-overlay">
    <div className="success-icon">{mode === "login" ? "⚔️" : "🏆"}</div>
    <div className="success-text">
      {mode === "login"
        ? `¡BIENVENIDO DE VUELTA,\n${name.toUpperCase()}!`
        : `¡HÉROE CREADO!\n${name.toUpperCase()}`}
    </div>
    <div className="success-bar-wrap">
      <div className="success-bar" />
    </div>
  </div>
);

export default function AuthScreen({ onLogin }) {
  const [tab, setTab]         = useState("login");
  const [success, setSuccess] = useState(null); // { mode, name, authData }

  // authData viene de LoginForm/SignupForm (puede ser null para invitado)
  const handleSuccess = (mode, username, authData) => {
    setSuccess({ mode, name: username, authData });
    setTimeout(() => {
      onLogin(username, mode === "signup", authData);
    }, 2100);
  };

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(null), 2100);
    return () => clearTimeout(t);
  }, [success]);

  return (
    <div className="auth-root">
      <Stars />
      <div className="scanlines" />

      <div className="card">
        {success && <SuccessOverlay mode={success.mode} name={success.name} />}
        <div className="card-corner-bl" />
        <div className="card-corner-br" />

        <div className="card-header">
          <div className="logo-row">
            <span className="logo-icon">🗡️</span>
            <span className="logo-title">RPG LOG</span>
            <span className="logo-icon">🛡️</span>
          </div>
          <div className="logo-sub">PERSONAL RPG SYSTEM</div>
          <div className="xp-bar-wrap">
            <div className="xp-bar-fill" style={{ "--xp-w": "72%" }} />
          </div>
        </div>

        <div className="tabs">
          <button
            className={`tab-btn${tab === "login" ? " active" : ""}`}
            onClick={() => { setTab("login"); setSuccess(null); }}
          >
            ▸ INICIAR SESIÓN
          </button>
          <button
            className={`tab-btn${tab === "signup" ? " active" : ""}`}
            onClick={() => { setTab("signup"); setSuccess(null); }}
          >
            ▸ REGISTRARSE
          </button>
        </div>

        {tab === "login"
          ? <LoginForm  key="login"  onSuccess={handleSuccess} />
          : <SignupForm key="signup" onSuccess={handleSuccess} />}

        <div className="card-footer">
          <button className="footer-link" onClick={() => alert("Términos y condiciones — próximamente.")}>
            TÉRMINOS Y CONDICIONES
          </button>
          {tab === "login" && (
            <button className="footer-link" onClick={() => alert("Restablecimiento de contraseña — próximamente.")}>
              RESTABLECER CONTRASEÑA
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
