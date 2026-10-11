import _globalThis from "@core-js/pure/actual/global-this";
// a paren closing over part of a deleted navigation holds a value of its own only where a guard
// decides whether the delete happens. under a delete that folds the run whole it hides nothing,
// and the span folds through it like the paren-less twin
let held;
export const sealedStoredRun = delete (held = _globalThis, _globalThis).sealedSlot;