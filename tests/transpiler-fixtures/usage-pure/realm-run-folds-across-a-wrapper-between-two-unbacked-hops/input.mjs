// a wrapper standing between two unbacked hops of a realm run asserts nothing about a value the run
// spells: the hop above reads through it, so the run folds whole like its bare twin - in a read,
// under a delete and as a write target alike
let held;
export const parenBetween = (globalThis.window).window.parenSlot;
export const castBetween = (globalThis.window as any).window.castSlot;
export const nonNullBetween = globalThis.window!.window.nonNullSlot;
export const deletedBetween = delete ((held = globalThis).window).window.deletedSlot;
(globalThis.window).window.writtenSlot = 1;
