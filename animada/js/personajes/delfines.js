// Tabla del 12 · Delfines
import { svgWrap } from './base.js';
import { faceGroups } from './face.js';

export function renderDelfines(expression) {
  const body = '#7fb3d5';
  const belly = '#eaf6ff';
  const inner = `
    <path d="M 38 84 L 50 74 L 62 84 L 50 80 Z" fill="${body}" />
    <path d="M 20 60 L 6 52 L 14 70 Z" fill="${body}" />
    <path d="M 80 60 L 94 52 L 86 70 Z" fill="${body}" />
    <circle cx="50" cy="56" r="30" fill="${body}" />
    <ellipse cx="50" cy="70" rx="13" ry="8" fill="${belly}" />
    <path d="M 60 30 L 70 10 L 72 34 Z" fill="${body}" />
    ${faceGroups({})}
  `;
  return svgWrap('mascota-delfines', expression, inner);
}
