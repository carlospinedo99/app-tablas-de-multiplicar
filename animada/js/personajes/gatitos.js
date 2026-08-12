// Tabla del 3 · Gatitos
import { blobBody, earsPair, svgWrap, INK } from './base.js';
import { faceGroups } from './face.js';

export function renderGatitos(expression) {
  const body = '#c9c3ee';
  const earInner = '#ffb0d8';
  const inner = `
    ${blobBody({ fill: body })}
    ${earsPair({ shape: 'triangle', size: 11, dx: 20, dy: -25, fill: body })}
    <path d="M 33 33 L 37 24 L 41 33 Z" fill="${earInner}" />
    <path d="M 59 33 L 63 24 L 67 33 Z" fill="${earInner}" />
    <path d="M 8 58 H 23" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" opacity="0.55" />
    <path d="M 9 63 H 24" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" opacity="0.55" />
    <path d="M 77 58 H 92" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" opacity="0.55" />
    <path d="M 76 63 H 91" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" opacity="0.55" />
    <path d="M 47 66 L 53 66 L 50 70 Z" fill="${INK}" opacity="0.75" />
    ${faceGroups({})}
  `;
  return svgWrap('mascota-gatitos', expression, inner);
}
