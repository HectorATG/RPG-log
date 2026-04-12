/**
 * App.jsx — Componente raíz de la aplicación
 * ─────────────────────────────────────────────────────
 * Ya NO es "modo 100% frontend". Ahora maneja authData del backend
 * y lo pasa a HomeScreen.
 *
 * Estado:
 *   currentUser (object | null)
 *     null → no autenticado → muestra AuthScreen
 *     { name, isNewAccount } → autenticado → muestra HomeScreen
 */
import React from "react";
import AuthScreen from "./screens/AuthScreen";
import HomeScreen from "./screens/HomeScreen";
import { useAuth } from "./contexts/AuthContext";
import { usePWAInstall } from "./hooks/usePWAInstall";
import PWAInstallBanner from "./components/PWAInstallBanner";

export default function App() {
  const { user, loading, logout } = useAuth();
  const { canInstall, install } = usePWAInstall();
  if (loading) {
    return (
      <div className="app-loading">
        ⏳ CARGANDO...
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

return (
  <>
    <HomeScreen onLogout={logout} />
    <PWAInstallBanner canInstall={canInstall} onInstall={install} />
  </>
);
}
