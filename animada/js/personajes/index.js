// Registro de personajes: conecta characterId (definido en shared/js/data/tables.js)
// con su función de render. Esta es la única superficie de contacto entre el
// motor compartido y el sistema de personajes de la versión Animada.
import { renderPrincesa } from './princesa.js';
import { renderLeon } from './leon.js';
import { renderGatitos } from './gatitos.js';
import { renderPerritos } from './perritos.js';
import { renderCorazones } from './corazones.js';
import { renderCaritas } from './caritas.js';
import { renderSolecitos } from './solecitos.js';
import { renderUnicornio } from './unicornio.js';
import { renderCapibaras } from './capibaras.js';
import { renderEstrellitas } from './estrellitas.js';
import { renderHadas } from './hadas.js';
import { renderDelfines } from './delfines.js';
import { getTableMeta } from '../../../shared/js/data/tables.js';

const REGISTRY = {
  princesa: renderPrincesa,
  leon: renderLeon,
  gatitos: renderGatitos,
  perritos: renderPerritos,
  corazones: renderCorazones,
  caritas: renderCaritas,
  solecitos: renderSolecitos,
  unicornio: renderUnicornio,
  capibaras: renderCapibaras,
  estrellitas: renderEstrellitas,
  hadas: renderHadas,
  delfines: renderDelfines,
};

export function renderCharacter(tableId, expression = 'neutral') {
  const { characterId } = getTableMeta(tableId);
  const renderFn = REGISTRY[characterId];
  if (!renderFn) throw new Error(`Sin personaje para: ${characterId}`);
  return renderFn(expression);
}
