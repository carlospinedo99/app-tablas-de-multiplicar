// Router mínimo basado en hash (#/tabla/3/juego2), sin dependencias externas.
const routes = [];

function extractKeys(pattern) {
  return (pattern.match(/:[^/]+/g) || []).map(k => k.slice(1));
}

function patternToRegex(pattern) {
  const regexStr = pattern.replace(/:[^/]+/g, '([^/]+)');
  return new RegExp(`^${regexStr}$`);
}

export function registerRoute(pattern, handler) {
  routes.push({ regex: patternToRegex(pattern), keys: extractKeys(pattern), handler });
}

function currentPath(defaultPath) {
  const hash = window.location.hash.replace(/^#/, '');
  return hash || defaultPath;
}

let epoch = 0;

// Cada navegación (incluida una re-entrada a la misma ruta) invalida los
// setTimeout/timers pendientes de la pantalla anterior: las pantallas de
// juego capturan getEpoch() al montarse y comprueban que siga vigente
// antes de tocar el DOM desde un callback diferido.
export function getEpoch() {
  return epoch;
}

function dispatch(defaultPath) {
  epoch++;
  const path = currentPath(defaultPath);
  for (const route of routes) {
    const match = path.match(route.regex);
    if (match) {
      const params = {};
      route.keys.forEach((key, i) => { params[key] = decodeURIComponent(match[i + 1]); });
      route.handler(params);
      return;
    }
  }
  navigate('/');
}

export function startRouter(defaultPath = '/') {
  window.addEventListener('hashchange', () => dispatch(defaultPath));
  dispatch(defaultPath);
}

export function navigate(path) {
  if (window.location.hash.replace(/^#/, '') === path) {
    // Misma ruta (ej. reiniciar un juego): forzar redibujado.
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    return;
  }
  window.location.hash = path;
  window.scrollTo(0, 0);
}
