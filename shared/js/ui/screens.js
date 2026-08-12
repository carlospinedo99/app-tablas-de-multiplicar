// Pantallas de la app. Reciben (root, params, ctx) donde ctx = { theme, characterRenderer }.
import { navigate, getEpoch } from './router.js';
import {
  headerHtml, wireHeader, characterSlotHtml, setCharacterExpression,
  timerBarHtml, updateTimerBar, keypadHtml, arrayGridHtml, diffLabel,
  showRoundSummary, showGrowthMindsetOverlay, showTableCompletedOverlay,
} from './components.js';
import {
  TABLES, GAME_META, getTableMeta,
} from '../data/tables.js';
import {
  isTableUnlocked, getTableProgress, canAttemptRetoFinal, isTableCompleted,
  recordJuegoResult, recordRetoFinalSuccess, recordRetoFinalAttemptFailed,
} from '../engine/state.js';
import {
  buildJuego1Round, buildJuego2Queue, buildJuego3Round, advanceQueue,
  startRetoFinal, answerRetoFinal,
} from '../engine/questions.js';
import { createSoftTimer } from '../engine/timer.js';
import { playCorrecto, playIncorrecto, playToqueSuave } from '../engine/audio.js';
import { speakOperacion, speakResultado } from '../engine/speech.js';

function tableExists(id) {
  return TABLES.some(t => t.id === Number(id));
}

// ---------------------------------------------------------------------------
// Mapa de niveles (home)
// ---------------------------------------------------------------------------
export function renderMapa(root, params, ctx) {
  const nodes = TABLES.map(t => levelNodeHtml(t, ctx)).join('');
  root.innerHTML = `
    ${headerHtml({ title: 'Tablas de Camila', showBack: false })}
    <nav class="top-actions">
      <button class="btn btn-secondary" data-action="libre">🎯 Práctica libre</button>
    </nav>
    <main class="screen level-map">${nodes}</main>`;
  wireHeader(root);
  root.querySelector('[data-action="libre"]').addEventListener('click', () => navigate('/libre'));
  root.querySelectorAll('[data-action="open-table"]').forEach(btn => {
    btn.addEventListener('click', () => navigate(`/tabla/${btn.dataset.id}`));
  });
}

function levelNodeHtml(t, ctx) {
  const unlocked = isTableUnlocked(t.id);
  const completed = isTableCompleted(t.id);
  const state = !unlocked ? 'locked' : completed ? 'completed' : 'active';
  const inner = !unlocked
    ? '<span class="lock-icon" aria-hidden="true">🔒</span>'
    : characterSlotHtml(ctx, t.id, completed ? 'celebrando' : 'feliz', 'sm');
  return `
    <button class="level-node state-${state}" data-action="open-table" data-id="${t.id}" ${unlocked ? '' : 'disabled aria-disabled="true"'}>
      <span class="node-badge">${inner}</span>
      <span class="node-label">${t.id}</span>
      ${completed ? '<span class="node-check" aria-hidden="true">✓</span>' : ''}
    </button>`;
}

// ---------------------------------------------------------------------------
// Práctica libre
// ---------------------------------------------------------------------------
export function renderLibre(root, params, ctx) {
  const available = TABLES.filter(t => isTableUnlocked(t.id));
  root.innerHTML = `
    ${headerHtml({ title: 'Práctica libre' })}
    <main class="screen libre-screen">
      <p class="libre-hint">Elige una tabla para practicar sin presión. No afecta tu progreso de niveles.</p>
      <div class="card-grid">
        ${available.map(t => `
          <button class="game-card table-pick" data-action="open-table" data-id="${t.id}">
            ${characterSlotHtml(ctx, t.id, 'feliz', 'sm')}
            <span class="game-card-title">${t.label}</span>
          </button>`).join('')}
      </div>
    </main>`;
  wireHeader(root, { backHref: '/' });
  root.querySelectorAll('[data-action="open-table"]').forEach(btn => {
    btn.addEventListener('click', () => navigate(`/tabla/${btn.dataset.id}`));
  });
}

