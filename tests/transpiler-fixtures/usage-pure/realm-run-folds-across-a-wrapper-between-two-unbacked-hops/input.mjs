// a wrapper standing between two unbacked hops of a realm run asserts nothing about a value the run
// spells: the hop above reads through it, so the run folds whole like its bare twin - in a read,
// under a delete and as a write target alike
let held;
// @ts-expect-error a realm member the lib does not declare stands for any global the user adds
export const parenBetween = (globalThis.window).window.parenSlot;
export const castBetween = (globalThis.window as any).window.castSlot;
// @ts-expect-error a realm member the lib does not declare stands for any global the user adds
export const nonNullBetween = globalThis.window!.window.nonNullSlot;
// @ts-expect-error a realm member the lib does not declare stands for any global the user adds
export const deletedBetween = delete ((held = globalThis).window).window.deletedSlot;
// @ts-expect-error a realm member the lib does not declare stands for any global the user adds
(globalThis.window).window.writtenSlot = 1;
