// Tabla del 9 · Capibaras
import { blobBody, earsPair, svgWrap, INK } from './base.js';
import { faceGroups } from './face.js';

export function renderCapibaras(expression) {
  const body = '#b98a5e';
  const snout = '#d9b48f';
  const inner = `
    ${earsPair({ shape: 'circle', size: 7, dx: 22, dy: -26, fill: body })}
    ${blobBody({ fill: body, r: 32 })}
    <ellipse cx="50" cy="72" rx="16" ry="10" fill="${snout}" />
    <ellipse cx="50" cy="70" rx="3.2" ry="2.4" fill="${INK}" />
    ${faceGroups({ cy: 58 })}
  `;
  return svgWrap('mascota-capibaras', expression, inner);
}