// ---------------------------------------------------------------------------
// Hub de una tabla: elegir Juego 1 / 2 / 3 / Reto Final
// ---------------------------------------------------------------------------
export function renderHub(root, params, ctx) {
  const tableId = Number(params.id);
  if (!tableExists(tableId) || !isTableUnlocked(tableId)) { navigate('/'); return; }
  const meta = getTableMeta(tableId);
  const progress = getTableProgress(tableId);
  const canReto = canAttemptRetoFinal(tableId);

  root.innerHTML = `
    ${headerHtml({ title: meta.label })}
    <main class="screen hub-screen">
      <div class="hub-character">${characterSlotHtml(ctx, tableId, progress.retoFinal.completed ? 'celebrando' : 'feliz', 'xl')}</div>
      <div class="card-grid">
        ${gameCardHtml('juego1', progress.juego1)}
        ${gameCardHtml('juego2', progress.juego2)}
        ${gameCardHtml('juego3', progress.juego3)}
        ${retoCardHtml(progress.retoFinal, canReto)}
      </div>
    </main>`;
  wireHeader(root, { backHref: '/' });
  root.querySelectorAll('[data-action="open-game"]').forEach(btn => {
    btn.addEventListener('click', () => navigate(`/tabla/${tableId}/${btn.dataset.game}`));
  });
}

function gameCardHtml(key, entry) {
  const meta = GAME_META[key];
  return `
    <button class="game-card" data-action="open-game" data-game="${key}">
      <span class="game-card-title">${meta.title}</span>
      <span class="game-card-diff diff-${meta.difficulty}">${diffLabel(meta.difficulty)}</span>
      <span class="game-card-score">${entry.played ? `Mejor: ${entry.bestScore}/10` : 'Sin jugar todavía'}</span>
    </button>`;
}

function retoCardHtml(reto, canAttempt) {
  const locked = !canAttempt && !reto.completed;
  const hint = reto.completed
    ? '<span class="game-card-score">¡Superado! ⭐</span>'
    : locked
      ? '<span class="game-card-hint">Juega primero los 3 juegos</span>'
      : '<span class="game-card-hint">Cero errores para desbloquear</span>';
  return `
    <button class="game-card reto-card ${reto.completed ? 'is-completed' : ''}" data-action="open-game" data-game="reto" ${locked ? 'disabled aria-disabled="true"' : ''}>
      <span class="game-card-title">🏆 Reto Final</span>
      ${hint}
    </button>`;
}

// ---------------------------------------------------------------------------
// Juego 1 · Descubre (opción múltiple con apoyo visual, sin límite de tiempo)
// ---------------------------------------------------------------------------
export function renderJuego1(root, params, ctx) {
  const tableId = Number(params.id);
  if (!tableExists(tableId) || !isTableUnlocked(tableId)) { navigate('/'); return; }
  const meta = getTableMeta(tableId);
  const questions = buildJuego1Round(tableId);
  const myEpoch = getEpoch();
  let index = 0;
  let correctCount = 0;
  let answering = true;

  root.innerHTML = `
    ${headerHtml({ title: `${meta.label} · Descubre` })}
    <main class="screen game-screen">
      ${characterSlotHtml(ctx, tableId, 'neutral', 'md')}
      <p class="game-progress">Pregunta <span data-role="progress-current">1</span>/10</p>
      <div data-role="visual-array"></div>
      <p class="operation-text" data-role="operation"></p>
      <div class="choice-grid" data-role="choices"></div>
    </main>`;
  wireHeader(root, { backHref: `/tabla/${tableId}` });

  function renderQuestion() {
    const q = questions[index];
    root.querySelector('[data-role="progress-current"]').textContent = String(index + 1);
    root.querySelector('[data-role="operation"]').textContent = `${q.a} × ${q.b} = ?`;
    root.querySelector('[data-role="visual-array"]').innerHTML = arrayGridHtml(q.a, q.b);
    setCharacterExpression(root, 'neutral');
    const choicesEl = root.querySelector('[data-role="choices"]');
    choicesEl.innerHTML = q.choices.map(c => `<button class="choice-btn" data-value="${c}">${c}</button>`).join('');
    choicesEl.querySelectorAll('.choice-btn').forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(Number(btn.dataset.value), btn));
    });
    speakOperacion(q.a, q.b);
    answering = true;
  }

  function handleAnswer(value, btnEl) {
    if (!answering || getEpoch() !== myEpoch) return;
    answering = false;
    const q = questions[index];
    const correct = value === q.answer;
    if (correct) correctCount++;
    root.querySelectorAll('.choice-btn').forEach(b => b.classList.add('is-disabled'));
    btnEl.classList.add(correct ? 'is-correct' : 'is-incorrect');
    if (!correct) {
      const correctBtn = [...root.querySelectorAll('.choice-btn')].find(b => Number(b.dataset.value) === q.answer);
      correctBtn?.classList.add('is-correct-reveal');
    }
    setCharacterExpression(root, correct ? 'feliz' : 'triste');
    correct ? playCorrecto() : playIncorrecto();
    speakResultado(q.a, q.b, q.answer, correct);
    setTimeout(() => {
      if (getEpoch() !== myEpoch) return;
      index++;
      if (index < questions.length) renderQuestion();
      else finishRound();
    }, 1400);
  }

  function finishRound() {
    recordJuegoResult(tableId, 'juego1', correctCount);
    showRoundSummary(root, { correctCount, total: questions.length, nextHref: `/tabla/${tableId}` });
  }

  renderQuestion();
}

