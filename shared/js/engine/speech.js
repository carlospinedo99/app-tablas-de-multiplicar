// Lectura por voz en español (operación y resultado) con SpeechSynthesis.
import { getSettings, setPreferredVoice } from './state.js';

const UNIDADES = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
const ESPECIALES_10_15 = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince'];
const DIECI = ['dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
const VEINTI = ['veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
const DECENAS = { 3: 'treinta', 4: 'cuarenta', 5: 'cincuenta', 6: 'sesenta', 7: 'setenta', 8: 'ochenta', 9: 'noventa' };

// Rango acotado (0-144, únicos productos posibles hasta la tabla del 12): una función
// algorítmica es correcta aquí porque el español no tiene excepciones ortográficas
// sin cubrir en este rango (a diferencia de miles/millones, que si las tendrían).
export function numeroEnPalabras(n) {
  if (n < 0) return String(n);
  if (n < 10) return UNIDADES[n];
  if (n < 16) return ESPECIALES_10_15[n - 10];
  if (n < 20) return DIECI[n - 16];
  if (n < 30) return VEINTI[n - 20];
  if (n < 100) {
    const decena = Math.floor(n / 10);
    const resto = n % 10;
    return resto === 0 ? DECENAS[decena] : `${DECENAS[decena]} y ${UNIDADES[resto]}`;
  }
  if (n === 100) return 'cien';
  if (n < 200) {
    const resto = n - 100;
    return `ciento ${numeroEnPalabras(resto)}`;
  }
  return String(n);
}

let cachedVoice = null;
let voicesReady = false;

function pickVoice() {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const preferredURI = getSettings().preferredVoiceURI;
  if (preferredURI) {
    const preferred = voices.find(v => v.voiceURI === preferredURI);
    if (preferred) return preferred;
  }
  const byLang = lang => voices.find(v => v.lang?.toLowerCase() === lang);
  const anyEs = voices.find(v => v.lang?.toLowerCase().startsWith('es'));
  return byLang('es-es') || byLang('es-mx') || anyEs || null;
}

export function initSpeech() {
  if (!('speechSynthesis' in window)) return;
  const refresh = () => {
    cachedVoice = pickVoice();
    voicesReady = true;
    if (cachedVoice) setPreferredVoice(cachedVoice.voiceURI);
  };
  refresh();
  window.speechSynthesis.addEventListener?.('voiceschanged', refresh);
}

// iOS Safari solo permite voz tras un gesto real del usuario: se llama en el primer tap.
export function unlockSpeech() {
  if (!('speechSynthesis' in window)) return;
  const utter = new SpeechSynthesisUtterance(' ');
  utter.volume = 0;
  window.speechSynthesis.speak(utter);
}

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  const settings = getSettings();
  if (settings.muted || !settings.voiceEnabled) return;
  if (!voicesReady) initSpeech();
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'es-ES';
  if (cachedVoice) utter.voice = cachedVoice;
  utter.rate = 0.95;
  window.speechSynthesis.speak(utter);
}

export function speakOperacion(a, b) {
  speak(`¿Cuánto es ${numeroEnPalabras(a)} por ${numeroEnPalabras(b)}?`);
}

export function speakResultado(a, b, resultado, correcto) {
  const intro = correcto ? '¡Muy bien!' : '';
  speak(`${intro} ${numeroEnPalabras(a)} por ${numeroEnPalabras(b)} son ${numeroEnPalabras(resultado)}`.trim());
}

export function speakTexto(text) {
  speak(text);
}
