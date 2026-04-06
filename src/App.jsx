/**
 * App.jsx — Componente raíz de la aplicación
 * ─────────────────────────────────────────────────────
 * Modo 100% frontend — sin llamadas al backend.
 * Toda la persistencia usa localStorage por usuario.
 *
 * Estado:
 *   currentUser (object | null)
 *     null → no autenticado → muestra AuthScreen
 *     { name, isNewAccount } → autenticado → muestra HomeScreen
 */
import { useState } from "react";
import AuthScreen from "./screens/AuthScreen";
import HomeScreen from "./screens/HomeScreen";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (username, isNew = false, authData = null) => {
    setCurrentUser({ name: username, isNewAccount: isNew, authData });
  };

  const handleLogout = () => setCurrentUser(null);

  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <HomeScreen
      initialName={currentUser.name}
      isNewAccount={currentUser.isNewAccount}
      authData={currentUser.authData}
      onLogout={handleLogout}
    />
  );
}
