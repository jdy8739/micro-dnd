import { useRef, type PointerEvent as ReactPointerEvent } from "react";

import { findOverId } from "../lib/find-over-id";
import { reorderById } from "../model/reorder-by-id";
import type {
  DragDelta,
  MicroSortItemListeners,
  UseMicroSortableListOptions,
  UseMicroSortableListResult,
} from "../types/micro-sort";
import { useMicroSort } from "./use-micro-sort";

type StartPointer = {
  x: number;
  y: number;
};

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

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!state.isDragging) {
      return;
    }

    movePointer(event.clientX, event.clientY);
    setOverId(findOverId(event.clientX, event.clientY, activeElementRef.current));
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
