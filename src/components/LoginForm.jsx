/**
 * LoginForm.jsx — Formulario de inicio de sesión
 * ─────────────────────────────────────────────────────
 * Conectado al backend real via authApi.login().
 * En caso de error de red cae a modo local (invitado).
 *
 * Props:
 *   onSuccess(mode, username, authData?) — callback al login exitoso
 *     authData: { user, profile, stats } del backend, o null si es invitado
 */
import { useState } from "react";
import { authApi } from "../services/api";

export default function LoginForm({ onSuccess }) {
  const [email,    setEmail]    = useState("");
  const [pass,     setPass]     = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!email || !pass)      { setError("▸ Completa todos los campos"); return; }
    if (!email.includes("@")) { setError("▸ Email inválido"); return; }

    setLoading(true);
    try {
      const data = await authApi.login({ email, password: pass });
      // data = { ok, token, user, profile, stats }
      onSuccess("login", data.user.username, {
        user:    data.user,
        profile: data.profile,
        stats:   data.stats,
      });
    } catch (err) {
      setError(`▸ ${err.message || "Error al conectar con el servidor"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    onSuccess("login", "Invitado", null);
  };

  return (
    <div className="form-body">
      <div className="field">
        <label className="field-label">▸ CORREO ELECTRÓNICO</label>
        <div className="field-wrap">
          <span className="field-icon">📧</span>
          <input
            className="field-input"
            type="email"
            placeholder="heroe@quest.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
        </div>
      </div>

      <div className="field">
        <label className="field-label">▸ CONTRASEÑA</label>
        <div className="field-wrap">
          <span className="field-icon">🔒</span>
          <input
            className="field-input"
            type={showPass ? "text" : "password"}
            placeholder="••••••••"
            value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
          <button className="eye-btn" onClick={() => setShowPass(p => !p)}>
            {showPass ? "🙈" : "👁️"}
          </button>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
        {loading
          ? <span>ENTRANDO<span className="btn-loading">...</span></span>
          : "▶ INICIAR AVENTURA"}
      </button>

      <div className="divider">
        <div className="divider-line" />
        <span className="divider-text">O</span>
        <div className="divider-line" />
      </div>

      <button className="guest-btn" onClick={handleGuest}>
        👤 CONTINUAR COMO INVITADO
      </button>
    </div>
  );
}
