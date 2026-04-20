export function findOverId(
  x: number,
  y: number,
  activeElement: HTMLElement | null,
): string | null {
  const previousPointerEvents = activeElement?.style.pointerEvents;

  if (activeElement) {
    activeElement.style.pointerEvents = "none";
  }

  const hit = document.elementFromPoint(x, y);

  if (activeElement) {
    activeElement.style.pointerEvents = previousPointerEvents ?? "";
  }

  return hit?.closest<HTMLElement>("[data-micro-dnd-id]")?.dataset.microDndId ?? null;
}
