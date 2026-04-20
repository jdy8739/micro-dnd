export function reorderById<T>(
  items: T[],
  activeId: string,
  overId: string,
  getId: (item: T) => string,
): T[] {
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
