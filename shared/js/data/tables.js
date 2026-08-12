// Metadatos estáticos de las 12 tablas de multiplicar.
// characterId se usa solo en la versión Animada (registry en animada/js/personajes/index.js).
export const TABLES = [
  { id: 1, label: 'Tabla del 1', characterId: 'princesa', unlockGroup: 'base' },
  { id: 2, label: 'Tabla del 2', characterId: 'leon', unlockGroup: 'base' },
  { id: 3, label: 'Tabla del 3', characterId: 'gatitos', unlockGroup: 'base' },
  { id: 4, label: 'Tabla del 4', characterId: 'perritos', unlockGroup: 'base' },
  { id: 5, label: 'Tabla del 5', characterId: 'corazones', unlockGroup: 'base' },
  { id: 6, label: 'Tabla del 6', characterId: 'caritas', unlockGroup: 'base' },
  { id: 7, label: 'Tabla del 7', characterId: 'solecitos', unlockGroup: 'base' },
  { id: 8, label: 'Tabla del 8', characterId: 'unicornio', unlockGroup: 'base' },
  { id: 9, label: 'Tabla del 9', characterId: 'capibaras', unlockGroup: 'base' },
  { id: 10, label: 'Tabla del 10', characterId: 'estrellitas', unlockGroup: 'base' },
  { id: 11, label: 'Tabla del 11', characterId: 'hadas', unlockGroup: 'extra' },
  { id: 12, label: 'Tabla del 12', characterId: 'delfines', unlockGroup: 'extra' },
];

export const BASE_TABLE_IDS = TABLES.filter(t => t.unlockGroup === 'base').map(t => t.id);
export const EXTRA_TABLE_IDS = TABLES.filter(t => t.unlockGroup === 'extra').map(t => t.id);

export function getTableMeta(tableId) {
  const meta = TABLES.find(t => t.id === Number(tableId));
  if (!meta) throw new Error(`Tabla desconocida: ${tableId}`);
  return meta;
}

export const FACTORS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const GAME_KEYS = ['juego1', 'juego2', 'juego3'];

export const GAME_META = {
  juego1: { title: 'Descubre', difficulty: 'facil', mode: 'visual-choice' },
  juego2: { title: 'Practica', difficulty: 'medio', mode: 'choice' },
  juego3: { title: 'Desafío rápido', difficulty: 'dificil', mode: 'type' },
};
