// Música de fondo generada con Web Audio API (sin archivos externos): un
// loop alegre estilo videojuego, agendado con un "look-ahead scheduler" para
// no desincronizarse (setTimeout solo no es lo bastante preciso para música).
import { getSettings } from './state.js';

let ctx = null;
function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

const TEMPO_BPM = 128;
const STEP = 60 / TEMPO_BPM / 2; // corcheas
const SCHEDULE_AHEAD = 0.2; // segundos
const VOL_NORMAL = 0.16;
const VOL_DUCKED = 0.035;

// Melodía alegre en Do mayor (pentatónico) + línea de bajo simple, 16 pasos, con silencios (0).
const MELODIA = [523, 659, 784, 659, 523, 0, 659, 784, 880, 784, 659, 523, 0, 659, 523, 0];
const BAJO = [262, 0, 0, 0, 330, 0, 0, 0, 392, 0, 0, 0, 330, 0, 0, 0];

let masterGain = null;
let running = false;
let ducked = false;
let nextStepTime = 0;
let stepIndex = 0;
let schedulerId = null;

function playNote(freq, time, duration, type, gainPeak) {
  if (!freq) return;
  const c = getCtx();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, time);
  g.gain.setValueAtTime(0, time);
  g.gain.linearRampToValueAtTime(gainPeak, time + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  osc.connect(g).connect(masterGain);
  osc.start(time);
  osc.stop(time + duration + 0.02);
}

function scheduleStep() {
  const c = getCtx();
  while (nextStepTime < c.currentTime + SCHEDULE_AHEAD) {
    const i = stepIndex % MELODIA.length;
    playNote(MELODIA[i], nextStepTime, STEP * 0.9, 'square', 0.05);
    playNote(BAJO[i], nextStepTime, STEP * 1.8, 'triangle', 0.045);
    nextStepTime += STEP;
    stepIndex++;
  }
  schedulerId = setTimeout(scheduleStep, 50);
}

export function startMusic() {
  if (running || getSettings().audioMuted) return;
  const c = getCtx();
  if (c.state === 'suspended') c.resume();
  masterGain = c.createGain();
  masterGain.gain.value = ducked ? VOL_DUCKED : VOL_NORMAL;
  masterGain.connect(c.destination);
  running = true;
  stepIndex = 0;
  nextStepTime = c.currentTime + 0.1;
  scheduleStep();
}

export function stopMusic() {
  running = false;
  if (schedulerId) clearTimeout(schedulerId);
  schedulerId = null;
  if (masterGain) {
    const g = masterGain;
    const c = getCtx();
    g.gain.setTargetAtTime(0, c.currentTime, 0.08);
    setTimeout(() => g.disconnect(), 400);
    masterGain = null;
  }
}

export function setMusicMuted(muted) {
  if (muted) stopMusic();
  else startMusic();
}

// La voz "esquiva" el volumen de la música mientras habla, y lo recupera al terminar.
export function duckMusic() {
  if (!masterGain || ducked) return;
  ducked = true;
  masterGain.gain.setTargetAtTime(VOL_DUCKED, getCtx().currentTime, 0.15);
}

export function unduckMusic() {
  ducked = false;
  if (!masterGain) return;
  masterGain.gain.setTargetAtTime(VOL_NORMAL, getCtx().currentTime, 0.3);
}
