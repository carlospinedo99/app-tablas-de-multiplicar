// Las 4 expresiones de cada personaje, dibujadas TODAS dentro del mismo SVG
// (cada una en su <g class="expr-XXX">) y alternadas por CSS según el
// atributo data-expr del <svg> — así reaccionar a una respuesta es solo
// cambiar un atributo, sin volver a renderizar el DOM.
import { INK } from './base.js';

export function faceGroups({ cx = 50, cy = 60, eyeColor = INK, mouthColor = INK } = {}) {
  return `
    <g class="expr-group expr-neutral">
      <circle class="mascota-eye" cx="${cx - 12}" cy="${cy - 4}" r="4" fill="${eyeColor}" />
      <circle class="mascota-eye" cx="${cx + 12}" cy="${cy - 4}" r="4" fill="${eyeColor}" />
      <path d="M ${cx - 7} ${cy + 11} H ${cx + 7}" stroke="${mouthColor}" stroke-width="3" stroke-linecap="round" fill="none" />
    </g>
    <g class="expr-group expr-feliz">
      <path d="M ${cx - 16} ${cy - 4} Q ${cx - 12} ${cy - 10} ${cx - 8} ${cy - 4}" stroke="${eyeColor}" stroke-width="3.2" stroke-linecap="round" fill="none" />
      <path d="M ${cx + 8} ${cy - 4} Q ${cx + 12} ${cy - 10} ${cx + 16} ${cy - 4}" stroke="${eyeColor}" stroke-width="3.2" stroke-linecap="round" fill="none" />
      <path d="M ${cx - 10} ${cy + 6} Q ${cx} ${cy + 17} ${cx + 10} ${cy + 6}" stroke="${mouthColor}" stroke-width="3.2" stroke-linecap="round" fill="none" />
      <circle cx="${cx - 17}" cy="${cy + 7}" r="4.2" fill="#ffb3c6" opacity="0.75" />
      <circle cx="${cx + 17}" cy="${cy + 7}" r="4.2" fill="#ffb3c6" opacity="0.75" />
    </g>
    <g class="expr-group expr-triste">
      <circle cx="${cx - 12}" cy="${cy - 2}" r="4" fill="${eyeColor}" />
      <circle cx="${cx + 12}" cy="${cy - 2}" r="4" fill="${eyeColor}" />
      <path d="M ${cx - 17} ${cy - 11} L ${cx - 8} ${cy - 7}" stroke="${eyeColor}" stroke-width="2.6" stroke-linecap="round" />
      <path d="M ${cx + 17} ${cy - 11} L ${cx + 8} ${cy - 7}" stroke="${eyeColor}" stroke-width="2.6" stroke-linecap="round" />
      <path d="M ${cx - 9} ${cy + 14} Q ${cx} ${cy + 7} ${cx + 9} ${cy + 14}" stroke="${mouthColor}" stroke-width="3.2" stroke-linecap="round" fill="none" />
      <path d="M ${cx - 6} ${cy + 3} L ${cx - 4} ${cy + 10}" stroke="#8ec9ff" stroke-width="2.6" stroke-linecap="round" opacity="0.9" />
    </g>
    <g class="expr-group expr-celebrando">
      <path d="M ${cx - 16} ${cy - 3} Q ${cx - 12} ${cy - 9} ${cx - 8} ${cy - 3}" stroke="${eyeColor}" stroke-width="3.2" stroke-linecap="round" fill="none" />
      <path d="M ${cx + 8} ${cy - 3} Q ${cx + 12} ${cy - 9} ${cx + 16} ${cy - 3}" stroke="${eyeColor}" stroke-width="3.2" stroke-linecap="round" fill="none" />
      <ellipse cx="${cx}" cy="${cy + 9}" rx="7.5" ry="9" fill="${mouthColor}" />
      <path d="M ${cx - 24} ${cy - 22} l 2.2 5.4 l 5.4 2.2 l -5.4 2.2 l -2.2 5.4 l -2.2 -5.4 l -5.4 -2.2 l 5.4 -2.2 z" fill="#ffd93d" />
      <path d="M ${cx + 20} ${cy - 18} l 1.8 4.4 l 4.4 1.8 l -4.4 1.8 l -1.8 4.4 l -1.8 -4.4 l -4.4 -1.8 l 4.4 -1.8 z" fill="#ffd93d" />
    </g>`;
}
