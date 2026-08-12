// Tabla del 7 · Solecitos con cara
import { blobBody, rayRing, svgWrap } from './base.js';
import { faceGroups } from './face.js';

export function renderSolecitos(expression) {
  const body = '#ffcb3d';
  const ray = '#ffb020';
  const inner = `
    ${rayRing({ count: 10, innerR: 30, outerR: 44, width: 6, fill: ray })}
    ${blobBody({ fill: body })}
    ${faceGroups({})}
  `;
  return svgWrap('mascota-solecitos', expression, inner);
}
