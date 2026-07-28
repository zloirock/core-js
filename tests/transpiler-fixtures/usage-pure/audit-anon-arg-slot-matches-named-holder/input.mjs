// an object written INLINE at a call argument has to read exactly like the same object bound to a
// name first - both walks ask one shared question about the slot, and it has three layers: the
// callee must inspect rather than copy the object's own properties out, it must not mutate that
// slot, and an identity-returning callee must not have its result held. one row per layer, plus the
// named baseline they are compared against. distinct method per row so each narrow is attributable
export function namedHolderAtInspectedSlot() {
  const held = {
    rows: [1, 2],
    read() {
      return this.rows.at(0);
    }
  };
  return Object.keys(held);
}
export function inlineAtInspectedSlot() {
  return Object.keys({
    cells: [1, 2],
    read() {
      return this.cells.includes(1);
    }
  });
}
export function inlineAtCopyingSlot() {
  return Object.assign(target, {
    items: [1, 2],
    read() {
      return this.items.at(0);
    }
  });
}
export function inlineWithHeldIdentityResult() {
  return Object.freeze({
    entries: [1, 2],
    read() {
      return this.entries.includes(1);
    }
  });
}
