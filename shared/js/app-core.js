// Punto de entrada compartido por ambas versiones (Clásica / Animada).
// initApp({ theme, characterRenderer }) — characterRenderer es null en Clásica.
import { registerRoute, startRouter } from './ui/router.js';
import { initSpeech, unlockSpeech } from './engine/speech.js';
import { unlockAudio } from './engine/audio.js';
import * as screens from './ui/screens.js';

export function initApp({ theme, characterRenderer } = {}) {
  const root = document.getElementById('app');
  if (!root) throw new Error('Falta <div id="app"> en el HTML');
  document.body.dataset.theme = theme || 'clasica';

  const ctx = { theme, characterRenderer: characterRenderer || null };

  initSpeech();

  let unlocked = false;
  window.addEventListener('pointerdown', function unlockOnce() {
    if (unlocked) return;
    unlocked = true;
    unlockAudio();
    unlockSpeech();
    window.removeEventListener('pointerdown', unlockOnce);
  });

  registerRoute('/', params => screens.renderMapa(root, params, ctx));
  registerRoute('/libre', params => screens.renderLibre(root, params, ctx));
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
