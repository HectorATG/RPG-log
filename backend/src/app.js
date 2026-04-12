const express = require("express");
const cors = require("cors");

const authRoutes     = require("./routes/auth.routes");
const questsRoutes   = require("./routes/quests.routes");
const syncRoutes     = require("./routes/sync.routes");
const progressRoutes = require("./routes/progress.routes");
const pushRoutes     = require("./routes/push.routes");

const app = express();

// ─────────────────────────────────────────────────────────────────
// CORS — configuración robusta para producción + móvil + PWA
// ─────────────────────────────────────────────────────────────────
//
// PROBLEMA EN MÓVIL: Los siguientes casos llegan con origin = null o vacío:
//   • Android WebView (TWA / apps instaladas como PWA)
//   • Safari en iOS cuando la app está en "Add to Home Screen"
//   • Algunos navegadores móviles en modo incógnito
//   • Requests desde file:// (React Native)
//   • Postman / curl sin origin header
//
// SOLUCIÓN: permitir origin vacío/null siempre, y validar los demás
// contra la lista del .env más una whitelist de dominios de confianza.

const allowedOrigins = new Set(
  (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((o) => o.trim().toLowerCase())
    .filter(Boolean)
);

// Dominios que SIEMPRE están permitidos (no dependen del .env)
const ALWAYS_ALLOWED = [
  "https://rpg-log.onrender.com",
];
ALWAYS_ALLOWED.forEach((o) => allowedOrigins.add(o.toLowerCase()));

function isOriginAllowed(origin) {
  if (!origin) return true;                          // null / sin header → permitir (móvil, Postman, PWA)

  const o = origin.toLowerCase();
  if (allowedOrigins.has(o)) return true;           // lista exacta del .env
  if (o.includes("localhost")) return true;          // cualquier localhost
  if (o.includes("127.0.0.1")) return true;
  if (o.includes(".onrender.com")) return true;      // cualquier subdominio de Render

  return false;
}

const corsOptions = {
  origin(origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn("❌ CORS bloqueado para:", origin);
      callback(new Error("Origen no permitido por CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

// Pre-flight para todas las rutas
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

// ─────────────────────────────────────────────────────────────────
// Body parsers
// ─────────────────────────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────────────────────
// Health / info routes
// ─────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ ok: true, name: "RPGLog API", message: "RPGLog API funcionando 🚀" });
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/api/info", (req, res) => {
  res.json({ ok: true, app: "RPGLog API", version: "1.0.0" });
});

// ─────────────────────────────────────────────────────────────────
// Feature routes
// ─────────────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/quests",   questsRoutes);
app.use("/api/sync",     syncRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/push",     pushRoutes);

// ─────────────────────────────────────────────────────────────────
// 404
// ─────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Ruta no encontrada" });
});

// ─────────────────────────────────────────────────────────────────
// Error handler global
// ─────────────────────────────────────────────────────────────────
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error("❌ Error:", err.message);
  if (err.message === "Origen no permitido por CORS") {
    return res.status(403).json({ ok: false, message: err.message });
  }
  return res.status(500).json({ ok: false, message: "Error interno del servidor" });
});

module.exports = app;
