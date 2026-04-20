import { describe, expect, it } from "vitest";

import { createEngineStore, type EngineState } from "./index";

const waitForFrame = (ms = 25) => new Promise<void>((resolve) => setTimeout(resolve, ms));

describe("createEngineStore", () => {
  it("initializes with defaults and applies partial initial state", () => {
    const store = createEngineStore({
      isDragging: true,
      pointer: { x: 12, y: 30 },
      activeId: "item-1",
    });

    expect(store.getState()).toEqual({
      pointer: { x: 12, y: 30 },
      isDragging: true,
      activeId: "item-1",
      overId: null,
    });
  });

  it("notifies subscribers and supports unsubscribe", () => {
    const store = createEngineStore();
    const received: EngineState[] = [];

    const unsubscribe = store.subscribe((state) => {
      received.push(state);
    });

    store.startDrag("item-1", 10, 20);
    expect(received).toHaveLength(1);
    expect(received[0]?.activeId).toBe("item-1");

    unsubscribe();
    store.endDrag();
    expect(received).toHaveLength(1);
  });

  it("coalesces multiple pointer updates into one frame flush", async () => {
    const store = createEngineStore();
    let notifications = 0;

    store.subscribe(() => {
      notifications += 1;
    });

    store.schedulePointerUpdate(10, 10);
    store.schedulePointerUpdate(15, 22);

    expect(notifications).toBe(0);

    await waitForFrame();

    expect(store.getState().pointer).toEqual({ x: 15, y: 22 });
    expect(notifications).toBe(1);
  });

  it("only moves pointer when dragging", async () => {
    const store = createEngineStore();

    store.movePointer(50, 50);
    await waitForFrame();
    expect(store.getState().pointer).toEqual({ x: 0, y: 0 });

    store.startDrag("item-1", 1, 2);
    store.movePointer(8, 13);
    await waitForFrame();

    expect(store.getState().pointer).toEqual({ x: 8, y: 13 });
  });

  it("cancels pending frame updates when drag ends", async () => {
    const store = createEngineStore();

    store.startDrag("item-1", 3, 4);
    store.movePointer(100, 200);
    store.endDrag();
    await waitForFrame();

    expect(store.getState()).toEqual({
      pointer: { x: 3, y: 4 },
      isDragging: false,
      activeId: null,
      overId: null,
    });
  });
});
