import _globalThis from "@core-js/pure/actual/global-this";
// a wrapper standing between two unbacked hops of a realm run asserts nothing about a value the run
// spells: the hop above reads through it, so the run folds whole like its bare twin - in a read,
// under a delete and as a write target alike
let held;
export const parenBetween = _globalThis.parenSlot;
export const castBetween = _globalThis.castSlot;
export const nonNullBetween = _globalThis.nonNullSlot;
export const deletedBetween = delete (held = _globalThis, _globalThis).deletedSlot;
_globalThis.writtenSlot = 1;