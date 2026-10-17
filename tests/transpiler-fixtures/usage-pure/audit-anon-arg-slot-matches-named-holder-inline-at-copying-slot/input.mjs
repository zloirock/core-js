export function inlineAtCopyingSlot() {
  return Object.assign(target, {
    items: [1, 2],
    read() {
      return this.items.at(0);
    }
  });
}
