// Punto de entrada compartido por ambas versiones (Clásica / Animada).
// initApp({ theme, characterRenderer }) — characterRenderer es null en Clásica.
import { registerRoute, startRouter } from './ui/router.js';
import { initSpeech, unlockSpeech } from './engine/speech.js';
import { unlockAudio, playToqueSuave } from './engine/audio.js';
import { startMusic } from './engine/music.js';
import { forceUnlockThrough, getSettings } from './engine/state.js';
import * as screens from './ui/screens.js';

// Enlace de acceso directo: abrir la app con ?desbloquear=6 marca las tablas
// anteriores como completadas y deja jugable la tabla indicada, sin jugar.
function applyUnlockLinkIfPresent() {
  const params = new URLSearchParams(window.location.search);
  const target = params.get('desbloquear');
  if (!target) return;
  forceUnlockThrough(Number(target));
  const url = new URL(window.location.href);
  url.searchParams.delete('desbloquear');
  window.history.replaceState({}, '', url);
}

export function initApp({ theme, characterRenderer } = {}) {
  const root = document.getElementById('app');
  if (!root) throw new Error('Falta <div id="app"> en el HTML');
  document.body.dataset.theme = theme || 'clasica';

  const ctx = { theme, characterRenderer: characterRenderer || null };

  applyUnlockLinkIfPresent();
  initSpeech();

  let unlocked = false;
  window.addEventListener('pointerdown', function unlockOnce() {
    if (unlocked) return;
    unlocked = true;
    unlockAudio();
    unlockSpeech();
    if (!getSettings().audioMuted) startMusic();
    window.removeEventListener('pointerdown', unlockOnce);
  });

  // Toque suave en CUALQUIER botón de la app. En fase de captura para que
  // suene antes que el efecto de acierto/error que el propio botón dispare
  // (si no, el orden se sentía invertido: primero el resultado, luego el tap).
  document.addEventListener('click', event => {
    if (event.target.closest('button')) playToqueSuave();
  }, true);

  registerRoute('/', params => screens.renderMapa(root, params, ctx));
  registerRoute('/libre', params => screens.renderLibre(root, params, ctx));
  registerRoute('/libre/mixto', params => screens.renderRepasoMixto(root, params, ctx));
  registerRoute('/tabla/:id', params => screens.renderHub(root, params, ctx));
  registerRoute('/tabla/:id/juego1', params => screens.renderJuego1(root, params, ctx));
  registerRoute('/tabla/:id/juego2', params => screens.renderJuego2(root, params, ctx));
  registerRoute('/tabla/:id/juego3', params => screens.renderJuego3(root, params, ctx));
  registerRoute('/tabla/:id/reto', params => screens.renderRetoFinal(root, params, ctx));

  startRouter('/');

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
}
