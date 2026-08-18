// Persistencia y reglas de negocio del progreso de quien esté jugando.
// Un único objeto en localStorage, versionado para poder migrar sin perder progreso.
import { BASE_TABLE_IDS, EXTRA_TABLE_IDS, GAME_KEYS } from '../data/tables.js';

const STORAGE_KEY = 'tablasCamila.progress.v1';
const SCHEMA_VERSION = 3;

// Calificación mínima (sobre 10) para desbloquear la siguiente dificultad
// dentro de una misma tabla: Fácil (juego1) → Medio (juego2) → Difícil (juego3).
const PASS_THRESHOLD = 7;

function emptyTableProgress() {
  return {
    juego1: { played: false, bestScore: 0, lastPlayedAt: null },
    juego2: { played: false, bestScore: 0, lastPlayedAt: null },
    juego3: { played: false, bestScore: 0, lastPlayedAt: null },
    retoFinal: { completed: false, attemptsUntilSuccess: 0, completedAt: null },
  };
}

function defaultState() {
  const tables = {};
  for (const id of [...BASE_TABLE_IDS, ...EXTRA_TABLE_IDS]) {
    tables[id] = emptyTableProgress();
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    unlockedBase: [1],
    unlockedExtra: false,
    tables,
    settings: {
      voiceMuted: false,
      voiceEnabled: true,
      audioMuted: false,
      preferredVoiceURI: null,
      dificilTimeMs: 11000,
      retoTimeMs: 9000,
      // null = sin tope manual: progreso normal (fácil→difícil→Reto Final,
      // tabla por tabla) sin intervención del adulto.
      maxUnlockedTable: null,
    },
  };
}

let memoryState = null;
let persistenceAvailable = true;

function migrate(data) {
  if (!data || typeof data !== 'object') return defaultState();
  if (data.schemaVersion === SCHEMA_VERSION) return data;
  if (data.schemaVersion === 1) {
    // v1 tenía un solo settings.muted para todo; se separa en voz vs
    // música+efectos, conservando el resto del progreso tal cual.
    const oldMuted = !!data.settings?.muted;
    data.settings = {
      voiceMuted: oldMuted,
      audioMuted: oldMuted,
      voiceEnabled: data.settings?.voiceEnabled ?? true,
      preferredVoiceURI: data.settings?.preferredVoiceURI ?? null,
    };
    data.schemaVersion = 2;
  }
  if (data.schemaVersion === 2) {
    // v2 no tenía ajustes de tiempo de respuesta ni tope de tablas
    // desbloqueables (ambos configurables ahora desde Ajustes).
    data.settings.dificilTimeMs = data.settings.dificilTimeMs ?? 11000;
    data.settings.retoTimeMs = data.settings.retoTimeMs ?? 9000;
    data.settings.maxUnlockedTable = data.settings.maxUnlockedTable ?? null;
    data.schemaVersion = 3;
  }
  return data;
}

function load() {
  if (memoryState) return memoryState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    memoryState = raw ? migrate(JSON.parse(raw)) : defaultState();
  } catch (err) {
    persistenceAvailable = false;
    memoryState = defaultState();
  }
  return memoryState;
}

function save() {
  if (!persistenceAvailable) return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryState));
    return true;
  } catch (err) {
    persistenceAvailable = false;
    return false;
  }
}

export function isPersistenceAvailable() {
  return persistenceAvailable;
}

export function getState() {
  return load();
}

export function getSettings() {
  return load().settings;
}

export function setVoiceMuted(muted) {
  const s = load();
  s.settings.voiceMuted = muted;
  save();
  return s.settings;
}

export function setAudioMuted(muted) {
  const s = load();
  s.settings.audioMuted = muted;
  save();
  return s.settings;
}

export function setPreferredVoice(voiceURI) {
  const s = load();
  s.settings.preferredVoiceURI = voiceURI;
  save();
}

export function getDificilTimeMs() {
  return load().settings.dificilTimeMs;
}

export function setDificilTimeMs(ms) {
  const s = load();
  s.settings.dificilTimeMs = ms;
  save();
  return s.settings;
}

export function getRetoTimeMs() {
  return load().settings.retoTimeMs;
}

export function setRetoTimeMs(ms) {
  const s = load();
  s.settings.retoTimeMs = ms;
  save();
  return s.settings;
}

export function getMaxUnlockedTable() {
  return load().settings.maxUnlockedTable;
}

// El adulto elige directamente hasta qué tabla queda jugable (sin exigir
// haber completado las anteriores). El progreso ganado por juego normal
// (unlockedBase) se conserva aparte y nunca se oculta si luego baja el tope.
export function setMaxUnlockedTable(maxTable) {
  const s = load();
  s.settings.maxUnlockedTable = maxTable;
  save();
  return s.settings;
}

