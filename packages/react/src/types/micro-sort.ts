import type { EngineState, EngineStoreApi } from "@micro-dnd/core";
import type {
  Dispatch,
  PointerEvent as ReactPointerEvent,
  SetStateAction,
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

export type { DragDelta };
