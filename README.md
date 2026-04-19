# 📦 micro-dnd

> The math-driven drag-and-drop engine. **Zero reflow, maximum performance.**

`micro-dnd` is a response to the bloat of modern DnD libraries. We stripped away the heavy DOM abstractions to focus on what matters: mathematical precision and GPU-accelerated performance. All **under 5KB**.

---

## ✨ Core Philosophy

### 1. Zero-Reflow Architecture
Traditional libraries physically move DOM elements, forcing constant layout recalculations. `micro-dnd` treats the DOM as a static target. It calculates movement via CSS Variables and `transform: translate3d`, delegating the heavy lifting to the GPU for a consistent 60fps experience.

### 2. Predictive Vector Indexing
Beyond basic collision detection, `micro-dnd` analyzes the pointer's velocity and direction. It calculates a "Predicted Index"—a mathematical hint that makes the UI feel "snappy" and intelligent by anticipating the user's intent before they even release the mouse.

### 3. Accessible by Design
Performance shouldn't come at the cost of inclusion. `micro-dnd` provides built-in support for Keyboard Navigation and ARIA Live Regions, ensuring your ultra-light interface remains usable for everyone.

### 4. Truly Headless
We provide the logic; you provide the soul. `micro-dnd` is framework-agnostic and unstyled. It manages coordinates and indices, while you handle the visuals using your favorite tools (React, Vue, Svelte, or Vanilla CSS).

---

## 🛠️ Technical Edge

| Feature | Existing Libraries (dnd-kit, rb-dnd) | micro-dnd |
| :--- | :--- | :--- |
| **Bundle Size** | 15KB ~ 60KB+ | **< 5KB (Gzipped)** |
| **Rendering** | Context & Component-based | Headless Logic / CSS Vars |
| **Performance** | Frequent Reflows / Re-renders | **Zero-Reflow (GPU only)** |
| **Input Support** | Complex Sensor Abstractions | Native Pointer Events & Kbd |
| **Learning Curve** | High (Contexts, Strategies) | Minimal (State-in, Index-out) |

---

## 🚀 Roadmap

- **Phase 1: The Engine** – Pointer tracking & sub-millisecond hit testing.
- **Phase 2: Prediction** – Vector-based indexing logic for fluid reordering.
- **Phase 3: Inclusion** – First-class Keyboard and Screen Reader support.
- **Phase 4: Adapters** – Lightweight hooks for React, Vue, and Svelte.
- **Phase 5: Motion** – CSS Variable-driven animation guidelines.

---

## 💡 A Note for Developers

> "We don't build your UI. We provide the mathematics of motion. You decide the style."