// ---------------------------------------------------------------------------
// Juego 2 · Practica (opción múltiple, repetición espaciada de fallos)
// ---------------------------------------------------------------------------
export function renderJuego2(root, params, ctx) {
  const tableId = Number(params.id);
  if (!tableExists(tableId) || !isTableUnlocked(tableId)) { navigate('/'); return; }
  const meta = getTableMeta(tableId);
  let queue = buildJuego2Queue(tableId);
  const myEpoch = getEpoch();
  const totalFacts = queue.length;
  const seenFactors = new Set();
  let correctFirstTry = 0;
  let answering = true;

  root.innerHTML = `
    ${headerHtml({ title: `${meta.label} · Practica` })}
    <main class="screen game-screen">
      ${characterSlotHtml(ctx, tableId, 'neutral', 'md')}
      <p class="game-progress"><span data-role="progress-remaining">${queue.length}</span> por responder</p>
      <p class="operation-text" data-role="operation"></p>
      <div class="choice-grid" data-role="choices"></div>
    </main>`;
  wireHeader(root, { backHref: `/tabla/${tableId}` });

  function renderQuestion() {
    const q = queue[0];
    root.querySelector('[data-role="progress-remaining"]').textContent = String(queue.length);
    root.querySelector('[data-role="operation"]').textContent = `${q.a} × ${q.b} = ?`;
    setCharacterExpression(root, 'neutral');
    const choicesEl = root.querySelector('[data-role="choices"]');
    choicesEl.innerHTML = q.choices.map(c => `<button class="choice-btn" data-value="${c}">${c}</button>`).join('');
    choicesEl.querySelectorAll('.choice-btn').forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(Number(btn.dataset.value), btn));
    });
    speakOperacion(q.a, q.b);
    answering = true;
  }

  function handleAnswer(value, btnEl) {
    if (!answering || getEpoch() !== myEpoch) return;
    answering = false;
    const q = queue[0];
    const correct = value === q.answer;
    const firstExposure = !seenFactors.has(q.b);
    if (firstExposure) {
      seenFactors.add(q.b);
      if (correct) correctFirstTry++;
    }
    root.querySelectorAll('.choice-btn').forEach(b => b.classList.add('is-disabled'));
    btnEl.classList.add(correct ? 'is-correct' : 'is-incorrect');
    if (!correct) {
      const correctBtn = [...root.querySelectorAll('.choice-btn')].find(b => Number(b.dataset.value) === q.answer);
      correctBtn?.classList.add('is-correct-reveal');
    }
    setCharacterExpression(root, correct ? 'feliz' : 'triste');
    correct ? playCorrecto() : playIncorrecto();
    speakResultado(q.a, q.b, q.answer, correct);

    queue.shift();
    queue = advanceQueue(queue, correct, q);

    setTimeout(() => {
      if (getEpoch() !== myEpoch) return;
      if (queue.length > 0) renderQuestion();
      else finishRound();
    }, 1300);
  }

  function finishRound() {
    recordJuegoResult(tableId, 'juego2', correctFirstTry);
    showRoundSummary(root, { correctCount: correctFirstTry, total: totalFacts, nextHref: `/tabla/${tableId}` });
  }

  renderQuestion();
}

