// Generación de preguntas y lógica de rondas para los 3 juegos + Reto Final.
import { FACTORS } from '../data/tables.js';

export function shuffle(input) {
  const arr = input.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function buildQuestion(tableId, factor) {
  return { a: Number(tableId), b: factor, answer: Number(tableId) * factor };
}

export function buildAllTenQuestions(tableId) {
  return FACTORS.map(f => buildQuestion(tableId, f));
}

export function buildChoices(question, count) {
  const choices = new Set([question.answer]);
  while (choices.size < count) {
    const offset = randomInt(-10, 10);
    const candidate = question.answer + offset;
    if (candidate >= 0 && candidate !== question.answer) choices.add(candidate);
  }
  return shuffle(Array.from(choices));
}

// ---- Juego 1 (Descubre): opción múltiple con apoyo visual, sin repetición forzada ----
export function buildJuego1Round(tableId) {
  return shuffle(buildAllTenQuestions(tableId)).map(q => ({
    ...q,
    choices: buildChoices(q, 3),
  }));
}

// ---- Juego 2 (Practica): cola con reinserción espaciada de fallos ----
export function buildJuego2Queue(tableId) {
  return shuffle(buildAllTenQuestions(tableId)).map(q => ({
    ...q,
    choices: buildChoices(q, 4),
  }));
}

// Función pura: recibe la cola YA SIN la pregunta actual (tras hacer shift()) y,
// si la respuesta fue incorrecta, reinserta una copia 3-5 posiciones más adelante
// (repetición espaciada intra-sesión). Testeable sin DOM.
export function advanceQueue(remainingQueue, wasCorrect, question) {
  if (wasCorrect) return remainingQueue;
  const next = remainingQueue.slice();
  const insertAt = Math.min(randomInt(3, 5), next.length);
  next.splice(insertAt, 0, { ...question, choices: buildChoices(question, 4) });
  return next;
}

// ---- Juego 3 (Desafío rápido): ronda de 10, orden aleatorio, respuesta escrita ----
export function buildJuego3Round(tableId) {
  return shuffle(buildAllTenQuestions(tableId));
}

// ---- Reto Final: cero errores permitidos, reinicio total ante fallo ----
export function startRetoFinal(tableId, previousAttempts = 0) {
  return {
    tableId: Number(tableId),
    questions: shuffle(buildAllTenQuestions(tableId)),
    index: 0,
    attempts: previousAttempts + 1,
  };
}

export function answerRetoFinal(session, value) {
  const current = session.questions[session.index];
  if (Number(value) !== current.answer) {
    return {
      status: 'restart',
      failedQuestion: current,
      session: startRetoFinal(session.tableId, session.attempts),
    };
  }
  const index = session.index + 1;
  if (index === session.questions.length) {
    return { status: 'completed', session: { ...session, index } };
  }
  return { status: 'continue', session: { ...session, index } };
}
