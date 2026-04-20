export type SchedulerToken = ReturnType<typeof globalThis.setTimeout> | number;

/** Internal scheduler abstraction that supports rAF and timeout fallback. */
export type Scheduler = {
  /** Opaque timer identifier for rAF or timeout fallback. */
  schedule: (fn: () => void) => SchedulerToken;
  /** Cancels a previously scheduled callback token. */
  cancel: (id: SchedulerToken) => void;
};

/** Creates a frame scheduler using requestAnimationFrame when available. */
export function createRafScheduler(): Scheduler {
  const raf = globalThis.requestAnimationFrame?.bind(globalThis);
  const cancelRaf = globalThis.cancelAnimationFrame?.bind(globalThis);

  if (raf && cancelRaf) {
    return {
      schedule: (fn: () => void) => raf(fn),
      cancel: (id: SchedulerToken) => cancelRaf(id as number),
    };
  }

  return {
    schedule: (fn: () => void) => globalThis.setTimeout(fn, 16),
    cancel: (id: SchedulerToken) => globalThis.clearTimeout(id),
  };
}
