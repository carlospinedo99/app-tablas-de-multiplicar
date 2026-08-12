// Tabla del 6 · Emojis de caritas felices
import { blobBody, svgWrap } from './base.js';
import { faceGroups } from './face.js';

export function renderCaritas(expression) {
  const body = '#ffd93d';
  const inner = `
    ${blobBody({ fill: body })}
    ${faceGroups({})}
  `;
  return svgWrap('mascota-caritas', expression, inner);
}
