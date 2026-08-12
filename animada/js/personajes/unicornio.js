// Tabla del 8 · Unicornio
import { blobBody, earsPair, svgWrap } from './base.js';
import { faceGroups } from './face.js';

export function renderUnicornio(expression) {
  const body = '#f5f0ff';
  const horn = '#ffd93d';
  const inner = `
    <path d="M 46 24 L 54 24 L 50 6 Z" fill="${horn}" />
    <path d="M 48 12 L 52 12" stroke="#e0ad00" stroke-width="1.4" />
    <path d="M 47 17 L 53 17" stroke="#e0ad00" stroke-width="1.4" />
    ${earsPair({ shape: 'triangle', size: 9, dx: 18, dy: -24, fill: body })}
    ${blobBody({ fill: body })}
    <path d="M 74 34 Q 90 40 82 54 Q 92 58 84 70" stroke="#ff9fc7" stroke-width="5" fill="none" stroke-linecap="round" />
    <path d="M 72 30 Q 88 34 80 48 Q 90 52 80 64" stroke="#a29bfe" stroke-width="5" fill="none" stroke-linecap="round" />
    <path d="M 70 27 Q 86 29 78 42 Q 88 46 78 58" stroke="#8ec9ff" stroke-width="5" fill="none" stroke-linecap="round" />
    ${faceGroups({})}
  `;
  return svgWrap('mascota-unicornio', expression, inner);
}
