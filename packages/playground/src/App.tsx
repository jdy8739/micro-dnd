import { useState, type CSSProperties } from "react";

import { useMicroSortableList } from "@micro-dnd/react";

const ITEMS = [
  { id: "item-1", label: "Calibrate pointer store" },
  { id: "item-2", label: "Tune frame batching" },
  { id: "item-3", label: "Add collision math" },
  { id: "item-4", label: "Ship adapter ergonomics" },
];

const appStyle: CSSProperties = {
  minHeight: "100vh",
  margin: 0,
  padding: "2rem",
  background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
  color: "#e5e7eb",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const panelStyle: CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  background: "rgba(17, 24, 39, 0.65)",
  border: "1px solid rgba(148, 163, 184, 0.25)",
  borderRadius: 16,
  padding: "1rem 1rem 1.25rem",
  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.35)",
};

const listStyle: CSSProperties = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "grid",
  gap: "0.75rem",
};

export function App() {
  const [items, setItems] = useState(ITEMS);
  const { state, activeDelta, getItemState, getItemListeners } = useMicroSortableList({
    items,
    setItems,
  });

  return (
    <main style={appStyle}>
      <section style={panelStyle}>
        <h1 style={{ marginTop: 0, marginBottom: "0.75rem", fontSize: "1.25rem" }}>
          micro-dnd test view
        </h1>
        <p style={{ marginTop: 0, color: "#cbd5e1", fontSize: "0.95rem" }}>
          Press and drag a card. This page verifies pointer tracking, active item state, and hover
          target updates through the current `useMicroSort` hook.
        </p>

        <ul style={listStyle}>
          {items.map((item) => {
            const { isActive, isOver } = getItemState(item.id);

            return (
              <li
                key={item.id}
                {...getItemListeners(item.id)}
                style={{
                  borderRadius: 12,
                  border: isActive
                    ? "1px solid rgba(34, 211, 238, 0.9)"
                    : isOver
                      ? "1px solid rgba(139, 92, 246, 0.85)"
                      : "1px solid rgba(148, 163, 184, 0.3)",
                  padding: "0.9rem 1rem",
                  background: isActive
                    ? "rgba(6, 182, 212, 0.14)"
                    : isOver
                      ? "rgba(139, 92, 246, 0.15)"
                      : "rgba(15, 23, 42, 0.75)",
                  transform:
                    isActive && state.isDragging
                      ? `translate3d(${activeDelta.x}px, ${activeDelta.y}px, 0)`
                      : "translate3d(0, 0, 0)",
                  transition: state.isDragging ? "none" : "transform 140ms ease-out",
                  cursor: "grab",
                  userSelect: "none",
                  touchAction: "none",
                  pointerEvents: isActive && state.isDragging ? "none" : "auto",
                  willChange: "transform",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: "0.35rem" }}>{item.label}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>id: {item.id}</div>
              </li>
            );
          })}
        </ul>

        <pre
          style={{
            marginBottom: 0,
            marginTop: "1rem",
            borderRadius: 12,
            background: "rgba(2, 6, 23, 0.75)",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            padding: "0.75rem",
            fontSize: "0.85rem",
            color: "#cbd5e1",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(state, null, 2)}
        </pre>
      </section>
    </main>
  );
}
