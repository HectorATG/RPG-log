/**
 * HomeScreen.jsx — Pantalla principal (dashboard)
 * ─────────────────────────────────────────────────────
 * Cuando authData está disponible (login/registro real), inicializa
 * el perfil, stats y monedas con los datos del backend via
 * mapProfile() y mapStats() de services/api.js.
 *
 * Si authData es null (modo invitado), usa los datos locales de siempre.
 *
 * Nueva prop:
 *   authData ({ user, profile, stats } | null) — respuesta del backend
 */
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import "../styles/globals.css";
import "../styles/HomeScreen.css";

import Navbar          from "../components/Navbar";
import HeroSection     from "../components/HeroSection";
import StatCards       from "../components/StatCards";
import ProgressSection from "../components/ProgressSection";
import MissionsScreen  from "./MissionsScreen";
import MiniGamesScreen from "./MiniGamesScreen";
import ShopScreen      from "./ShopScreen";
import SettingsScreen  from "./SettingsScreen";

import { NOTIFICATIONS_DATA } from "../data/settings";
import { INITIAL_STATS } from "../data/constants";
import { TITLES_DATA }          from "../data/shop";
import { mapProfile, mapStats } from "../services/api";

// ── ID de usuario sanitizado ─────────────────────────────────────
const sanitize = (name) => (name || "user").toLowerCase().replace(/\s+/g, "_");

// ── Claves de localStorage por usuario ──────────────────────────
const lsTitles  = (u) => `rpglog_titles_${u}`;
const lsCustoms = (u) => `rpglog_customs_${u}`;
const lsSlots   = (u) => `rpglog_slots_${u}`;
const lsNotifs  = (u) => `rpglog_notifs_${u}`;
const lsRecords = (u) => `rpglog_records_${u}`;
const lsGps     = (u) => `rpglog_gps_${u}`;

// ── Helpers localStorage ─────────────────────────────────────────
function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ── Lógica de subida de nivel ────────────────────────────────────
function applyXpGain(currentXp, gained, currentMax, currentLevel, maxMult) {
  let xp = currentXp + gained, level = currentLevel, max = currentMax;
  while (xp >= max) { xp -= max; level++; max = Math.round(max * maxMult); }
  return { newXp: xp, newLevel: level, newMax: max };
}

// ── Perfiles iniciales (modo invitado / sin authData) ────────────
const buildNewUser = (name) => ({ name, avatar:"🧙", title:'"Aventurero"', level:1, xp:0, xpMax:300 });

// ── Estado inicial de títulos ────────────────────────────────────
function loadTitlesState(userId) {
  const saved = lsGet(lsTitles(userId), null);
  if (saved) return { ownedIds: new Set(saved.ownedIds || ["t0","t1","t2"]), equippedId: saved.equippedId || "t0" };
  return { ownedIds: new Set(["t0","t1","t2"]), equippedId: "t0" };
}