// ---------------------------------------------------------------------------
// Juego 3 · Desafío rápido (respuesta escrita, timer suave, sin bloqueo)
// ---------------------------------------------------------------------------
export function renderJuego3(root, params, ctx) {
  const tableId = Number(params.id);
  if (!tableExists(tableId) || !isTableUnlocked(tableId)) { navigate('/'); return; }
  const meta = getTableMeta(tableId);
  const questions = buildJuego3Round(tableId);
  const myEpoch = getEpoch();
  let index = 0;
  let correctCount = 0;
  let currentInput = '';
  let answering = true;
  let timer = null;

  root.innerHTML = `
    ${headerHtml({ title: `${meta.label} · Desafío rápido` })}
    <main class="screen game-screen">
      ${characterSlotHtml(ctx, tableId, 'neutral', 'md')}
      <p class="game-progress">Pregunta <span data-role="progress-current">1</span>/10</p>
      ${timerBarHtml()}
      <p class="operation-text" data-role="operation"></p>
      <div class="answer-display" data-role="answer-display">&nbsp;</div>
      ${keypadHtml()}
    </main>`;
  wireHeader(root, { backHref: `/tabla/${tableId}` });

  root.querySelector('.keypad').addEventListener('click', (e) => {
    const btn = e.target.closest('.keypad-btn');
    if (!btn || !answering) return;
    handleKey(btn.dataset.key);
  });

  function handleKey(key) {
    if (key === '⌫') currentInput = currentInput.slice(0, -1);
    else if (key === '✓') { if (currentInput !== '') submitAnswer(); return; }
    else { if (currentInput.length >= 3) return; currentInput += key; playToqueSuave(); }
    updateDisplay();
  }

  function updateDisplay() {
    root.querySelector('[data-role="answer-display"]').textContent = currentInput || ' ';
  }

  function renderQuestion() {
    currentInput = '';
    updateDisplay();
    const q = questions[index];
    root.querySelector('[data-role="progress-current"]').textContent = String(index + 1);
    root.querySelector('[data-role="operation"]').textContent = `${q.a} × ${q.b} = ?`;
    setCharacterExpression(root, 'neutral');
    answering = true;
    timer?.stop();
    timer = createSoftTimer({
      durationMs: 9000,
      onTick: fraction => { if (getEpoch() === myEpoch) updateTimerBar(root, fraction); },
      onTimeout: () => submitAnswer(true),
    });
    timer.start();
    speakOperacion(q.a, q.b);
  }

  function submitAnswer(timedOut = false) {
    if (!answering || getEpoch() !== myEpoch) return;
    answering = false;
    timer?.stop();
    const q = questions[index];
    const value = Number(currentInput);
    const correct = !timedOut && currentInput !== '' && value === q.answer;
    if (correct) correctCount++;
    setCharacterExpression(root, correct ? 'feliz' : 'triste');
    correct ? playCorrecto() : playIncorrecto();
    speakResultado(q.a, q.b, q.answer, correct);
    root.querySelector('[data-role="answer-display"]').textContent = correct ? `¡${q.answer}! ✔` : `Era ${q.answer}`;
    setTimeout(() => {
      if (getEpoch() !== myEpoch) return;
      index++;
      if (index < questions.length) renderQuestion();
      else finishRound();
    }, 1400);
  }

  function finishRound() {
    recordJuegoResult(tableId, 'juego3', correctCount);
    showRoundSummary(root, { correctCount, total: questions.length, nextHref: `/tabla/${tableId}` });
  }

  renderQuestion();
}

