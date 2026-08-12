// Efectos de sonido sintetizados con Web Audio API (sin archivos binarios que mantener).
import { getSettings } from './state.js';

let ctx = null;

function getCtx() {
  if (!ctx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    ctx = new AudioContextClass();
  }
  return ctx;
}

// iOS Safari exige que el AudioContext se reanude tras un gesto real del usuario.
export function unlockAudio() {
  const c = getCtx();
  if (c.state === 'suspended') c.resume();
}

function tone(freq, duration, { type = 'sine', gainPeak = 0.2, delay = 0 } = {}) {
  if (getSettings().muted) return;
  const c = getCtx();
  const startAt = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startAt);
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(gainPeak, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
}

export function playCorrecto() {
  tone(660, 0.12);
  tone(880, 0.18, { delay: 0.09 });
}

export function playIncorrecto() {
  // Tono corto y suave, nunca una alarma: el error no debe sonar a castigo.
  tone(280, 0.22, { type: 'sine', gainPeak: 0.12 });
}

export function playCelebracion() {
  [523, 659, 784, 1047].forEach((freq, i) => tone(freq, 0.18, { delay: i * 0.11 }));
}

export function playToqueSuave() {
  tone(440, 0.06, { gainPeak: 0.08 });
}
