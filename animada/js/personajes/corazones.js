// Tabla del 5 · Corazones con caras
import { svgWrap } from './base.js';
import { faceGroups } from './face.js';

export function renderCorazones(expression) {
  const body = '#ff6b8a';
  const shine = '#ffffff';
  const inner = `
    <path d="M 50 80 C 18 56, 16 28, 38 22 C 46 20, 50 28, 50 33 C 50 28, 54 20, 62 22 C 84 28, 82 56, 50 80 Z" fill="${body}" />
    <ellipse cx="35" cy="34" rx="5" ry="3" fill="${shine}" opacity="0.55" transform="rotate(-20 35 34)" />
    ${faceGroups({ cy: 48 })}
  `;
  return svgWrap('mascota-corazones', expression, inner);
}
