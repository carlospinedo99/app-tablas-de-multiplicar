// Tabla del 2 · León
import { blobBody, earsPair, petalRing, svgWrap, INK } from './base.js';
import { faceGroups } from './face.js';

export function renderLeon(expression) {
  const body = '#f5a94e';
  const mane = '#e07b1f';
  const snout = '#fff1d6';
  const inner = `
    ${petalRing({ count: 12, radius: 33, petalR: 9, fill: mane })}
    ${blobBody({ fill: body })}
    ${earsPair({ shape: 'triangle', size: 9, dx: 19, dy: -23, fill: mane })}
    <ellipse cx="50" cy="67" rx="12" ry="9" fill="${snout}" />
    <circle cx="50" cy="64" r="2.4" fill="${INK}" />
    ${faceGroups({ cy: 59 })}
  `;
  return svgWrap('mascota-leon', expression, inner);
}
