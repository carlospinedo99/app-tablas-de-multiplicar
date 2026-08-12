// Barra de tiempo suave para Juego 3 y Reto Final (8-10s por pregunta, sin sonido de alarma).
export function createSoftTimer({ durationMs = 9000, onTick, onTimeout }) {
  let rafId = null;
  let startedAt = null;
  let stopped = false;

  function tick(now) {
    if (stopped) return;
    const elapsed = now - startedAt;
    const remaining = Math.max(0, durationMs - elapsed);
    const fraction = remaining / durationMs;
    onTick?.(fraction);
    if (remaining <= 0) {
      stopped = true;
      onTimeout?.();
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  return {
    start() {
      stopped = false;
      startedAt = performance.now();
      rafId = requestAnimationFrame(tick);
    },
    stop() {
      stopped = true;
      if (rafId) cancelAnimationFrame(rafId);
    },
  };
}