// Dentro de una tabla, Fácil siempre está disponible; Medio y Difícil se
// ganan superando el juego anterior con más de PASS_THRESHOLD (sobre 10).
export function isJuegoUnlocked(tableId, juegoKey) {
  const t = getTableProgress(tableId);
  if (!t) return false;
  if (juegoKey === 'juego1') return true;
  if (juegoKey === 'juego2') return t.juego1.bestScore > PASS_THRESHOLD;
  if (juegoKey === 'juego3') return t.juego2.bestScore > PASS_THRESHOLD;
  return false;
}

export function isTableUnlocked(tableId) {
  const s = load();
  const id = Number(tableId);
  if (BASE_TABLE_IDS.includes(id)) {
    const cap = s.settings.maxUnlockedTable;
    return s.unlockedBase.includes(id) || (cap != null && id <= cap);
  }
  if (EXTRA_TABLE_IDS.includes(id)) return s.unlockedExtra;
  return false;
}

// Todas las tablas desbloqueadas en este momento, en orden. Se usa para el
// Repaso mixto de Práctica libre: el conjunto queda fijo al presionar el
// botón, no cambia si se desbloquea algo más durante la ronda.
export function getUnlockedTableIds() {
  const s = load();
  const cap = s.settings.maxUnlockedTable;
  const base = BASE_TABLE_IDS.filter(id => s.unlockedBase.includes(id) || (cap != null && id <= cap));
  const extra = s.unlockedExtra ? EXTRA_TABLE_IDS : [];
  return [...base, ...extra];
}

export function getTableProgress(tableId) {
  return load().tables[tableId];
}

export function canAttemptRetoFinal(tableId) {
  const t = getTableProgress(tableId);
  if (!t) return false;
  return GAME_KEYS.every(key => t[key].played);
}

export function isTableCompleted(tableId) {
  const t = getTableProgress(tableId);
  return !!t && t.retoFinal.completed;
}

export function recordJuegoResult(tableId, juegoKey, score) {
  const s = load();
  const t = s.tables[tableId];
  t[juegoKey].played = true;
  t[juegoKey].bestScore = Math.max(t[juegoKey].bestScore, score);
  t[juegoKey].lastPlayedAt = new Date().toISOString();
  save();
  return t[juegoKey];
}

export function recordRetoFinalAttemptFailed(tableId) {
  const s = load();
  s.tables[tableId].retoFinal.attemptsUntilSuccess += 1;
  save();
}

// Devuelve { justUnlockedNextBase, justUnlockedExtra } para que la UI pueda celebrar el desbloqueo.
export function recordRetoFinalSuccess(tableId) {
  const s = load();
  const id = Number(tableId);
  const t = s.tables[id];
  t.retoFinal.attemptsUntilSuccess += 1;
  t.retoFinal.completed = true;
  t.retoFinal.completedAt = new Date().toISOString();

  let justUnlockedNextBase = null;
  let justUnlockedExtra = false;

  if (BASE_TABLE_IDS.includes(id)) {
    const idx = BASE_TABLE_IDS.indexOf(id);
    const next = BASE_TABLE_IDS[idx + 1];
    const cap = s.settings.maxUnlockedTable ?? BASE_TABLE_IDS.length;
    if (next && next <= cap && !s.unlockedBase.includes(next)) {
      s.unlockedBase.push(next);
      justUnlockedNextBase = next;
    }
    const allBaseDone = BASE_TABLE_IDS.every(bid => s.tables[bid].retoFinal.completed);
    if (allBaseDone && !s.unlockedExtra) {
      s.unlockedExtra = true;
      justUnlockedExtra = true;
    }
  }

  save();
  return { justUnlockedNextBase, justUnlockedExtra };
}

// Marca como completadas todas las tablas anteriores a tableId y desbloquea
// tableId, sin jugar. Pensado para un enlace de acceso directo (ver
// app-core.js), no se expone en ninguna pantalla del juego.
export function forceUnlockThrough(tableId) {
  const s = load();
  const id = Number(tableId);
  const idx = BASE_TABLE_IDS.indexOf(id);
  if (idx === -1) return;
  for (let i = 0; i < idx; i++) {
    const priorId = BASE_TABLE_IDS[i];
    const t = s.tables[priorId];
    for (const key of GAME_KEYS) {
      t[key].played = true;
      t[key].bestScore = 10;
    }
    t.retoFinal.completed = true;
    if (!t.retoFinal.completedAt) t.retoFinal.completedAt = new Date().toISOString();
    if (!s.unlockedBase.includes(priorId)) s.unlockedBase.push(priorId);
  }
  if (!s.unlockedBase.includes(id)) s.unlockedBase.push(id);
  save();
}

export function resetAllProgress() {
  memoryState = defaultState();
  save();
  return memoryState;
}
