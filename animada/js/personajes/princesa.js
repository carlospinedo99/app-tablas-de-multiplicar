// Tabla del 1 · Princesa
import { blobBody, svgWrap } from './base.js';
import { faceGroups } from './face.js';

export function renderPrincesa(expression) {
  const body = '#ffb0d8';
  const hair = '#8a5a3c';
  const crown = '#ffd93d';
  const inner = `
    <circle cx="23" cy="50" r="11" fill="${hair}" />
    <circle cx="77" cy="50" r="11" fill="${hair}" />
    ${blobBody({ fill: body })}
    <path d="M 34 30 L 40 16 L 46 28 L 50 14 L 54 28 L 60 16 L 66 30 Z" fill="${crown}" />
    <circle cx="50" cy="19" r="2.6" fill="#ff6b9c" />
    ${faceGroups({})}
  `;
  return svgWrap('mascota-princesa', expression, inner);
}