// ── Timestamp legible ────────────────────────────────────────────
function nowLabel() {
  const d = new Date();
  return `HOY ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

let _notifIdCounter = Date.now();
const nextId = () => ++_notifIdCounter;

export default function HomeScreen({ initialName, isNewAccount, authData, onLogout }) {
  // userId: preferimos el _id del backend para aislar localStorage por cuenta real
  const userId = useMemo(() => {
    if (authData?.user?._id) return sanitize(authData.user._id);
    return sanitize(initialName);
  }, [initialName, authData]);

  const [activePage,    setActivePage]    = useState("home");
  const [showDropdown,  setShowDropdown]  = useState(false);
  const [showNotifPanel,setShowNotifPanel]= useState(false);
  const [showHamburger, setShowHamburger] = useState(false);
  const [completedToday,setCompletedToday]= useState([]);

  // ── Perfil — usa datos del backend si están disponibles ─────────
  const [user, setUser] = useState(() => {
    if (authData?.profile && authData?.user) {
      return mapProfile(authData.profile, authData.user);
    }
    return buildNewUser(initialName);
  });

  const [stats, setStats] = useState(() => {
    if (authData?.stats?.length) {
      return mapStats(authData.stats);
    }
    return INITIAL_STATS.map(s => ({ ...s }));
  });

  const [coins, setCoins] = useState(() => {
    if (authData?.profile) return authData.profile.coins ?? 0;
    return 0;
  });

  // ── Notificaciones ───────────────────────────────────────────────
  const [notifs, setNotifsRaw] = useState(() => lsGet(lsNotifs(userId), NOTIFICATIONS_DATA));
  const setNotifs = useCallback((val) => {
    setNotifsRaw(prev => {
      const next = typeof val === "function" ? val(prev) : val;
      lsSet(lsNotifs(userId), next);
      return next;
    });
  }, [userId]);

  const addNotification = useCallback((notif) => {
    setNotifs(prev => [{ ...notif, id: nextId(), read: false, time: nowLabel() }, ...prev].slice(0, 50));
  }, [setNotifs]);

  // ── Récords de minijuegos ────────────────────────────────────────
  const [records, setRecords] = useState(() => lsGet(lsRecords(userId), {}));

  // ── GPS ──────────────────────────────────────────────────────────
  const [gpsEnabled,  setGpsEnabled]  = useState(() => lsGet(lsGps(userId), false));
  const [gpsStatus,   setGpsStatus]   = useState("disabled");
  const [lastCoords,  setLastCoords]  = useState(null);
  const gpsWatchRef = useRef(null);

  // ── Títulos ──────────────────────────────────────────────────────
  const [titlesState, setTitlesState] = useState(() => loadTitlesState(userId));
  const { ownedIds, equippedId } = titlesState;

  // ── Misiones custom + slots ──────────────────────────────────────
  const [customMissions,   setCustomMissionsRaw] = useState(() => lsGet(lsCustoms(userId), []));
  const [unlockedSlots,    setUnlockedSlotsRaw]  = useState(() => new Set(lsGet(lsSlots(userId), [])));

  const setCustomMissions = useCallback((val) => {
    setCustomMissionsRaw(prev => { const next = typeof val === "function" ? val(prev) : val; lsSet(lsCustoms(userId), next); return next; });
  }, [userId]);

  const setUnlockedSlots = useCallback((val) => {
    setUnlockedSlotsRaw(prev => {
      const next = typeof val === "function" ? val(prev) : val;
      lsSet(lsSlots(userId), [...next]);
      return next;
    });
  }, [userId]);

  // ── Bonus del título equipado ────────────────────────────────────
  const titleBonus = useMemo(() => {
    const t = TITLES_DATA.find(t => t.id === equippedId) || TITLES_DATA[0];
    return t.bonus || { xpGlobal:1.0, coinBonus:0, xpStat:null, xpStatMult:1.0 };
  }, [equippedId]);

  // ── Notificación de misión especial al llegar a nivel 5 ─────────
  const prevLevelRef = useRef(user.level);
  useEffect(() => {
    const prev = prevLevelRef.current;
    if (prev < 5 && user.level >= 5) {
      addNotification({ icon:"⚡", title:"¡MISIÓN ESPECIAL DESBLOQUEADA!", desc:"Alcanzaste el nivel 5. La misión especial del día ya está disponible. ¡Doble XP!" });
    }
    prevLevelRef.current = user.level;
  }, [user.level, addNotification]);

  // ── Monitor timer de misiones custom ────────────────────────────
  const notifiedCustomRef = useRef(new Set());
  useEffect(() => {
    const id = setInterval(() => {
      customMissions.forEach((m, i) => {
        if (!m.done && !notifiedCustomRef.current.has(i)) {
          const left = m.durationMs - (Date.now() - m.startedAt);
          if (left <= 0) {
            notifiedCustomRef.current.add(i);
            addNotification({ icon:"⏰", title:"¡MISIÓN CUSTOM LISTA!", desc:`Tu misión "${m.name}" terminó. ¡Reclama tus recompensas! +${m.xp} XP · 🪙${m.cost}` });
          }
        }
      });
    }, 5000);
    return () => clearInterval(id);
  }, [customMissions, addNotification]);

  // ── Aplicar recompensas con bonus de título ──────────────────────
  const applyRewards = useCallback((xp, coinAmt, statName, statId) => {
    const boosted   = Math.round(xp * titleBonus.xpGlobal);
    const finalXp   = (titleBonus.xpStat && titleBonus.xpStat === statId) ? Math.round(boosted * titleBonus.xpStatMult) : boosted;
    const finalCoins = coinAmt + titleBonus.coinBonus;
    if (statName || statId) {
      setStats(prev => prev.map(s => {
        const match = statId ? s.id === statId : s.name === statName;
        if (!match) return s;
        const { newXp, newLevel: nl, newMax } = applyXpGain(s.xp, finalXp, s.max, s.lv, 1.4);
        return { ...s, xp: newXp, lv: nl, max: newMax };
      }));
    }
    setUser(prev => {
      const { newXp, newLevel: nl, newMax } = applyXpGain(prev.xp, finalXp, prev.xpMax, prev.level, 1.5);
      return { ...prev, xp: newXp, level: nl, xpMax: newMax };
    });
    setCoins(prev => prev + finalCoins);
    return { finalXp, finalCoins };
  }, [titleBonus]);

  // ── GPS watcher ──────────────────────────────────────────────────
  useEffect(() => {
    if (!gpsEnabled) {
      if (gpsWatchRef.current !== null) {
        navigator.geolocation?.clearWatch(gpsWatchRef.current);
        gpsWatchRef.current = null;
      }
      setGpsStatus("disabled");
      setLastCoords(null);
      return;
    }
    if (!navigator.geolocation) { setGpsStatus("unsupported"); return; }
    setGpsStatus("requesting");
    gpsWatchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsStatus("active");
        setLastCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy, capturedAt: new Date().toISOString() });
      },
      () => { setGpsStatus("denied"); setGpsEnabled(false); lsSet(lsGps(userId), false); },
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 }
    );
    return () => {
      if (gpsWatchRef.current !== null) { navigator.geolocation?.clearWatch(gpsWatchRef.current); gpsWatchRef.current = null; }
    };
  }, [gpsEnabled, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleGps = useCallback(() => {
    const next = !gpsEnabled;
    setGpsEnabled(next);
    lsSet(lsGps(userId), next);
  }, [gpsEnabled, userId]);

  // ── Callback: misión del sistema completada ──────────────────────
  const handleMissionDone = useCallback((mission, rawXp) => {
    const statNames = mission.stats ? mission.stats.map(s => s.label) : [mission.stat];
    const xpPerStat = Math.round(rawXp / statNames.length);

    setStats(prev => prev.map(s => {
      if (!statNames.includes(s.name)) return s;
      const boosted = Math.round(xpPerStat * titleBonus.xpGlobal * (titleBonus.xpStat === s.id ? titleBonus.xpStatMult : 1));
      const { newXp, newLevel, newMax } = applyXpGain(s.xp, boosted, s.max, s.lv, 1.4);
      return { ...s, xp: newXp, lv: newLevel, max: newMax };
    }));

    const finalXp    = Math.round(rawXp * titleBonus.xpGlobal);
    const finalCoins = mission.coins + titleBonus.coinBonus;

    setUser(prev => {
      const { newXp, newLevel: nl, newMax } = applyXpGain(prev.xp, finalXp, prev.xpMax, prev.level, 1.5);
      return { ...prev, xp: newXp, level: nl, xpMax: newMax };
    });
    setCoins(prev => prev + finalCoins);
    setCompletedToday(prev => [...prev, {
      id: mission.id, name: mission.name,
      stat: statNames[0], icon: mission.stats ? mission.stats[0].icon : mission.icon,
      color: mission.stats ? mission.stats[0].color : mission.color,
      earnedXp: finalXp, coins: finalCoins,
    }]);

    addNotification({
      icon:  mission.stats ? "⚡" : mission.icon || "⚔️",
      title: "¡MISIÓN COMPLETADA!",
      desc:  `"${mission.name}" — +${finalXp} XP · 🪙 +${finalCoins}`,
    });
  }, [titleBonus, addNotification]);

  // ── Callback: minijuego terminado ────────────────────────────────
  const handleGameDone = useCallback((xp, gameCoins, statName, gameId, score) => {
    const { finalXp, finalCoins } = applyRewards(xp, gameCoins, statName, null);
    addNotification({ icon:"🎮", title:"¡PARTIDA TERMINADA!", desc:`+${finalXp} XP en ${statName} · 🪙 +${finalCoins} — Puntuación: ${score || xp}` });
    if (gameId && score !== undefined) {
      const prev = records[gameId] || 0;
      if (score > prev) {
        const newRec = { ...records, [gameId]: score };
        setRecords(newRec);
        lsSet(lsRecords(userId), newRec);
        addNotification({ icon:"🏆", title:"¡NUEVO RÉCORD!", desc:`Superaste tu récord en ${gameId}: ${score} puntos (anterior: ${prev})` });
      }
    }
  }, [applyRewards, addNotification, records, userId]);

  // ── Callback: misión custom completada ──────────────────────────
  const handleCustomMissionComplete = useCallback((mission) => {
    const { finalXp, finalCoins } = applyRewards(mission.xp, mission.cost, null, null);
    addNotification({ icon:"⚙️", title:"¡MISIÓN CUSTOM COMPLETADA!", desc:`"${mission.name}" — +${finalXp} XP · 🪙 +${finalCoins}` });
  }, [applyRewards, addNotification]);

  // ── Gestión de títulos ───────────────────────────────────────────
  const handleBuyTitle = (title) => {
    setTitlesState(prev => {
      const next = { ownedIds: new Set([...prev.ownedIds, title.id]), equippedId: prev.equippedId };
      lsSet(lsTitles(userId), { ownedIds: [...next.ownedIds], equippedId: next.equippedId });
      return next;
    });
    addNotification({ icon:"🏷️", title:"TÍTULO DESBLOQUEADO", desc:`Obtuviste el título "${title.name}". ¡Equípalo desde la tienda!` });
  };

  const handleEquipTitle = (title) => {
    setTitlesState(prev => {
      lsSet(lsTitles(userId), { ownedIds: [...prev.ownedIds], equippedId: title.id });
      return { ...prev, equippedId: title.id };
    });
    setUser(prev => ({ ...prev, title: title.preview }));
    addNotification({ icon:"👑", title:"TÍTULO EQUIPADO", desc:`Ahora llevas el título ${title.name}.` });
  };

  const handleUnequipTitle = () => {
    const def = TITLES_DATA[0];
    setTitlesState(prev => {
      lsSet(lsTitles(userId), { ownedIds: [...prev.ownedIds], equippedId: def.id });
      return { ...prev, equippedId: def.id };
    });
    setUser(prev => ({ ...prev, title: def.preview }));
  };

  const handleAppClick = () => {
    if (showDropdown)   setShowDropdown(false);
    if (showNotifPanel) setShowNotifPanel(false);
    if (showHamburger)  setShowHamburger(false);
  };

  const unreadCount    = notifs.filter(n => !n.read).length;
  const isSettingsPage = activePage.startsWith("settings");

  return (
    <div className="app" onClick={handleAppClick}>
      <div className="scanlines" />

      <Navbar
        active={activePage}
        setActive={setActivePage}
        coins={coins}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        showNotifPanel={showNotifPanel}
        setShowNotifPanel={setShowNotifPanel}
        showHamburger={showHamburger}
        setShowHamburger={setShowHamburger}
        unreadCount={unreadCount}
        notifs={notifs}
        setNotifs={setNotifs}
        user={user}
      />

      {activePage === "home" && (
        <div className="page">
          <HeroSection user={user} />
          <StatCards   stats={stats} />
          <ProgressSection completedToday={completedToday} />
        </div>
      )}

      {activePage === "missions" && (
        <MissionsScreen
          onMissionDone={handleMissionDone}
          userLevel={user.level}
          userId={userId}
          gpsEnabled={gpsEnabled}
          lastCoords={lastCoords}
        />
      )}

      {activePage === "minigames" && (
        <MiniGamesScreen onGameDone={handleGameDone} />
      )}

      {activePage === "shop" && (
        <ShopScreen
          coins={coins}
          setCoins={setCoins}
          userLevel={user.level}
          ownedIds={ownedIds}
          equippedId={equippedId}
          onBuyTitle={handleBuyTitle}
          onEquipTitle={handleEquipTitle}
          onUnequipTitle={handleUnequipTitle}
          customMissions={customMissions}
          setCustomMissions={setCustomMissions}
          onMissionComplete={handleCustomMissionComplete}
          unlockedSlots={unlockedSlots}
          setUnlockedSlots={setUnlockedSlots}
        />
      )}

      {isSettingsPage && (
        <SettingsScreen
          section={activePage}
          user={{ ...user, coins }}
          setUser={setUser}
          notifs={notifs}
          setNotifs={setNotifs}
          onLogout={onLogout}
          gpsEnabled={gpsEnabled}
          gpsStatus={gpsStatus}
          lastCoords={lastCoords}
          onToggleGps={handleToggleGps}
        />
      )}
    </div>
  );
}
