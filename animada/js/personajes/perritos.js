// Tabla del 4 · Perritos
import { blobBody, svgWrap, INK } from './base.js';
import { faceGroups } from './face.js';

export function renderPerritos(expression) {
  const body = '#c98b56';
  const earColor = '#a5652f';
  const inner = `
    <ellipse cx="19" cy="58" rx="9" ry="17" fill="${earColor}" transform="rotate(-18 19 58)" />
    <ellipse cx="81" cy="58" rx="9" ry="17" fill="${earColor}" transform="rotate(18 81 58)" />
    ${blobBody({ fill: body })}
    <ellipse cx="50" cy="68" rx="10" ry="7" fill="#fff1d6" />
    <ellipse cx="50" cy="66" rx="3" ry="2.4" fill="${INK}" />
    ${faceGroups({ cy: 58 })}
  `;
  return svgWrap('mascota-perritos', expression, inner);
}
