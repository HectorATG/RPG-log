
# 🎮 RPG Log - Backend & Frontend Completo

## ✅ Estado del Proyecto

**Backend**: ✔ Funcionando en `http://localhost:3002`  
**Database**: ✔ Conectado a MongoDB Atlas  
**Auth**: ✔ JWT implementado  
**CORS**: ✔ Configurado  
**Frontend**: ✔ Conectado al backend  

---

## 📁 Estructura Backend

```
backend/
├── src/
│   ├── config/
│   │   └── db.js              # Conexión MongoDB
│   ├── models/
│   │   └── User.js            # Esquema de usuario con stats
│   ├── controllers/
│   │   ├── authController.js  # Register & Login
│   │   └── userController.js  # Stats & Usuario actual
│   ├── routes/
│   │   ├── authRoutes.js      # Rutas de autenticación
│   │   └── userRoutes.js      # Rutas de usuario
│   ├── middleware/
│   │   └── authMiddleware.js  # Verificación JWT
│   └── index.js               # Servidor Express
├── .env                       # Variables de entorno
└── package.json
```

---

## 🔐 ENDPOINTS

### 1️⃣ REGISTRO

**Endpoint:** `POST /api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "username": "hector",
  "email": "hector@mail.com",
  "password": "123456"
}
```

**Response (201):**
```json
{
  "message": "Usuario creado correctamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "hector",
    "email": "hector@mail.com",
    "stats": {
      "fuerza": 0,
      "resistencia": 0,
      "agilidad": 0,
      "inteligencia": 0,
      "creatividad": 0,
      "comunicacion": 0
    }
  }
}
```

---

### 2️⃣ LOGIN

**Endpoint:** `POST /api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "hector@mail.com",
  "password": "123456"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "hector",
    "email": "hector@mail.com",
    "stats": {
      "fuerza": 5,
      "resistencia": 3,
      "agilidad": 0,
      "inteligencia": 0,
      "creatividad": 0,
      "comunicacion": 0
    }
  }
}
```

---

### 3️⃣ OBTENER USUARIO ACTUAL (Protegido)

**Endpoint:** `GET /api/user/me`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "hector",
  "email": "hector@mail.com",
  "stats": {
    "fuerza": 5,
    "resistencia": 3,
    "agilidad": 0,
    "inteligencia": 0,
    "creatividad": 0,
    "comunicacion": 0
  },
  "createdAt": "2024-04-03T12:00:00Z",
  "updatedAt": "2024-04-03T12:00:00Z"
}
```

---

### 4️⃣ ACTUALIZAR STATS (Protegido)

**Endpoint:** `PUT /api/user/stats`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body:** (Solo envía los que quieras actualizar)
```json
{
  "fuerza": 10,
  "resistencia": 8,
  "inteligencia": 5
}
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "hector",
  "email": "hector@mail.com",
  "stats": {
    "fuerza": 10,
    "resistencia": 8,
    "agilidad": 0,
    "inteligencia": 5,
    "creatividad": 0,
    "comunicacion": 0
  },
  "createdAt": "2024-04-03T12:00:00Z",
  "updatedAt": "2024-04-03T12:10:00Z"
}
```

---

### 5️⃣ OBTENER TODOS LOS USUARIOS

**Endpoint:** `GET /api/user/all`

**Headers:**
```
Content-Type: application/json
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "username": "hector",
    "email": "hector@mail.com",
    "stats": {...}
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "username": "juan",
    "email": "juan@mail.com",
    "stats": {...}
  }
]
```

---

## 🛠️ CÓMO USAR EN FRONTEND

### Backend API Service (`src/services/api.js`)

```javascript
import { authApi, userApi } from '../services/api';

// Registrarse
const registerResponse = await authApi.register({
  username: 'hector',
  email: 'hector@mail.com',
  password: '123456'
});
// Retorna: { message, token, user }

// Iniciar sesión
const loginResponse = await authApi.login({
  email: 'hector@mail.com',
  password: '123456'
});
// Retorna: { token, user }

