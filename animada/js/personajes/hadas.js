// Tabla del 11 · Hadas
import { blobBody, earsPair, starPath, svgWrap } from './base.js';
import { faceGroups } from './face.js';

export function renderHadas(expression) {
  const body = '#e3b8ff';
  const wing = '#cbe8ff';
  const wandColor = '#ffd93d';
  const inner = `
    <ellipse cx="24" cy="48" rx="16" ry="22" fill="${wing}" opacity="0.65" transform="rotate(-20 24 48)" />
    <ellipse cx="76" cy="48" rx="16" ry="22" fill="${wing}" opacity="0.65" transform="rotate(20 76 48)" />
    ${blobBody({ fill: body })}
    ${earsPair({ shape: 'circle', size: 6, dx: 19, dy: -26, fill: body })}
    <path d="M 78 78 L 88 90" stroke="#a5652f" stroke-width="2.4" stroke-linecap="round" />
    <path d="${starPath(89, 90, 6, 3)}" fill="${wandColor}" />
    ${faceGroups({})}
  `;
  return svgWrap('mascota-hadas', expression, inner);
}
