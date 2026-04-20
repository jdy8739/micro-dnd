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

export const INITIAL_ENGINE_STATE: EngineState = {
  pointer: { x: 0, y: 0 },
  isDragging: false,
  activeId: null,
  overId: null,
};
