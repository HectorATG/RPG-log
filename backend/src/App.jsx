/**
 * App.jsx — Componente raíz de la aplicación
 * ─────────────────────────────────────────────────────
 * currentUser ahora incluye authData del backend para que
 * HomeScreen pueda inicializar el perfil con datos reales.
 */
import { useState } from "react";
import AuthScreen from "./screens/AuthScreen";
import HomeScreen from "./screens/HomeScreen";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  // authData: { user, profile, stats } del backend, o null si es invitado
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
