// ============================================
// EJEMPLO: Cómo usar la autenticación completa
// ============================================

import React, { useState, useEffect } from 'react';
import { authApi, userApi } from '../services/api';

export const AuthExample = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // ============================================
  // 1. AL CARGAR LA PÁGINA
  // ============================================
  useEffect(() => {
    // Restaurar usuario de localStorage
    const savedUser = JSON.parse(localStorage.getItem('user'));
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      setUser(savedUser);
      setToken(savedToken);
      console.log('✔ Usuario autenticado:', savedUser.username);
    } else {
      console.log('ℹ No hay usuario autenticado');
    }
  }, []);

  // ============================================
  // 2. REGISTRO
  // ============================================
  const handleRegister = async (username, email, password) => {
    try {
      const response = await authApi.register({
        username,
        email,
        password
      });

      // Guardar en localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);

      // Limpiar invitado
      localStorage.removeItem('guestUser');

      // Actualizar estado
      setUser(response.user);
      setToken(response.token);

      console.log('✔ Registro exitoso:', response.user);
      return response;
    } catch (error) {
      console.error('✗ Error en registro:', error.message);
      throw error;
    }
  };

  // ============================================
  // 3. LOGIN
  // ============================================
  const handleLogin = async (email, password) => {
    try {
      const response = await authApi.login({
        email,
        password
      });

      // Guardar en localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);

      // Limpiar invitado
      localStorage.removeItem('guestUser');

      // Actualizar estado
      setUser(response.user);
      setToken(response.token);

      console.log('✔ Login exitoso:', response.user);
      return response;
    } catch (error) {
      console.error('✗ Error en login:', error.message);
      throw error;
    }
  };

  // ============================================
  // 4. OBTENER USUARIO ACTUAL
  // ============================================
  const handleGetCurrentUser = async () => {
    try {
      // Requiere token (enviado automáticamente en header)
      const response = await userApi.getCurrentUser();
      console.log('✔ Usuario actual:', response);
      return response;
    } catch (error) {
      console.error('✗ Error obteniendo usuario:', error.message);
      throw error;
    }
  };

  // ============================================
  // 5. ACTUALIZAR STATS
  // ============================================
  const handleUpdateStats = async (newStats) => {
    try {
      // Actualizar solo los stats que quieras cambiar
      const response = await userApi.updateStats({
        fuerza: newStats.fuerza,
        resistencia: newStats.resistencia,
        agilidad: newStats.agilidad,
        inteligencia: newStats.inteligencia,
        creatividad: newStats.creatividad,
        comunicacion: newStats.comunicacion
      });

      // Actualizar usuario local
      setUser(response);
      localStorage.setItem('user', JSON.stringify(response));

      console.log('✔ Stats actualizados:', response.stats);
      return response;
    } catch (error) {
      console.error('✗ Error actualizando stats:', error.message);
      throw error;
    }
  };

  // ============================================
  // 6. LOGOUT
  // ============================================
  const handleLogout = () => {
    // Limpiar localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    // Actualizar estado
    setUser(null);
    setToken(null);

    // Limpiar cookie de autenticación
    authApi.logout();

    console.log('✔ Logout exitoso');
  };

  // ============================================
  // Mostrar estado actual
  // ============================================
  return (
    <div>
      {!user ? (
        <div>
          <h2>No autenticado</h2>
          <button
            onClick={() =>
              handleRegister('test', 'test@mail.com', '123456')
            }
          >
            Registrarse
          </button>
          <button
            onClick={() =>
              handleLogin('test@mail.com', '123456')
            }
          >
            Login
          </button>
        </div>
      ) : (
        <div>
          <h2>¡Bienvenido {user.username}!</h2>
          <p>Email: {user.email}</p>
          <h3>Tus Stats:</h3>
          <ul>
            <li>Fuerza: {user.stats.fuerza}</li>
            <li>Resistencia: {user.stats.resistencia}</li>
            <li>Agilidad: {user.stats.agilidad}</li>
            <li>Inteligencia: {user.stats.inteligencia}</li>
            <li>Creatividad: {user.stats.creatividad}</li>
            <li>Comunicación: {user.stats.comunicacion}</li>
          </ul>
          <button
            onClick={() =>
              handleUpdateStats({
                fuerza: 20,
                resistencia: 15,
                agilidad: 10,
                inteligencia: 5,
                creatividad: 8,
                comunicacion: 12
              })
            }
          >
            Actualizar Stats
          </button>
          <button onClick={handleGetCurrentUser}>
            Refrescar Datos
          </button>
          <button onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================
// ESTRUCTURA DE USER EN LOCALSTORAGE
// ============================================
/*
localStorage.user = {
  "id": "607f1f77bcf86cd799439011",
  "username": "hector",
  "email": "hector@mail.com",
  "stats": {
    "fuerza": 10,
    "resistencia": 8,
    "agilidad": 5,
    "inteligencia": 7,
    "creatividad": 6,
    "comunicacion": 9
  }
}

localStorage.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
*/

export default AuthExample;
