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

// Pistas de nombre que suelen indicar una voz de mayor calidad que la
// compacta por defecto del sistema (voces "Mejoradas/Premium" de iOS, Siri,
// o las de Google en Android/Chrome). El Web Speech API no expone "calidad"
// como propiedad, así que esto es un heurístico best-effort, no garantía.
const CALIDAD_HINTS = ['mónica', 'monica', 'juan', 'jorge', 'diego', 'siri', 'google', 'premium', 'enhanced', 'neural'];

// Voces de personaje/broma que trae macOS/iOS (distorsionadas a propósito:
// robot, susurro, abuelo con eco...). Nunca son la mejor opción aunque
// coincidan en idioma, así que restan en vez de sumar.
const VOZ_NOVEDAD = ['eddy', 'flo', 'grandma', 'grandpa', 'reed', 'rocko', 'sandy', 'shelley', 'albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos', 'wobble', 'zarvox', 'trinoids', 'whisper', 'organ', 'jester', 'good news', 'superstar'];

function puntuarVoz(v) {
  const name = (v.name || '').toLowerCase();
  const lang = (v.lang || '').toLowerCase();
  let score = 0;
  if (lang === 'es-es') score += 3;
  else if (lang === 'es-mx') score += 2;
  else if (lang.startsWith('es')) score += 1;
  if (CALIDAD_HINTS.some(hint => name.includes(hint))) score += 4;
  if (VOZ_NOVEDAD.some(hint => name.includes(hint))) score -= 10;
  if (v.localService) score += 1;
  if (v.default) score += 1;
  return score;
}

// Siempre recalcula sobre la lista COMPLETA actual de voces (no se queda
// pegado a preferredVoiceURI): en varios navegadores el evento
// 'voiceschanged' dispara más de una vez y la primera tanda puede llegar
// incompleta, así que hay que poder corregirse cuando aparecen mejores voces.
function pickVoice() {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const esVoices = voices.filter(v => v.lang?.toLowerCase().startsWith('es'));
  const pool = esVoices.length ? esVoices : voices;
  return pool.slice().sort((a, b) => puntuarVoz(b) - puntuarVoz(a))[0] || null;
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

// Nota: NO se llama a speechSynthesis.cancel() aquí. El motor encola las
// utterances automáticamente, así que "operación" y luego "resultado" se
// dicen completas una tras otra sin cortarse ni superponerse. La voz solo
// se detiene explícitamente al cambiar de pantalla (ver stopSpeech() y su
// uso en ui/router.js) para no seguir narrando algo que ya no está visible.
function speak(text, { pitch = 1, rate = 0.95 } = {}) {
  if (!('speechSynthesis' in window)) return;
  const settings = getSettings();
  if (settings.muted || !settings.voiceEnabled) return;
  if (!voicesReady) initSpeech();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = cachedVoice?.lang || 'es-ES';
  if (cachedVoice) utter.voice = cachedVoice;
  utter.rate = rate;
  utter.pitch = pitch;
  window.speechSynthesis.speak(utter);
}

export function stopSpeech() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

export function speakOperacion(a, b) {
  speak(`¿Cuánto es ${numeroEnPalabras(a)} por ${numeroEnPalabras(b)}?`, { pitch: 1.05, rate: 0.95 });
}

const FRASES_ACIERTO = ['¡Muy bien!', '¡Excelente!', '¡Genial!', '¡Así se hace!', '¡Perfecto!'];
const FRASES_ANIMO = ['Casi.', 'Vamos con calma.', 'Tú puedes.'];

export function speakResultado(a, b, resultado, correcto) {
  const frase = `${numeroEnPalabras(a)} por ${numeroEnPalabras(b)} son ${numeroEnPalabras(resultado)}`;
  if (correcto) {
    const intro = FRASES_ACIERTO[Math.floor(Math.random() * FRASES_ACIERTO.length)];
    speak(`${intro} ${frase}`, { pitch: 1.2, rate: 1.08 });
  } else {
    const intro = FRASES_ANIMO[Math.floor(Math.random() * FRASES_ANIMO.length)];
    speak(`${intro} ${frase}`, { pitch: 0.95, rate: 0.88 });
  }
}

export function speakTexto(text) {
  speak(text);
}