// Guardar usuario en localStorage
localStorage.setItem('user', JSON.stringify(loginResponse.user));
localStorage.setItem('token', loginResponse.token);

// Obtener usuario actual
const currentUser = await userApi.getCurrentUser();
// Requiere token en Authorization header (automático)

// Actualizar stats
const updatedUser = await userApi.updateStats({
  fuerza: 10,
  resistencia: 8
});
// Retorna usuario actualizado
```

---

## 💾 PERSISTENCIA DE DATOS

### Después de Login/Register:

```javascript
// Guardar en localStorage
localStorage.setItem('user', JSON.stringify(response.user));
localStorage.setItem('token', response.token);

// Eliminar modo invitado
localStorage.removeItem('guestUser');
```

### Al Cargar la App:

```javascript
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

if (user && token) {
  // Usuario autenticado - mostrar datos reales
  console.log('Bienvenido', user.username);
  console.log('Stats:', user.stats);
} else {
  // Usuario no autenticado - login requerido
  window.location.href = '/login';
}
```

---

## 🔒 SEGURIDAD

- ✔ Passwords encriptadas con bcryptjs (salt: 10)
- ✔ JWT tokens con expiración de 7 días
- ✔ Middleware de autenticación en rutas protegidas
- ✔ Validación de inputs en backend
- ✔ CORS configurado para localhost en desarrollo

---

## 🚀 DEPLOYMENT

Para producción en Render:

1. Agregar variable `JWT_SECRET` segura
2. Configurar `CORS_ORIGIN` con dominio del frontend
3. Usar URL de MongoDB Atlas (ya configurada)
4. Asegurar que las variables de entorno estén en Render

---

## ✨ CARACTERÍSTICAS IMPLEMENTADAS

✔ Registro con username, email y password  
✔ Login con JWT  
✔ Stats inicializados en 0  
✔ Actualización de stats por usuario  
✔ Obtencion de datos del usuario actual  
✔ Middleware de autenticación  
✔ CORS configurado  
✔ MongoDB Atlas conectado  
✔ Manejo de errores  
✔ Validaciones  

---

## 🧪 PRUEBAS CON POSTMAN

1. **Registrarse:**
   - POST `http://localhost:3002/api/auth/register`
   - Body: `{ "username": "test", "email": "test@mail.com", "password": "123456" }`

2. **Iniciar sesión:**
   - POST `http://localhost:3002/api/auth/login`
   - Body: `{ "email": "test@mail.com", "password": "123456" }`

3. **Obtener usuario actual (usa token del paso 2):**
   - GET `http://localhost:3002/api/user/me`
   - Header: `Authorization: Bearer {token}`

4. **Actualizar stats:**
   - PUT `http://localhost:3002/api/user/stats`
   - Header: `Authorization: Bearer {token}`
   - Body: `{ "fuerza": 15, "resistencia": 10 }`

---

## 📝 VARIABLES DE ENTORNO (`backend/.env`)

```
MONGO_URI=mongodb+srv://hector:dataapp123@dataapp.wmspqvt.mongodb.net/rpglog?retryWrites=true&w=majority
PORT=3002
JWT_SECRET=tu_secreto_super_seguro_rpglog_2024
```

---

## 🤝 FLUJO COMPLETO

1. **Usuario se registra** → `POST /api/auth/register`
   - Backend crea usuario con stats en 0
   - Devuelve token + user

2. **Frontend guarda en localStorage**
   - user
   - token

3. **Usuario inicia sesión** → `POST /api/auth/login`
   - Backend verifica credenciales
   - Devuelve token + user

4. **Usuario juega y obtiene puntos**
   - Frontend actualiza stats localmente

5. **Usuario guarda progreso** → `PUT /api/user/stats`
   - Frontend envía token en Authorization header
   - Backend actualiza stats en MongoDB
   - Devuelve usuario actualizado

6. **Usuario cierra sesión**
   - Frontend limpia localStorage
   - Frontend borra token

---

**¡Tu RPG Log está completamente funcional! 🎮🚀**
