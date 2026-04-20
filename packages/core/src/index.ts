/**
 * @micro-dnd/core
 * The Engine: Tracking pointer events and calculating coordinates.
 */

/** Tracks the latest pointer coordinates in viewport space. */
export type PointerState = {
  /** Horizontal pointer coordinate (clientX). */
  x: number;
  /** Vertical pointer coordinate (clientY). */
  y: number;
};

/** Canonical mutable state for the drag engine. */
export type EngineState = {
  /** Current pointer position, updated in a rAF-batched loop while dragging. */
  pointer: PointerState;
  /** True while an item is actively being dragged. */
  isDragging: boolean;
  /** Identifier of the currently dragged item. */
  activeId: string | null;
  /** Identifier of the currently hovered droppable target. */
  overId: string | null;
};

/** Subscribes to state updates emitted by the engine store. */
export type Listener = (state: EngineState) => void;
/** Accepts either a partial state patch or a full-state updater function. */
export type StateUpdater = Partial<EngineState> | ((prev: EngineState) => EngineState);

/** Public API exposed by the drag engine store. */
export interface EngineStoreApi {
  /** Returns the latest engine state snapshot. */
  getState: () => EngineState;
  /** Applies a state patch or updater and notifies listeners when state changes. */
  setState: (updater: StateUpdater) => void;
  /** Registers a listener and returns an unsubscribe function. */
  subscribe: (listener: Listener) => () => void;
  /** Schedules pointer state updates to occur at most once per animation frame. */
  schedulePointerUpdate: (x: number, y: number) => void;
  /** Starts a drag session with an active item id and initial pointer coordinates. */
  startDrag: (id: string, x: number, y: number) => void;
  /** Queues pointer movement updates while a drag session is active. */
  movePointer: (x: number, y: number) => void;
  /** Ends the current drag session and clears drag-specific state. */
  endDrag: () => void;
  /** Cancels scheduled work and removes all listeners. */
  destroy: () => void;
}

const INITIAL_STATE: EngineState = {
  pointer: { x: 0, y: 0 },
  isDragging: false,
  activeId: null,
  overId: null,
};

type SchedulerToken = ReturnType<typeof globalThis.setTimeout> | number;

/** Internal scheduler abstraction that supports rAF and timeout fallback. */
type Scheduler = {
  /** Opaque timer identifier for rAF or timeout fallback. */
  schedule: (fn: () => void) => SchedulerToken;
  /** Cancels a previously scheduled callback token. */
  cancel: (id: SchedulerToken) => void;
};

/** Creates a frame scheduler using requestAnimationFrame when available. */
function createRafScheduler(): Scheduler {
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

/** Class-based implementation of the core drag engine store. */
export class EngineStore implements EngineStoreApi {
  /** Current mutable engine state snapshot. */
  private state: EngineState;
  /** Active listener set notified on state transitions. */
  private readonly listeners = new Set<Listener>();
  /** Runtime scheduler for frame-based pointer batching. */
  private readonly scheduler: Scheduler;
  /** Latest pointer update queued for the next frame flush. */
  private scheduledPointer: PointerState | null = null;
  /** Handle for the currently scheduled frame callback. */
  private frameId: SchedulerToken | null = null;

  /**
   * Initializes the engine with optional state overrides.
   * @param initialState Optional initial state patch used for hydration/testing.
   */
  constructor(initialState: Partial<EngineState> = {}) {
    this.state = {
      ...INITIAL_STATE,
      ...initialState,
      pointer: {
        ...INITIAL_STATE.pointer,
        ...initialState.pointer,
      },
    };
    this.scheduler = createRafScheduler();
  }

  /** Notifies all subscribers with the latest state snapshot. */
  private notify = () => {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  };

  /** Flushes the queued pointer coordinates into state on the scheduled frame. */
  private flushPointerUpdate = () => {
    this.frameId = null;
    if (!this.scheduledPointer) {
      return;
    }

    const nextPointer = this.scheduledPointer;
    this.scheduledPointer = null;

    this.setState((prev) => ({
      ...prev,
      pointer: nextPointer,
    }));
  };

  /** Returns the current engine state snapshot. */
  public getState = () => this.state;

  /**
   * Applies a state update and notifies listeners if the state identity changes.
   * @param updater Partial patch or updater function.
   */
  public setState = (updater: StateUpdater) => {
    const nextState =
      typeof updater === "function"
        ? updater(this.state)
        : {
            ...this.state,
            ...updater,
            pointer: updater.pointer
              ? { ...this.state.pointer, ...updater.pointer }
              : this.state.pointer,
          };

    if (Object.is(nextState, this.state)) {
      return;
    }

    this.state = nextState;
    this.notify();
  };

  /**
   * Subscribes to state changes.
   * @param listener Callback invoked after every state transition.
   * @returns Unsubscribe function that removes the listener.
   */
  public subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  /**
   * Queues pointer coordinates and schedules a single flush per frame.
   * @param x Horizontal pointer coordinate.
   * @param y Vertical pointer coordinate.
   */
  public schedulePointerUpdate = (x: number, y: number) => {
    this.scheduledPointer = { x, y };
    if (this.frameId !== null) {
      return;
    }

    this.frameId = this.scheduler.schedule(this.flushPointerUpdate);
  };

  /**
   * Marks drag start and sets the active id and initial pointer coordinates.
   * @param id Active draggable identifier.
   * @param x Horizontal pointer coordinate.
   * @param y Vertical pointer coordinate.
   */
  public startDrag = (id: string, x: number, y: number) => {
    this.setState((prev) => ({
      ...prev,
      activeId: id,
      isDragging: true,
      pointer: { x, y },
    }));
  };

  /**
   * Updates pointer position while dragging.
   * @param x Horizontal pointer coordinate.
   * @param y Vertical pointer coordinate.
   */
  public movePointer = (x: number, y: number) => {
    if (!this.state.isDragging) {
      return;
    }

    this.schedulePointerUpdate(x, y);
  };

  /** Ends drag mode and clears drag-specific identifiers. */
  public endDrag = () => {
    if (this.frameId !== null) {
      this.scheduler.cancel(this.frameId);
      this.frameId = null;
    }
    this.scheduledPointer = null;

    this.setState((prev) => ({
      ...prev,
      isDragging: false,
      activeId: null,
      overId: null,
    }));
  };

  /** Cancels pending frame work and detaches all listeners. */
  public destroy = () => {
    if (this.frameId !== null) {
      this.scheduler.cancel(this.frameId);
      this.frameId = null;
    }
    this.scheduledPointer = null;
    this.listeners.clear();
  };
}

/**
 * Creates a new engine store instance.
 * @param initialState Optional initial state patch.
 * @returns Engine store API instance.
 */
export function createEngineStore(initialState: Partial<EngineState> = {}): EngineStoreApi {
  return new EngineStore(initialState);
}
