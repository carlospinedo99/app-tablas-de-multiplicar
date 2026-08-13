// Registro de personajes: conecta characterId (definido en shared/js/data/tables.js)
// con su carpeta de imágenes en img/personajes/. Cada carpeta tiene 4 PNG
// (neutral.png, feliz.png, triste.png, celebrando.png) generados con IA.
import { getTableMeta } from '../../../shared/js/data/tables.js';

const FOLDERS = {
  princesa: '01-princesa',
  leon: '02-leon',
  gatitos: '03-gatitos',
  perritos: '04-perritos',
  corazones: '05-corazones',
  caritas: '06-caritas',
  solecitos: '07-solecitos',
  unicornio: '08-unicornio',
  capibaras: '09-capibaras',
  estrellitas: '10-estrellitas',
  hadas: '11-hadas',
  delfines: '12-delfines',
};

export function characterImgSrc(characterId, expression) {
  const folder = FOLDERS[characterId];
  if (!folder) throw new Error(`Sin personaje para: ${characterId}`);
  return `img/personajes/${folder}/${expression}.png`;
}

export function renderCharacter(tableId, expression = 'neutral') {
  const { characterId } = getTableMeta(tableId);
  const src = characterImgSrc(characterId, expression);
  return `<img class="mascota" src="${src}" data-character="${characterId}" data-expr="${expression}" alt="" />`;
}
