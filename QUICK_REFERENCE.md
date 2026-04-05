% ============================================
% GUÍA RÁPIDA - RPG LOG COMPLETO
% ============================================

## 🚀 INICIO RÁPIDO

### 1. Iniciar Backend
```bash
cd backend
npm install
npm start
# Corre en http://localhost:3002
```

### 2. Iniciar Frontend
```bash
npm start
# Corre en http://localhost:3000
```

### 3. Probar Endpoints (Postman/Insomnia)

**REGISTRO:**
```
POST http://localhost:3002/api/auth/register
{
  "username": "testuser",
  "email": "test@mail.com",
  "password": "123456"
}
```

**LOGIN:**
```
POST http://localhost:3002/api/auth/login
{
  "email": "test@mail.com",
  "password": "123456"
}
```

**OBTENER USUARIO (copia el token del login):**
```
GET http://localhost:3002/api/user/me
Headers:
  Authorization: Bearer {TOKEN_AQUI}
```

**ACTUALIZAR STATS:**
```
PUT http://localhost:3002/api/user/stats
Headers:
  Authorization: Bearer {TOKEN_AQUI}
{
  "fuerza": 20,
  "resistencia": 15
}
```

---

## 🔑 CLAVES IMPORTANTES

### Base URL Backend
```
http://localhost:3002/api
```

### Rutas Públicas
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión
- `GET /user/all` - Obtener todos los usuarios

### Rutas Protegidas (requieren JWT)
- `GET /user/me` - Obtener usuario actual
- `PUT /user/stats` - Actualizar stats

---

## 💾 DATOS EN LOCALSTORAGE

**Después de login/registro exitoso:**
```javascript
localStorage.setItem('user', JSON.stringify(response.user));
localStorage.setItem('token', response.token);
localStorage.removeItem('guestUser'); // Eliminar invitado
```

**Para obtener datos:**
```javascript
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');
const stats = user?.stats || {};
```

---

## 🐛 TROUBLESHOOTING

### "Error: Connect ECONNREFUSED"
❌ Backend no está corriendo
✔ Solución: Ejecutar `cd backend && npm start`

### "Error: 401 Token inválido"
❌ Token expirado o no enviado
✔ Solución: 
- Verificar que Authorization header sea: `Bearer {token}`
- Hacer login nuevamente
- Verificar que token no expire (7 días)

### "Error: CORS"
❌ Frontend bloqueado por CORS
✔ Solución:
- Verificar que CORS esté habilitado en backend/src/index.js
- Reinstalar: `npm install cors`

### "Error: Illegal arguments: undefined, number"
❌ Password undefined en registro
✔ Solución:
- Verificar que envíes password como string
- No puede ser null ni undefined
- Mínimo 6 caracteres

### "MongooseError: Cannot connect"
❌ MongoDB Atlas no conecta
✔ Solución:
- Verificar MONGO_URI en .env
- Verificar que IP esté whitelisted en MongoDB Atlas
- Intentar desde terminal: `mongosh "mongodb+srv://..."`

---

## 📊 MODELO DE USUARIO

```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (hasheado),
  stats: {
    fuerza: Number (default: 0),
    resistencia: Number (default: 0),
    agilidad: Number (default: 0),
    inteligencia: Number (default: 0),
    creatividad: Number (default: 0),
    comunicacion: Number (default: 0)
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔒 TOKENS JWT

**Formato:**
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTYyNDAwMDAwMCwiZXhwIjoxNjI0NjA0ODAwfQ.xxx
```

**Duración:** 7 días
**Secret:** `tu_secreto_super_seguro_rpglog_2024` (.env)
**Verificación:** Middleware `authMiddleware.js`

---

## 📁 ARCHIVOS CLAVE CREADOS

### Backend
```
backend/
├── src/config/db.js
├── src/models/User.js
├── src/controllers/authController.js
├── src/controllers/userController.js
├── src/routes/authRoutes.js
├── src/routes/userRoutes.js
├── src/middleware/authMiddleware.js
├── src/index.js
├── .env
└── package.json
```

### Frontend
```
src/
├── services/api.js (actualizado)
├── components/Login.jsx (actualizado)
├── components/Register.jsx (actualizado)
├── hooks/useQuests.js
└── components/HomeScreen.jsx
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [x] Modelo User con email y stats
- [x] Registro con validaciones
- [x] Login con JWT
- [x] Middleware de autenticación
- [x] Rutas protegidas
- [x] CORS configurado
- [x] MongoDB conectado
- [x] Frontend conectado a API
- [x] Persistencia en localStorage
- [x] Actualización de stats
- [x] Eliminación modo invitado
- [x] Try/catch en todos lados

---

## 🎯 PRÓXIMOS PASOS (Opcional)

1. Agregar refresh token
2. Agregar roles (admin, mod, player)
3. Agregar logros/badges
4. Agregar rankings
5. Agregar misiones progresivas
6. Agregar sistema de niveles
7. Agregar amigos/chat
8. Agregar pagos

---

## 📞 SOPORTE

**Errores comunes solucionados:**
- ✔ "Illegal arguments: undefined, number" - Validar password
- ✔ "CORS error" - Agregar cors middleware
- ✔ "Token inválido" - Verificar Authorization header
- ✔ "Connection refused" - Iniciar backend
- ✔ "MongoDB cannot connect" - Whitelist IP en Atlas

---

**¡Tu RPG Log está listo para producción! 🎮💎**