// ---------------------------------------------------------------------------
// Reto Final · cero errores permitidos, reinicio total ante un fallo
// ---------------------------------------------------------------------------
export function renderRetoFinal(root, params, ctx) {
  const tableId = Number(params.id);
  if (!tableExists(tableId) || !isTableUnlocked(tableId)) { navigate('/'); return; }
  if (!canAttemptRetoFinal(tableId)) { navigate(`/tabla/${tableId}`); return; }
  const meta = getTableMeta(tableId);
  let session = startRetoFinal(tableId);
  const myEpoch = getEpoch();
  let currentInput = '';
  let answering = true;
  let timer = null;

  root.innerHTML = `
    ${headerHtml({ title: `${meta.label} · Reto Final` })}
    <main class="screen game-screen reto-screen">
      ${characterSlotHtml(ctx, tableId, 'neutral', 'md')}
      <p class="game-progress">Pregunta <span data-role="progress-current">1</span>/10 · Cero errores para desbloquear</p>
      ${timerBarHtml()}
      <p class="operation-text" data-role="operation"></p>
      <div class="answer-display" data-role="answer-display">&nbsp;</div>
      ${keypadHtml()}
    </main>`;
  wireHeader(root, { backHref: `/tabla/${tableId}` });

  root.querySelector('.keypad').addEventListener('click', (e) => {
    const btn = e.target.closest('.keypad-btn');
    if (!btn || !answering) return;
    handleKey(btn.dataset.key);
  });

  function handleKey(key) {
    if (key === '⌫') currentInput = currentInput.slice(0, -1);
    else if (key === '✓') { if (currentInput !== '') submitAnswer(); return; }
    else { if (currentInput.length >= 3) return; currentInput += key; playToqueSuave(); }
    updateDisplay();
  }

  function updateDisplay() {
    root.querySelector('[data-role="answer-display"]').textContent = currentInput || ' ';
  }

  function renderQuestion() {
    currentInput = '';
    updateDisplay();
    const q = session.questions[session.index];
    root.querySelector('[data-role="progress-current"]').textContent = String(session.index + 1);
    root.querySelector('[data-role="operation"]').textContent = `${q.a} × ${q.b} = ?`;
    setCharacterExpression(root, 'neutral');
    answering = true;
    timer?.stop();
    timer = createSoftTimer({
      durationMs: 9000,
      onTick: fraction => { if (getEpoch() === myEpoch) updateTimerBar(root, fraction); },
      onTimeout: () => submitAnswer(true),
    });
    timer.start();
    speakOperacion(q.a, q.b);
  }

  function submitAnswer(timedOut = false) {
    if (!answering || getEpoch() !== myEpoch) return;
    answering = false;
    timer?.stop();
    const value = timedOut || currentInput === '' ? Number.NaN : Number(currentInput);
    const result = answerRetoFinal(session, value);

    if (result.status === 'restart') {
      setCharacterExpression(root, 'triste');
      playIncorrecto();
      const q = result.failedQuestion;
      speakResultado(q.a, q.b, q.answer, false);
      recordRetoFinalAttemptFailed(tableId);
      showGrowthMindsetOverlay(root, {
        question: q,
        onContinue: () => {
          session = result.session;
          renderQuestion();
        },
      });
      return;
    }

    session = result.session;
    setCharacterExpression(root, 'feliz');
    playCorrecto();
    const answeredQ = session.questions[session.index - 1];
    speakResultado(answeredQ.a, answeredQ.b, answeredQ.answer, true);

    if (result.status === 'completed') {
      const unlockInfo = recordRetoFinalSuccess(tableId);
      showTableCompletedOverlay(root, { unlockInfo, mapHref: '/' });
      return;
    }

    setTimeout(() => {
      if (getEpoch() !== myEpoch) return;
      renderQuestion();
    }, 900);
  }

  renderQuestion();
}
