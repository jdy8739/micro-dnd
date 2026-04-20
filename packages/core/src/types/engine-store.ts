import type { EngineState } from "./engine-state";

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
