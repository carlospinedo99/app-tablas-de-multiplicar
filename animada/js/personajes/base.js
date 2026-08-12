// Piezas SVG reutilizables para construir los 12 personajes: un cuerpo tipo
// "blob" redondeado con patitas, y helpers para formas que se repiten
// (orejas, melena/rayos radiales). Todo con formas primitivas (círculos,
// elipses, triángulos) para que cada personaje sea fácil de mantener a mano.
export const INK = '#3a2f5c';

export function blobBody({ fill, cx = 50, cy = 56, r = 30 }) {
  return `
    <ellipse cx="${cx - 15}" cy="${cy + 27}" rx="9" ry="6" fill="${fill}" />
    <ellipse cx="${cx + 15}" cy="${cy + 27}" rx="9" ry="6" fill="${fill}" />
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" />
  `;
}

export function earsPair({ cx = 50, cy = 56, dx = 21, dy = -22, size = 11, shape = 'circle', fill }) {
  const spots = [[cx - dx, cy + dy], [cx + dx, cy + dy]];
  if (shape === 'triangle') {
    return spots.map(([x, y]) => `<path d="M ${x - size} ${y + size} L ${x} ${y - size} L ${x + size} ${y + size} Z" fill="${fill}" />`).join('');
  }
  return spots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${size}" fill="${fill}" />`).join('');
}

// Anillo de círculos radiando desde el centro (usado en melena de león / crin).
export function petalRing({ cx = 50, cy = 56, count = 8, radius = 31, petalR = 9, fill }) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    out += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${petalR}" fill="${fill}" />`;
  }
  return out;
}

// Anillo de triángulos radiando desde el centro (usado en los rayos del sol).
export function rayRing({ cx = 50, cy = 56, count = 8, innerR = 31, outerR = 43, width = 6.5, fill }) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const nx = Math.cos(angle), ny = Math.sin(angle);
    const px = -ny, py = nx;
    const bx1 = cx + nx * innerR + px * width, by1 = cy + ny * innerR + py * width;
    const bx2 = cx + nx * innerR - px * width, by2 = cy + ny * innerR - py * width;
    const tx = cx + nx * outerR, ty = cy + ny * outerR;
    out += `<path d="M ${bx1.toFixed(1)} ${by1.toFixed(1)} L ${tx.toFixed(1)} ${ty.toFixed(1)} L ${bx2.toFixed(1)} ${by2.toFixed(1)} Z" fill="${fill}" />`;
  }
  return out;
}

// Estrella de 5 puntas (cuerpo de "Estrellitas" y punta de varita de "Hadas").
export function starPath(cx, cy, outerR, innerR) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return `${d}Z`;
}

export function svgWrap(className, expression, inner) {
  return `<svg viewBox="0 0 100 100" class="mascota ${className}" data-expr="${expression}" role="img" aria-hidden="true">${inner}</svg>`;
}
