// Piezas de UI reutilizables entre pantallas y entre las versiones Clásica/Animada.
import { navigate } from './router.js';
import { getSettings, setVoiceMuted, setAudioMuted } from '../engine/state.js';
import { playCelebracion, playFanfarria } from '../engine/audio.js';
import { stopSpeech } from '../engine/speech.js';
import { setMusicMuted } from '../engine/music.js';

export function headerHtml({ title, showBack = true }) {
  const { voiceMuted, audioMuted } = getSettings();
  return `
    <header class="app-header">
      <div class="header-side header-side-start">
        ${showBack ? '<button class="header-btn" data-action="back" aria-label="Volver">←</button>' : ''}
      </div>
      <h1 class="header-title">${title}</h1>
      <div class="header-side header-side-end">
        <button class="header-btn" data-action="toggle-voice" aria-label="${voiceMuted ? 'Activar voz' : 'Silenciar voz'}">${voiceMuted ? '🤐' : '🗣️'}</button>
        <button class="header-btn" data-action="toggle-audio" aria-label="${audioMuted ? 'Activar música y efectos' : 'Silenciar música y efectos'}">${audioMuted ? '🔇' : '🎵'}</button>
      </div>
    </header>`;
}

export function wireHeader(root, { backHref = '/' } = {}) {
  const backBtn = root.querySelector('[data-action="back"]');
  if (backBtn) backBtn.addEventListener('click', () => navigate(backHref));

  const voiceBtn = root.querySelector('[data-action="toggle-voice"]');
  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      const updated = setVoiceMuted(!getSettings().voiceMuted);
      voiceBtn.textContent = updated.voiceMuted ? '🤐' : '🗣️';
      voiceBtn.setAttribute('aria-label', updated.voiceMuted ? 'Activar voz' : 'Silenciar voz');
      if (updated.voiceMuted) stopSpeech();
    });
  }

  const audioBtn = root.querySelector('[data-action="toggle-audio"]');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      const updated = setAudioMuted(!getSettings().audioMuted);
      audioBtn.textContent = updated.audioMuted ? '🔇' : '🎵';
      audioBtn.setAttribute('aria-label', updated.audioMuted ? 'Activar música y efectos' : 'Silenciar música y efectos');
      setMusicMuted(updated.audioMuted);
    });
  }
}

export function characterSlotHtml(ctx, tableId, expression, size = 'lg') {
  if (!ctx.characterRenderer) {
    return `<div class="character-slot generic size-${size}" data-expr="${expression}">
      <span class="generic-badge expr-${expression}">${tableId}</span>
    </div>`;
  }
  return `<div class="character-slot size-${size}">${ctx.characterRenderer(Number(tableId), expression)}</div>`;
}

export function setCharacterExpression(root, expression) {
  const slot = root.querySelector('.character-slot');
  if (!slot) return;
  const svg = slot.querySelector('svg');
  if (svg) svg.setAttribute('data-expr', expression);
  slot.setAttribute('data-expr', expression);
}

export function timerBarHtml() {
  return '<div class="timer-bar"><div class="timer-bar-fill" data-role="timer-fill"></div></div>';
}

export function updateTimerBar(root, fraction) {
  const fill = root.querySelector('[data-role="timer-fill"]');
  if (!fill) return;
  fill.style.width = `${Math.max(0, fraction * 100)}%`;
  fill.classList.toggle('timer-warn', fraction < 0.5);
  fill.classList.toggle('timer-low', fraction < 0.2);
}

export function keypadHtml() {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'];
  return `<div class="keypad">
    ${keys.map(k => `<button type="button" class="keypad-btn ${k === '✓' ? 'keypad-submit' : ''} ${k === '⌫' ? 'keypad-delete' : ''}" data-key="${k}" aria-label="${k === '⌫' ? 'Borrar' : k === '✓' ? 'Responder' : k}">${k}</button>`).join('')}
  </div>`;
}

export function arrayGridHtml(rows, cols) {
  const total = rows * cols;
  const cells = Array.from({ length: total }).map(() => '<span class="array-dot"></span>').join('');
  return `<div class="array-grid" style="grid-template-columns: repeat(${cols}, 1fr);" aria-hidden="true">${cells}</div>`;
}

export function diffLabel(difficulty) {
  return { facil: 'Fácil', medio: 'Medio', dificil: 'Difícil' }[difficulty] || '';
}

function overlayContainer(root, html) {
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  const node = wrap.firstElementChild;
  root.appendChild(node);
  return node;
}

const CONFETTI_SHAPES = ['', 'shape-circle', 'shape-star'];

function confettiHtml(count) {
  return Array.from({ length: count })
    .map((_, i) => `<span class="confetti-piece piece-${i % 6} ${CONFETTI_SHAPES[i % CONFETTI_SHAPES.length]}"></span>`)
    .join('');
}

export function showRoundSummary(root, { correctCount, total, nextHref }) {
  const perfect = correctCount === total;
  const node = overlayContainer(root, `
    <div class="feedback-overlay is-celebration" data-role="feedback">
      <div class="confetti" aria-hidden="true">${confettiHtml(22)}</div>
      <div class="feedback-card">
        <div class="feedback-icon">${perfect ? '🌟' : '👏'}</div>
        <div class="feedback-title">${perfect ? '¡Perfecto!' : '¡Bien hecho!'}</div>
        <div class="feedback-message">Acertaste ${correctCount} de ${total}.</div>
        <button class="btn btn-primary" data-action="continue">Continuar</button>
      </div>
    </div>`);
  if (perfect) playCelebracion();
  node.querySelector('[data-action="continue"]').addEventListener('click', () => navigate(nextHref));
}

export function showGrowthMindsetOverlay(root, { question, onContinue }) {
  const node = overlayContainer(root, `
    <div class="feedback-overlay is-incorrect" data-role="feedback">
      <div class="feedback-card">
        <div class="feedback-icon">💛</div>
        <div class="feedback-title">¡Casi lo logras!</div>
        <div class="feedback-message">${question.a} × ${question.b} = ${question.answer}. Equivocarse es parte de aprender: ¡vamos de nuevo desde el principio, tú puedes!</div>
        <button class="btn btn-primary" data-action="retry">Intentar de nuevo</button>
      </div>
    </div>`);
  node.querySelector('[data-action="retry"]').addEventListener('click', () => {
    node.remove();
    onContinue();
  });
}

export function showTableCompletedOverlay(root, { unlockInfo, mapHref = '/' }) {
  let message = '¡Dominaste esta tabla sin ningún error!';
  if (unlockInfo?.justUnlockedExtra) {
    message += ' Desbloqueaste las tablas del 11 y el 12. ¡Eres una experta!';
  } else if (unlockInfo?.justUnlockedNextBase) {
    message += ` Desbloqueaste la Tabla del ${unlockInfo.justUnlockedNextBase}.`;
  }
  const node = overlayContainer(root, `
    <div class="feedback-overlay is-celebration is-fanfarria" data-role="feedback">
      <div class="confetti" aria-hidden="true">${confettiHtml(40)}</div>
      <div class="feedback-card">
        <div class="feedback-icon">🏆</div>
        <div class="feedback-title">¡Tabla completada!</div>
        <div class="feedback-message">${message}</div>
        <button class="btn btn-primary" data-action="continue">Ver mapa</button>
      </div>
    </div>`);
  playFanfarria();
  node.querySelector('[data-action="continue"]').addEventListener('click', () => navigate(mapHref));
}
