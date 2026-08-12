// Persistencia y reglas de negocio del progreso de Camila.
// Un único objeto en localStorage, versionado para poder migrar sin perder progreso.
import { BASE_TABLE_IDS, EXTRA_TABLE_IDS, GAME_KEYS } from '../data/tables.js';

const STORAGE_KEY = 'tablasCamila.progress.v1';
const SCHEMA_VERSION = 1;

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
    settings: { muted: false, voiceEnabled: true, preferredVoiceURI: null },
  };
}

let memoryState = null;
let persistenceAvailable = true;

function migrate(data) {
  // Punto único de migración futura: si cambia el schema, transformar aquí por versión.
  if (!data || typeof data !== 'object') return defaultState();
  if (data.schemaVersion === SCHEMA_VERSION) return data;
  return defaultState();
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

export function setMuted(muted) {
  const s = load();
  s.settings.muted = muted;
  save();
  return s.settings;
}

export function setPreferredVoice(voiceURI) {
  const s = load();
  s.settings.preferredVoiceURI = voiceURI;
  save();
}

export function isTableUnlocked(tableId) {
  const s = load();
  const id = Number(tableId);
  if (BASE_TABLE_IDS.includes(id)) return s.unlockedBase.includes(id);
  if (EXTRA_TABLE_IDS.includes(id)) return s.unlockedExtra;
  return false;
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
    if (next && !s.unlockedBase.includes(next)) {
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
