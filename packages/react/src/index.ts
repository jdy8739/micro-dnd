/**
 * @micro-dnd/react
 * The Adapter: Binding Core state to the React lifecycle.
 */

import { createEngineStore, type EngineState, type EngineStoreApi } from "@micro-dnd/core";
import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type Dispatch,
  type PointerEvent as ReactPointerEvent,
  type SetStateAction,
} from "react";

export type UseMicroSortOptions = {
  initialState?: Partial<EngineState>;
};

export type UseMicroSortResult = {
  state: EngineState;
  startDrag: EngineStoreApi["startDrag"];
  movePointer: EngineStoreApi["movePointer"];
  endDrag: EngineStoreApi["endDrag"];
  setOverId: (id: string | null) => void;
};

/**
 * React hook that subscribes to the core store and exposes drag actions.
 */
export function useMicroSort(options: UseMicroSortOptions = {}): UseMicroSortResult {
  const storeRef = useRef<EngineStoreApi | null>(null);

  if (!storeRef.current) {
    storeRef.current = createEngineStore(options.initialState);
  }

  const store = storeRef.current;

  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState);

  useEffect(() => {
    return () => {
      store.destroy();
    };
  }, [store]);

  const setOverId = (id: string | null) => {
    store.setState((prev) => ({
      ...prev,
      overId: id,
    }));
  };

  return {
    state,
    startDrag: store.startDrag,
    movePointer: store.movePointer,
    endDrag: store.endDrag,
    setOverId,
  };
}

type StartPointer = {
  x: number;
  y: number;
};

type DragDelta = {
  x: number;
  y: number;
};

export type MicroSortItemListeners = {
  "data-micro-dnd-id": string;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerLeave: (event: ReactPointerEvent<HTMLElement>) => void;
};

export type UseMicroSortableListOptions<T> = {
  items: T[];
  setItems: Dispatch<SetStateAction<T[]>>;
  getId?: (item: T) => string;
  initialState?: Partial<EngineState>;
};

export type UseMicroSortableListResult = {
  state: EngineState;
  activeDelta: DragDelta;
  getItemState: (id: string) => { isActive: boolean; isOver: boolean };
  getItemListeners: (id: string) => MicroSortItemListeners;
};

function reorderById<T>(items: T[], activeId: string, overId: string, getId: (item: T) => string): T[] {
  const fromIndex = items.findIndex((item) => getId(item) === activeId);
  const toIndex = items.findIndex((item) => getId(item) === overId);

  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
    return items;
  }

  const next = [...items];
  const fromItem = next[fromIndex];
  next[fromIndex] = next[toIndex];
  next[toIndex] = fromItem;
  return next;
}

/**
 * Convenience hook for sortable lists with built-in pointer listeners and reorder on drop.
 */
export function useMicroSortableList<T>(
  options: UseMicroSortableListOptions<T>,
): UseMicroSortableListResult {
  const { setItems, getId = (item) => (item as { id: string }).id, initialState } = options;
  const { state, startDrag, movePointer, endDrag, setOverId } = useMicroSort({ initialState });

  const dragStartRef = useRef<StartPointer | null>(null);
  const activeElementRef = useRef<HTMLElement | null>(null);

  const activeDelta: DragDelta =
    dragStartRef.current && state.isDragging
      ? {
          x: state.pointer.x - dragStartRef.current.x,
          y: state.pointer.y - dragStartRef.current.y,
        }
      : { x: 0, y: 0 };

  const findOverId = (x: number, y: number) => {
    const activeElement = activeElementRef.current;
    const previousPointerEvents = activeElement?.style.pointerEvents;

    if (activeElement) {
      activeElement.style.pointerEvents = "none";
    }

    const hit = document.elementFromPoint(x, y);

    if (activeElement) {
      activeElement.style.pointerEvents = previousPointerEvents ?? "";
    }

    return hit?.closest<HTMLElement>("[data-micro-dnd-id]")?.dataset.microDndId ?? null;
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!state.isDragging) {
      return;
    }

    movePointer(event.clientX, event.clientY);
    setOverId(findOverId(event.clientX, event.clientY));
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLElement>) => {
    if (!state.isDragging) {
      return;
    }

    const activeId = state.activeId;
    const overId = state.overId;

    if (activeId && overId && activeId !== overId) {
      setItems((prev) => reorderById(prev, activeId, overId, getId));
    }

    const currentTarget = event.currentTarget;
    if (currentTarget.hasPointerCapture(event.pointerId)) {
      currentTarget.releasePointerCapture(event.pointerId);
    }

    endDrag();
    setOverId(null);
    dragStartRef.current = null;
    activeElementRef.current = null;
  };

  const getItemListeners = (id: string): MicroSortItemListeners => ({
    "data-micro-dnd-id": id,
    onPointerDown: (event) => {
      const currentTarget = event.currentTarget;
      currentTarget.setPointerCapture(event.pointerId);
      activeElementRef.current = currentTarget;
      dragStartRef.current = { x: event.clientX, y: event.clientY };
      startDrag(id, event.clientX, event.clientY);
      setOverId(id);
    },
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerEnd,
    onPointerCancel: handlePointerEnd,
    onPointerLeave: handlePointerMove,
  });

  const getItemState = (id: string) => ({
    isActive: state.activeId === id,
    isOver: state.overId === id,
  });

  return {
    state,
    activeDelta,
    getItemState,
    getItemListeners,
  };
}
