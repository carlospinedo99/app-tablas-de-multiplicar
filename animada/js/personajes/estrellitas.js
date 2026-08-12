// Tabla del 10 · Estrellitas con cara
import { starPath, svgWrap } from './base.js';
import { faceGroups } from './face.js';

export function renderEstrellitas(expression) {
  const body = '#ffd93d';
  const inner = `
    <path d="${starPath(50, 54, 40, 18)}" fill="${body}" />
    ${faceGroups({ cy: 54 })}
  `;
  return svgWrap('mascota-estrellitas', expression, inner);
}
