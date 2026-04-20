import { createEngineStore, type EngineStoreApi } from "@micro-dnd/core";
import { useEffect, useRef, useSyncExternalStore } from "react";

import type { UseMicroSortOptions, UseMicroSortResult } from "../types/micro-sort";

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
