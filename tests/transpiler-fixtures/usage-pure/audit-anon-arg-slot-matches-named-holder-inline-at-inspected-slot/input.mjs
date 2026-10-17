export function inlineAtInspectedSlot() {
  return Object.keys({
    cells: [1, 2],
    read() {
      return this.cells.includes(1);
    }
  });
}
