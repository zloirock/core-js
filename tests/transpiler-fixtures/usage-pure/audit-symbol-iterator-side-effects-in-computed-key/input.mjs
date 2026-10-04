// A computed symbol key carries effects after the receiver has been selected.
// Iterator reads and calls use that unchanged receiver, including argument-call this.
// Optional access skips the key effects when the receiver is nullish.
export const a = obj[(probe(), Symbol.iterator)];
export const b = obj[(probe(), Symbol.iterator)]();
export const c = obj[(probe(), Symbol.iterator)](42);
export const d = obj[(probe1(), probe2(), Symbol.iterator)];
export const e = obj?.[(probe(), Symbol.iterator)]();
