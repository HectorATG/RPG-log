// ─────────────────────────────────────────────────────────────────
// RPG LOG — Service Worker
// Versión: incrementa este número cada vez que hagas cambios
// para forzar la actualización del caché en todos los clientes.
// ─────────────────────────────────────────────────────────────────
const CACHE_VERSION = "v5";
const CACHE_NAME    = `rpglog-${CACHE_VERSION}`;

// Assets que se cachean en la instalación inicial
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/logo192.png",
  "/logo512.png",
];

// ── Install ──────────────────────────────────────────────────────
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())   // activa inmediatamente
      .catch((err) => console.warn("[SW] Error en install:", err))
  );
});

// ── Activate — limpia caches de versiones anteriores ─────────────
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME)
            .map((k) => {
              console.log("[SW] Eliminando caché antiguo:", k);
              return caches.delete(k);
            })
        )
      )
      .then(() => self.clients.claim())  // controla todas las pestañas
  );
});

// ── Fetch — estrategia mixta ──────────────────────────────────────
// API → Network First (sin caché)
// Assets → Cache First con actualización en background
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Ignorar extensiones de Chrome y requests no-GET
  if (e.request.method !== "GET") return;
  if (url.protocol === "chrome-extension:") return;

  // ── API calls → siempre red, sin cachear ──
  if (url.pathname.startsWith("/api/")) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(
          JSON.stringify({ ok: false, offline: true, message: "Sin conexión" }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }
        )
      )
    );
    return;
  }

  // ── Assets estáticos → Cache First + background update ──
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const networkFetch = fetch(e.request)
        .then((res) => {
          // Cachear solo respuestas válidas de nuestro dominio
          if (
            res.ok &&
            res.status === 200 &&
            url.origin === location.origin
          ) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => cached || new Response("Offline", { status: 503 }));

      // Si ya tenemos caché, devolver inmediato y actualizar en background
      return cached || networkFetch;
    })
  );
});

// ── Background Sync — envía acciones pendientes al reconectarse ───
self.addEventListener("sync", (e) => {
  if (e.tag === "rpglog-sync") {
    e.waitUntil(syncPendingActions());
  }
});

// ── Push notifications ────────────────────────────────────────────
self.addEventListener("push", (e) => {
  let data = { title: "RPGLog", body: "Tienes misiones pendientes 🎯" };
  try {
    if (e.data) data = e.data.json();
  } catch (_) {}

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    "/logo192.png",
      badge:   "/logo192.png",
      data:    data.url || "/",
      vibrate: [200, 100, 200],
      tag:     "rpglog-notif",          // agrupa notificaciones
      renotify: true,
    })
  );
});

// ── Click en notificación → abrir/enfocar la app ─────────────────
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Si ya hay una ventana abierta, enfocarla
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }
        // Si no hay ventana, abrir una nueva
        return clients.openWindow(e.notification.data || "/");
      })
  );
});

// ─────────────────────────────────────────────────────────────────
// IndexedDB helpers para Background Sync
// ─────────────────────────────────────────────────────────────────
async function syncPendingActions() {
  const pending = await getPendingActions();
  if (!pending.length) return;

  console.log(`[SW] Sincronizando ${pending.length} acción(es) pendiente(s)`);

  for (const action of pending) {
    try {
      const res = await fetch(action.url, {
        method:  action.method || "POST",
        headers: {
          "Content-Type": "application/json",
          ...(action.token ? { Authorization: `Bearer ${action.token}` } : {}),
        },
        body: action.body ? JSON.stringify(action.body) : undefined,
      });
      if (res.ok) {
        await removePendingAction(action.id);
        console.log("[SW] Acción sincronizada:", action.url);
      }
    } catch (err) {
      console.warn("[SW] No se pudo sincronizar:", action.url, err.message);
    }
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("rpglog-offline", 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("pending")) {
        db.createObjectStore("pending", { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

function getPendingActions() {
  return new Promise(async (resolve) => {
    try {
      const db    = await openDB();
      const tx    = db.transaction("pending", "readonly");
      const store = tx.objectStore("pending");
      const req   = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror   = () => resolve([]);
    } catch { resolve([]); }
  });
}

function removePendingAction(id) {
  return new Promise(async (resolve) => {
    try {
      const db    = await openDB();
      const tx    = db.transaction("pending", "readwrite");
      tx.objectStore("pending").delete(id);
      tx.oncomplete = resolve;
      tx.onerror    = resolve;
    } catch { resolve(); }
  });
}
